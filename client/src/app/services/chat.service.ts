/* eslint-disable max-lines */
import { EventEmitter, Injectable, Injector, NgZone } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Decision } from '@common/communication/friend-request';
import { FriendsList, FriendStatus } from '@common/communication/friends';
import { FriendNotification, NotificationType } from '@common/socketendpoints/socket-friend-actions';
import { ChatRoomType } from '@models/chat/chat-room';
import { ChatState } from '@models/chat/chat-state';
import { ElectronService } from 'ngx-electron';
import { Subscription } from 'rxjs';
import { ChatMessage, Message, SystemMessage } from '../../../../common/communication/chat-message';
import { APIService } from './api.service';
import { AudiovisualService, GameSound } from './audiovisual.service';
import { GameService } from './game.service';
import { SocketService } from './socket-service.service';
import { TutorialService, TutorialStep } from './tutorial.service';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private static GAME_ROOM_NAME: string = 'Partie';
  private static GENERAL_ROOM_NAME: string = 'Général';

  subscriptions: Subscription[] = [];

  socketInitiatedSubscription: Subscription;
  loggedInSubscription: Subscription;
  loggedOutSubscription: Subscription;

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
    private audiovisualService: AudiovisualService,
    private tutorialService: TutorialService,
  ) {
    this.initChatState();

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

      this.initMainChat();

      this.socketInitiatedSubscription = this.socketService.socketInitiated.subscribe(() => {
        this.initMainChat();
      });

      this.loggedOutSubscription = this.userService.loggedOut.subscribe(() => {
        this.initMainChat();
      });

      this.loggedInSubscription = this.userService.loggedIn.subscribe(() => {
        this.initMainChat();
      });
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
  }

  initSubscriptions() {
    this.clearSubscriptions();

    this.subscriptions.push(
      this.socketService.receiveMessage().subscribe((message) => {
        const roomIndex = this.chatState.rooms.findIndex((room) => room.type === ChatRoomType.GAME);
        if (roomIndex > -1) {
          this.chatState.rooms[roomIndex].messages.push(message);
        }

        this.chatRoomChanged.emit();
        this.updatePoppedOutChat();
      }),
    );

    this.subscriptions.push(
      this.socketService.receiveFriendInvites().subscribe((invitation) => {
        this.snackBar
          .open(`${invitation.username} vous a invité.`, 'Rejoindre', {
            duration: 15000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
          })
          .afterDismissed()
          .subscribe((action) => {
            if (action.dismissedByAction) {
              this.socketService.joinLobby(invitation.lobbyId).then((lobbyInfo) => {
                this.gameService.setGameInfo(lobbyInfo);
                this.router.navigate([`/lobby/${lobbyInfo.lobbyId}`]);
              });
            }
          });
        this.audiovisualService.playSound(GameSound.INVITATION_RECEIVED);
      }),
    );

    this.subscriptions.push(
      this.socketService.receiveNotifications().subscribe((notification: FriendNotification) => {
        switch (notification.type) {
          case NotificationType.userConnected:
          case NotificationType.userDisconnected: {
            this.apiService.getFriendsList().then((friendslist) => {
              this.updateFriendsList(friendslist);
            });
            break;
          }
          case NotificationType.requestReceived: {
            this.apiService.getPublicAccount(notification.friendId).then((account) => {
              this.snackBar.open(`${account.username} vous a envoyé une requête d'amitié.`, 'Ok', {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
              });
            });
            break;
          }
          case NotificationType.requestAccepted: {
            this.apiService.getPublicAccount(notification.friendId).then((account) => {
              this.snackBar.open(`${account.username} a accepté votre demande d'amitié.`, 'Ok', {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
              });
            });
            break;
          }
        }
      }),
    );

    this.subscriptions.push(
      this.socketService.joinedGame.subscribe(() => {
        const roomIndex = this.chatState.rooms.findIndex((room) => room.type === ChatRoomType.GAME);
        if (roomIndex === -1) {
          this.chatState.rooms.unshift({
            name: ChatService.GAME_ROOM_NAME,
            id: '',
            type: ChatRoomType.GAME,
            messages: [],
            newMessage: false,
          });
        }
        this.updatePoppedOutChat();
      }),
    );

    this.subscriptions.push(
      this.socketService.leftGame.subscribe(() => {
        this.closeRoom(ChatService.GAME_ROOM_NAME);
      }),
    );

    this.subscriptions.push(
      this.socketService.getRoomMessageHistory('general').subscribe((chatRoomHistory) => {
        const messages: Message[] = [];
        for (const message of chatRoomHistory.messages) {
          messages.push({ timestamp: message.timestamp, senderUsername: message.senderUsername, content: message.content } as ChatMessage);
        }
        this.chatState.rooms.push({ name: ChatService.GENERAL_ROOM_NAME, id: '', type: ChatRoomType.GENERAL, messages, newMessage: false });
      }),
    );

    this.subscriptions.push(
      this.socketService.receiveGuess().subscribe((message) => {
        const roomIndex = this.chatState.rooms.findIndex((room) => room.type === ChatRoomType.GAME);
        if (roomIndex > -1) {
          this.chatState.rooms[roomIndex].messages.push(message);
        }
        this.updatePoppedOutChat();
      }),
    );

    this.subscriptions.push(
      this.socketService.receivePrivateMessage().subscribe((privateMessage) => {
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
                newMessage: true,
              });
              roomIndex = this.chatState.rooms.length - 1;

              this.chatState.rooms[roomIndex].messages.push({
                senderUsername: accountInfo.username,
                content: privateMessage.content,
                timestamp: privateMessage.timestamp,
              } as ChatMessage);
              this.audiovisualService.playSound(GameSound.CHAT_NOTIFICATION);
            })
            .catch();
        } else {
          this.chatState.rooms[roomIndex].messages.push({
            senderUsername: isSender ? this.userService.account.username : this.chatState.rooms[roomIndex].name,
            content: privateMessage.content,
            timestamp: privateMessage.timestamp,
          } as ChatMessage);
          if (this.chatState.currentRoomIndex !== roomIndex) {
            this.chatState.rooms[roomIndex].newMessage = true;
            this.audiovisualService.playSound(GameSound.CHAT_NOTIFICATION);
          }
        }

        this.chatRoomChanged.emit();
        this.updatePoppedOutChat();
      }),
    );

    this.subscriptions.push(
      this.socketService.receiveChatRoomMessage().subscribe((chatRoomMessage) => {
        if (chatRoomMessage.roomName === 'general') {
          const roomIndex = this.chatState.rooms.findIndex((room) => room.type === ChatRoomType.GENERAL);
          this.chatState.rooms[roomIndex].messages.push({
            senderUsername: chatRoomMessage.senderUsername,
            timestamp: chatRoomMessage.timestamp,
            content: chatRoomMessage.content,
          } as ChatMessage);
          if (this.chatState.currentRoomIndex !== roomIndex) {
            this.chatState.rooms[roomIndex].newMessage = true;
            this.audiovisualService.playSound(GameSound.CHAT_NOTIFICATION);
          }
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
              this.chatState.rooms.push({ name: chatRoomMessage.roomName, id: '', type: ChatRoomType.GROUP, messages, newMessage: true });
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
              if (this.chatState.currentRoomIndex !== roomIndex) {
                this.chatState.rooms[roomIndex].newMessage = true;
                this.audiovisualService.playSound(GameSound.CHAT_NOTIFICATION);
              }
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
      }),
    );

    this.subscriptions.push(
      this.socketService.receivePlayerConnections().subscribe((message) => {
        this.handleMessage(message);
        this.updatePoppedOutChat();
      }),
    );

    this.subscriptions.push(
      this.socketService.receivePlayerDisconnections().subscribe((message) => {
        this.handleMessage(message);
        this.updatePoppedOutChat();
      }),
    );

    this.subscriptions.push(
      this.socketService.receiveFriendslist().subscribe((friendslist) => {
        this.updateFriendsList(friendslist);
        this.updatePoppedOutChat();
      }),
    );

    this.subscriptions.push(
      this.apiService.friendslistUpdated.subscribe((friendslist: FriendsList) => {
        this.updateFriendsList(friendslist);
        this.updatePoppedOutChat();
      }),
    );

    this.subscriptions.push(
      this.socketService.chatRoomsUpdated().subscribe((chatRooms) => {
        this.chatState.joinableRooms = chatRooms.filter((room) => room !== 'general');
        this.updatePoppedOutChat();
      }),
    );

    this.subscriptions.push(
      this.gameService.canGuessChanged.subscribe(() => {
        this.chatState.canGuess = this.gameService.canGuess;
        this.updatePoppedOutChat();
      }),
    );

    this.subscriptions.push(
      this.tutorialService.tutorialStarted.subscribe(() => {
        this.chatState.friendslistOpened = false;
        this.chatState.chatRoomsOpened = false;
      }),
    );
  }

  initChatState() {
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

    this.chatRoomChanged = new EventEmitter<void>();
    this.chatState.currentRoomIndex = 0;
  }

  initMainChat() {
    this.initChatState();

    this.socketService.getChatRooms().then((rooms) => {
      this.chatState.joinableRooms = [];
      for (const chatRoom of rooms) {
        if (chatRoom !== 'general') {
          this.chatState.joinableRooms.push(chatRoom);
        }
      }
    });

    this.apiService.getFriendsList().then((friendslist) => {
      this.updateFriendsList(friendslist);
    });

    this.initSubscriptions();
  }

  clearSubscriptions() {
    for (let i = this.subscriptions.length - 1; i > 0; i--) {
      this.subscriptions[i].unsubscribe();
      this.subscriptions.splice(i);
    }
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
      if (this.tutorialService.tutorialActive && this.tutorialService.currentStep === TutorialStep.GUESS_DRAWING) {
        this.tutorialService.next(TutorialStep.SEE_GUESS);
      }
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
        this.chatState.rooms[roomIndex].newMessage = false;
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
          this.chatState.rooms.push({
            type: ChatRoomType.PRIVATE,
            name: friendUsername,
            id: friendId,
            messages: chatMessages,
            newMessage: false,
          });
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
      this.snackBar.open("L'invitation a été envoyée!", 'Ok', {
        duration: 15000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
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
