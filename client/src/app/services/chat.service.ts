/* eslint-disable max-lines */
import { EventEmitter, Injectable, Injector, NgZone } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Decision } from '@common/communication/friend-request';
import { FriendsList, FriendStatus } from '@common/communication/friends';
import { Difficulty, GameType } from '@common/communication/lobby';
import { ChatRoomType } from '@models/chat/chat-room';
import { ChatState } from '@models/chat/chat-state';
import { ElectronService } from 'ngx-electron';
import { Subscription } from 'rxjs';
import { ChatMessage, Message, SystemMessage } from '../../../../common/communication/chat-message';
import { APIService } from './api.service';
import { GameService } from './game.service';
import { SocketService } from './socket-service.service';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class ChatService {
  // private static GENERAL_ROOM_NAME: string = 'Général';
  private static GAME_ROOM_NAME: string = 'Partie';
  private static GENERAL_ROOM_NAME: string = 'Général';

  messageSubscription: Subscription;
  privateMessageSubscription: Subscription;
  chatRoomMessageSubscription: Subscription;
  chatRoomImInSubscription: Subscription;
  guessSubscription: Subscription;
  playerConnectionSubscription: Subscription;
  playerDisconnectionSubscription: Subscription;
  friendslistSocketSubscription: Subscription;
  friendslistAPISubscription: Subscription;
  chatRoomsSubscription: Subscription;
  canGuessChangedSubscription: Subscription;
  invitationSubscription: Subscription;

  chatRoomChanged: EventEmitter<void>;
  chatPoppedOut: boolean;

  socketService: SocketService;
  gameService: GameService;

  chatState: ChatState;

  constructor(
    private apiService: APIService,
    private userService: UserService,
    private router: Router,
    private electronService: ElectronService,
    private injector: Injector,
    private nz: NgZone,
    private snackBar: MatSnackBar,
  ) {
    this.chatState = {
      rooms: [],
      joinableRooms: [],
      friends: [],
      friendRequests: [],
      currentRoomIndex: 0,
      canGuess: false,
      guessing: false,
      friendslistOpened: false,
      chatRoomsOpened: false,
    };

    // Popped out Electron
    if (this.shouldUseMainProcess) {
      this.electronService.ipcRenderer.on('chat-update', (event, arg) => {
        this.nz.run(() => {
          this.chatState = arg;
        });
      });
    } else {
      this.socketService = this.injector.get(SocketService) as SocketService;
      this.gameService = this.injector.get(GameService) as GameService;
      this.initSubscriptions();
    }

    // Main Electron
    if (this.electronService.isElectronApp && !this.standalone) {
      this.electronService.ipcRenderer.on('chat-ready', () => {
        this.chatPoppedOut = true;
        this.updatePoppedOutChat();
      });
      this.electronService.ipcRenderer.on('chat-closed', () => {
        this.chatPoppedOut = false;
      });
      this.electronService.ipcRenderer.on('chat-action-send-message', (event, arg) => {
        this.sendMessage(arg);
      });
      this.electronService.ipcRenderer.on('chat-action-send-guess', (event, arg) => {
        this.sendGuess(arg);
      });
      this.electronService.ipcRenderer.on('chat-action-close-room', (event, arg) => {
        this.closeRoom(arg);
      });
      this.electronService.ipcRenderer.on('chat-action-focus-room', (event, arg) => {
        this.focusRoom(arg);
      });
      this.electronService.ipcRenderer.on('chat-action-toggle-guess', (event, arg) => {
        this.toggleGuessMode();
      });
      this.electronService.ipcRenderer.on('chat-action-toggle-friends', (event, arg) => {
        this.toggleFriendslist();
      });
      this.electronService.ipcRenderer.on('chat-action-toggle-rooms', (event, arg) => {
        this.toggleChatRooms();
      });
      this.electronService.ipcRenderer.on('chat-action-create-dm', (event, arg) => {
        this.createDM(arg.friendUsername, arg.friendId);
      });
      this.electronService.ipcRenderer.on('chat-action-create-room', (event, arg) => {
        this.createChatRoom(arg);
      });
      this.electronService.ipcRenderer.on('chat-action-delete-room', (event, arg) => {
        this.deleteChatRoom(arg);
      });
      this.electronService.ipcRenderer.on('chat-action-join-room', (event, arg) => {
        this.joinChatRoom(arg);
      });
      this.electronService.ipcRenderer.on('chat-action-leave-room', (event, arg) => {
        this.leaveChatRoom(arg);
      });
      this.electronService.ipcRenderer.on('chat-action-add-friend', (event, arg) => {
        this.addFriend(arg);
      });
      this.electronService.ipcRenderer.on('chat-action-remove-friend', (event, arg) => {
        this.removeFriend(arg);
      });
      this.electronService.ipcRenderer.on('chat-action-confirm-friend', (event, arg) => {
        this.confirmFriend(arg);
      });
      this.electronService.ipcRenderer.on('chat-action-reject-friend', (event, arg) => {
        this.rejectFriend(arg);
      });
      this.electronService.ipcRenderer.on('chat-action-invite-friend', (event, arg) => {
        this.inviteFriend(arg);
      });
    }

    this.chatRoomChanged = new EventEmitter<void>();
    this.chatState.rooms.push({ name: ChatService.GAME_ROOM_NAME, id: '', type: ChatRoomType.GAME, messages: [] });
    this.chatState.currentRoomIndex = 0;

    this.apiService.getFriendsList().then((friendslist) => {
      this.updateFriendsList(friendslist);
    });
  }

  initSubscriptions() {
    this.messageSubscription = this.socketService.receiveMessage().subscribe((message) => {
      const roomIndex = this.chatState.rooms.findIndex((room) => room.type === ChatRoomType.GAME);
      if (roomIndex > -1) {
        this.chatState.rooms[roomIndex].messages.push(message);
      }

      this.chatRoomChanged.emit();
      this.updatePoppedOutChat();
    });

    this.invitationSubscription = this.socketService.receiveFriendInvites().subscribe((invitation) => {
      this.snackBar
        .open(`${invitation.username} vous a invité.`, 'Rejoindre', {
          duration: 15000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        })
        .afterDismissed()
        .subscribe(() => {
          this.socketService.joinLobby(invitation.lobbyId);
          this.gameService.setGameInfo(GameType.CLASSIC, Difficulty.EASY, true);
          this.router.navigate(['/lobby']);
        });
    });

    this.socketService.getRoomMessageHistory('general').subscribe((chatRoomHistory) => {
      const messages: Message[] = [];
      for (const message of chatRoomHistory.messages) {
        messages.push({ timestamp: message.timestamp, senderUsername: message.senderUsername, content: message.content } as ChatMessage);
      }
      this.chatState.rooms.push({ name: ChatService.GENERAL_ROOM_NAME, id: '', type: ChatRoomType.GENERAL, messages });
    });

    this.guessSubscription = this.socketService.receiveGuess().subscribe((message) => {
      const roomIndex = this.chatState.rooms.findIndex((room) => room.type === ChatRoomType.GAME);
      if (roomIndex > -1) {
        this.chatState.rooms[roomIndex].messages.push(message);
      }
      this.updatePoppedOutChat();
    });

    this.privateMessageSubscription = this.socketService.receivePrivateMessage().subscribe((privateMessage) => {
      let roomIndex = -1;
      const isSender: boolean = privateMessage.senderAccountId === this.userService.account._id;

      if (isSender) {
        roomIndex = this.chatState.rooms.findIndex((room) => room.id === privateMessage.receiverAccountId);
      } else {
        roomIndex = this.chatState.rooms.findIndex((room) => room.id === privateMessage.senderAccountId);
      }

      if (roomIndex === -1) {
        this.apiService
          .getPublicAccount(privateMessage.senderAccountId)
          .then((accountInfo) => {
            this.chatState.rooms.push({
              name: accountInfo.username,
              id: privateMessage.senderAccountId,
              type: ChatRoomType.PRIVATE,
              messages: [],
            });
            roomIndex = this.chatState.rooms.length - 1;

            this.chatState.rooms[roomIndex].messages.push({
              senderUsername: accountInfo.username,
              content: privateMessage.content,
              timestamp: privateMessage.timestamp,
            } as ChatMessage);
          })
          .catch();
      } else {
        this.chatState.rooms[roomIndex].messages.push({
          senderUsername: isSender ? this.userService.account.username : this.chatState.rooms[roomIndex].name,
          content: privateMessage.content,
          timestamp: privateMessage.timestamp,
        } as ChatMessage);
      }

      this.chatRoomChanged.emit();
      this.updatePoppedOutChat();
    });

    this.chatRoomMessageSubscription = this.socketService.receiveChatRoomMessage().subscribe((chatRoomMessage) => {
      if (chatRoomMessage.roomName === 'general') {
        const roomIndex = this.chatState.rooms.findIndex((room) => room.type === ChatRoomType.GENERAL);
        this.chatState.rooms[roomIndex].messages.push({
          senderUsername: chatRoomMessage.senderUsername,
          timestamp: chatRoomMessage.timestamp,
          content: chatRoomMessage.content,
        } as ChatMessage);
      } else {
        let roomIndex = this.chatState.rooms.findIndex((room) => room.name === chatRoomMessage.roomName);

        if (roomIndex === -1) {
          this.socketService.getRoomMessageHistory(chatRoomMessage.roomName).subscribe((chatRoomHistory) => {
            const messages: Message[] = [];
            for (const message of chatRoomHistory.messages) {
              messages.push({
                content: message.content,
                senderUsername: message.senderUsername,
                timestamp: message.timestamp,
              } as ChatMessage);
            }
            this.chatState.rooms.push({ name: chatRoomMessage.roomName, id: '', type: ChatRoomType.GROUP, messages });
            this.focusRoom(chatRoomMessage.roomName);
          });
        } else {
          roomIndex = this.chatState.rooms.findIndex((room) => room.name === chatRoomMessage.roomName);

          if (chatRoomMessage.senderUsername) {
            this.chatState.rooms[roomIndex].messages.push({
              content: chatRoomMessage.content,
              senderUsername: chatRoomMessage.senderUsername,
              timestamp: chatRoomMessage.timestamp,
            } as ChatMessage);
          } else {
            this.chatState.rooms[roomIndex].messages.push({
              content: chatRoomMessage.content,
              timestamp: chatRoomMessage.timestamp,
            } as SystemMessage);
          }
        }
      }

      this.chatRoomChanged.emit();
      this.updatePoppedOutChat();
    });

    this.playerConnectionSubscription = this.socketService.receivePlayerConnections().subscribe((message) => {
      this.handleMessage(message);
      this.updatePoppedOutChat();
    });

    this.playerDisconnectionSubscription = this.socketService.receivePlayerDisconnections().subscribe((message) => {
      this.handleMessage(message);
      this.updatePoppedOutChat();
    });

    this.friendslistSocketSubscription = this.socketService.receiveFriendslist().subscribe((friendslist) => {
      this.updateFriendsList(friendslist);
      this.updatePoppedOutChat();
    });

    this.friendslistAPISubscription = this.apiService.friendslistUpdated.subscribe((friendslist: FriendsList) => {
      this.updateFriendsList(friendslist);
      this.updatePoppedOutChat();
    });

    this.chatRoomsSubscription = this.socketService.receiveChatRooms().subscribe((chatRooms) => {
      for (const chatRoom of chatRooms) {
        if (chatRoom !== 'general') {
          this.chatState.joinableRooms.push(chatRoom);
        }
      }
      this.updatePoppedOutChat();
    });

    this.canGuessChangedSubscription = this.gameService.canGuessChanged.subscribe(() => {
      this.chatState.canGuess = this.gameService.canGuess;
      this.updatePoppedOutChat();
    });
  }

  updateFriendsList(friendslist: FriendsList) {
    this.chatState.friends = [];
    this.chatState.friendRequests = [];
    for (const user of friendslist.friends) {
      if (user.status === FriendStatus.FRIEND) {
        this.chatState.friends.push(user);
      } else if (user.status === FriendStatus.PENDING) {
        this.chatState.friendRequests.push(user);
      }
    }
  }

  handleMessage(message: Message) {
    console.log(message);
  }

  sendMessage(text: string) {
    if (this.shouldUseMainProcess) {
      this.electronService.ipcRenderer.send('chat-action-send-message', text);
    } else {
      const room = this.chatState.rooms[this.chatState.currentRoomIndex];
      if (room.type === ChatRoomType.GAME) {
        this.socketService.sendMessage(text);
      } else if (room.type === ChatRoomType.GENERAL) {
        this.socketService.sendRoomMessage(text, 'general');
      } else if (room.type === ChatRoomType.GROUP) {
        this.socketService.sendRoomMessage(text, room.name);
      } else if (room.type === ChatRoomType.PRIVATE) {
        this.socketService.sendPrivateMessage(text, room.id);
      }
      this.updatePoppedOutChat();
    }
  }

  toggleGuessMode() {
    if (this.shouldUseMainProcess) {
      this.electronService.ipcRenderer.send('chat-action-toggle-guess');
    } else {
      this.chatState.guessing = !this.chatState.guessing;
      this.updatePoppedOutChat();
    }
  }

  toggleFriendslist() {
    if (this.shouldUseMainProcess) {
      this.electronService.ipcRenderer.send('chat-action-toggle-friends');
    } else {
      this.chatState.friendslistOpened = !this.chatState.friendslistOpened;
      this.chatState.chatRoomsOpened = false;
      this.updatePoppedOutChat();
    }
  }

  toggleChatRooms() {
    if (this.shouldUseMainProcess) {
      this.electronService.ipcRenderer.send('chat-action-toggle-rooms');
    } else {
      this.chatState.chatRoomsOpened = !this.chatState.chatRoomsOpened;
      this.chatState.friendslistOpened = false;
      this.updatePoppedOutChat();
    }
  }

  sendGuess(text: string) {
    if (this.shouldUseMainProcess) {
      this.electronService.ipcRenderer.send('chat-action-send-guess', text);
    } else {
      this.socketService.sendGuess(text);
      this.chatState.guessing = false;
      this.updatePoppedOutChat();
    }
  }

  closeRoom(roomName: string) {
    if (this.shouldUseMainProcess) {
      this.electronService.ipcRenderer.send('chat-action-close-room', roomName);
    } else {
      const roomIndex = this.chatState.rooms.findIndex((room) => room.name === roomName);
      if (roomIndex > -1) {
        this.chatState.rooms.splice(roomIndex, 1);
        this.chatState.currentRoomIndex = 0;
        this.chatRoomChanged.emit();
        this.updatePoppedOutChat();
      }
    }
  }

  focusRoom(roomName: string) {
    if (this.shouldUseMainProcess) {
      this.electronService.ipcRenderer.send('chat-action-focus-room', roomName);
    } else {
      const roomIndex = this.chatState.rooms.findIndex((room) => room.name === roomName);
      if (roomIndex > -1) {
        this.chatState.currentRoomIndex = roomIndex;
        this.chatRoomChanged.emit();
        this.updatePoppedOutChat();
      }
    }
  }

  resetGameMessages() {
    const roomIndex = this.chatState.rooms.findIndex((room) => room.type === ChatRoomType.GAME);
    if (roomIndex > -1) {
      this.chatState.rooms[roomIndex].messages = [];
    }
  }

  createDM(friendUsername: string, friendId: string) {
    if (this.shouldUseMainProcess) {
      this.electronService.ipcRenderer.send('chat-action-create-dm', { friendUsername, friendId });
    } else if (this.chatState.rooms.findIndex((room) => room.name === friendUsername) === -1) {
      this.apiService
        .getPrivateMessageHistory(friendId)
        .then((privateMessages) => {
          const chatMessages: ChatMessage[] = [];
          for (const privateMessage of privateMessages) {
            chatMessages.push({
              senderUsername:
                privateMessage.senderAccountId === this.userService.account._id ? this.userService.account.username : friendUsername,
              content: privateMessage.content,
              timestamp: privateMessage.timestamp,
            });
          }
          this.chatState.rooms.push({ type: ChatRoomType.PRIVATE, name: friendUsername, id: friendId, messages: chatMessages });
          this.focusRoom(friendUsername);
          this.chatState.friendslistOpened = false;
          this.chatRoomChanged.emit();
          this.updatePoppedOutChat();
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  inviteFriend(friendId: string) {
    if (this.shouldUseMainProcess) {
      this.electronService.ipcRenderer.send('chat-action-invite-friend', friendId);
    } else {
      this.socketService.inviteFriend(friendId);
      this.updatePoppedOutChat();
    }
  }

  addFriend(username: string) {
    if (this.shouldUseMainProcess) {
      this.electronService.ipcRenderer.send('chat-action-add-friend', username);
    } else {
      this.apiService.addFriend(username);
      this.updatePoppedOutChat();
    }
  }

  confirmFriend(friendId: string) {
    if (this.shouldUseMainProcess) {
      this.electronService.ipcRenderer.send('chat-action-confirm-friend', friendId);
    } else {
      this.apiService.sendFriendDecision(friendId, Decision.ACCEPT);
      this.updatePoppedOutChat();
    }
  }

  rejectFriend(friendId: string) {
    if (this.shouldUseMainProcess) {
      this.electronService.ipcRenderer.send('chat-action-reject-friend', friendId);
    } else {
      this.apiService.sendFriendDecision(friendId, Decision.REFUSE);
      this.updatePoppedOutChat();
    }
  }

  removeFriend(friendId: string) {
    if (this.shouldUseMainProcess) {
      this.electronService.ipcRenderer.send('chat-action-remove-friend', friendId);
    } else {
      this.apiService.removeFriend(friendId);
      this.updatePoppedOutChat();
    }
  }

  createChatRoom(roomName: string) {
    if (this.shouldUseMainProcess) {
      this.electronService.ipcRenderer.send('chat-action-create-room', roomName);
    } else {
      this.socketService.createChatRoom(roomName).then(() => {
        this.updatePoppedOutChat();
      });
    }
  }

  joinChatRoom(roomName: string) {
    if (this.shouldUseMainProcess) {
      this.electronService.ipcRenderer.send('chat-action-join-room', roomName);
    } else {
      this.socketService.joinChatRoom(roomName).then(() => {
        this.chatState.currentRoomIndex = this.chatState.rooms.findIndex((room) => room.name === roomName);
        this.chatState.chatRoomsOpened = false;
        this.chatRoomChanged.emit();
        this.updatePoppedOutChat();
      });
    }
  }

  leaveChatRoom(roomName: string) {
    if (this.shouldUseMainProcess) {
      this.electronService.ipcRenderer.send('chat-action-leave-room', roomName);
    } else {
      this.socketService.leaveChatRoom(roomName).then(() => {
        this.closeRoom(roomName);
        this.updatePoppedOutChat();
      });
    }
  }

  deleteChatRoom(roomName: string) {
    if (this.shouldUseMainProcess) {
      this.electronService.ipcRenderer.send('chat-action-delete-room', roomName);
    } else {
      this.socketService.deleteChatRoom(roomName).then(() => {
        this.closeRoom(roomName);
        this.updatePoppedOutChat();
      });
    }
  }

  get messages() {
    if (this.chatState.rooms[this.chatState.currentRoomIndex]) {
      return this.chatState.rooms[this.chatState.currentRoomIndex].messages;
    } else {
      return [];
    }
  }

  get roomName() {
    if (this.chatState.rooms[this.chatState.currentRoomIndex]) {
      return this.chatState.rooms[this.chatState.currentRoomIndex].name;
    } else {
      return null;
    }
  }

  get canGuess(): boolean {
    const currentRoom = this.chatState.rooms[this.chatState.currentRoomIndex];
    if (currentRoom) return this.chatState.canGuess && currentRoom.type === ChatRoomType.GAME;
    else return false;
  }

  get standalone(): boolean {
    return this.router.url === '/chat';
  }

  updatePoppedOutChat() {
    if (this.chatPoppedOut) {
      this.electronService.ipcRenderer.send('chat-update', this.chatState);
    }
  }

  get shouldUseMainProcess(): boolean {
    return this.electronService.isElectronApp && this.standalone;
  }

  popOut() {
    this.electronService.ipcRenderer.send('chat-init');
  }
}
