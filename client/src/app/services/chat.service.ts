import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { FriendsList, FriendStatus, FriendWithConnection } from '@common/communication/friends';
import { ChatRoom, ChatRoomType } from '@models/chat/chat-room';
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

  rooms: ChatRoom[] = [];
  friends: FriendWithConnection[] = [];
  friendRequests: FriendWithConnection[] = [];
  currentRoomIndex: number = 0;
  guessing: boolean = false;
  friendslistOpened: boolean = false;
  chatRoomsOpened: boolean = false;
  chatRoomChanged: EventEmitter<void>;
  chatPoppedOut: boolean;

  constructor(
    private socketService: SocketService,
    private gameService: GameService,
    private apiService: APIService,
    private userService: UserService,
    private router: Router,
    private electronService: ElectronService,
  ) {
    this.chatRoomChanged = new EventEmitter<void>();
    this.rooms.push({ name: ChatService.GAME_ROOM_NAME, id: '', type: ChatRoomType.GAME, messages: [] });
    this.rooms.push({ name: ChatService.GENERAL_ROOM_NAME, id: '', type: ChatRoomType.GENERAL, messages: [] });
    this.currentRoomIndex = 0;

    this.apiService.getFriendsList().then((friendslist) => {
      this.updateFriendsList(friendslist);
    });
    this.initSubscriptions();

    if (this.electronService.isElectronApp) {
      this.electronService.ipcRenderer.on('chat-closed', () => {
        this.chatPoppedOut = false;
      });
    }
  }

  initSubscriptions() {
    this.messageSubscription = this.socketService.receiveMessage().subscribe((message) => {
      const roomIndex = this.rooms.findIndex((room) => room.type === ChatRoomType.GAME);
      if (roomIndex > -1) {
        this.rooms[roomIndex].messages.push(message);
      }

      this.chatRoomChanged.emit();
    });

    this.guessSubscription = this.socketService.receiveGuess().subscribe((message) => {
      const roomIndex = this.rooms.findIndex((room) => room.type === ChatRoomType.GAME);
      if (roomIndex > -1) {
        this.rooms[roomIndex].messages.push(message);
      }
    });

    this.privateMessageSubscription = this.socketService.receivePrivateMessage().subscribe((privateMessage) => {
      let roomIndex = -1;
      const isSender: boolean = privateMessage.senderAccountId === this.userService.account._id;

      if (isSender) {
        roomIndex = this.rooms.findIndex((room) => room.id === privateMessage.receiverAccountId);
      } else {
        roomIndex = this.rooms.findIndex((room) => room.id === privateMessage.senderAccountId);
      }

      if (roomIndex === -1) {
        this.apiService
          .getPublicAccount(privateMessage.senderAccountId)
          .then((accountInfo) => {
            this.rooms.push({ name: accountInfo.username, id: privateMessage.senderAccountId, type: ChatRoomType.PRIVATE, messages: [] });
            roomIndex = this.rooms.length - 1;

            this.rooms[roomIndex].messages.push({
              senderUsername: accountInfo.username,
              content: privateMessage.content,
              timestamp: privateMessage.timestamp,
            } as ChatMessage);
          })
          .catch();
      } else {
        this.rooms[roomIndex].messages.push({
          senderUsername: isSender ? this.userService.account.username : this.rooms[roomIndex].name,
          content: privateMessage.content,
          timestamp: privateMessage.timestamp,
        } as ChatMessage);
      }

      this.chatRoomChanged.emit();
    });

    this.chatRoomMessageSubscription = this.socketService.receiveChatRoomMessage().subscribe((chatRoomMessage) => {
      if (chatRoomMessage.roomName === 'general') {
        const roomIndex = this.rooms.findIndex((room) => room.type === ChatRoomType.GENERAL);
        this.rooms[roomIndex].messages.push({
          senderUsername: chatRoomMessage.senderUsername,
          timestamp: chatRoomMessage.timestamp,
          content: chatRoomMessage.content,
        } as ChatMessage);
      } else {
        let roomIndex = this.rooms.findIndex((room) => room.name === chatRoomMessage.roomName);

        if (roomIndex === -1) {
          this.rooms.push({ name: chatRoomMessage.roomName, id: '', type: ChatRoomType.GROUP, messages: [] });
        } else {
          roomIndex = this.rooms.findIndex((room) => room.name === chatRoomMessage.roomName);

          if (chatRoomMessage.senderUsername) {
            this.rooms[roomIndex].messages.push({
              content: chatRoomMessage.content,
              senderUsername: chatRoomMessage.senderUsername,
              timestamp: chatRoomMessage.timestamp,
            } as ChatMessage);
          } else {
            this.rooms[roomIndex].messages.push({
              content: chatRoomMessage.content,
              timestamp: chatRoomMessage.timestamp,
            } as SystemMessage);
          }
        }
      }

      this.chatRoomChanged.emit();
    });

    this.playerConnectionSubscription = this.socketService.receivePlayerConnections().subscribe((message) => {
      this.handleMessage(message);
    });

    this.playerDisconnectionSubscription = this.socketService.receivePlayerDisconnections().subscribe((message) => {
      this.handleMessage(message);
    });

    this.friendslistSocketSubscription = this.socketService.receiveFriendslist().subscribe((friendslist) => {
      this.updateFriendsList(friendslist);
    });

    this.friendslistAPISubscription = this.apiService.friendslistUpdated.subscribe((friendslist: FriendsList) => {
      this.updateFriendsList(friendslist);
    });
  }

  updateFriendsList(friendslist: FriendsList) {
    this.friends = [];
    this.friendRequests = [];
    for (const user of friendslist.friends) {
      if (user.status === FriendStatus.FRIEND) {
        this.friends.push(user);
      } else if (user.status === FriendStatus.PENDING) {
        this.friendRequests.push(user);
      }
    }
  }

  handleMessage(message: Message) {
    console.log(message);
  }

  sendMessage(text: string) {
    const room = this.rooms[this.currentRoomIndex];
    if (room.type === ChatRoomType.GAME) {
      this.socketService.sendMessage(text);
    } else if (room.type === ChatRoomType.GENERAL) {
      this.socketService.sendRoomMessage(text, 'general');
    } else if (room.type === ChatRoomType.GROUP) {
      this.socketService.sendRoomMessage(text, room.name);
    } else if (room.type === ChatRoomType.PRIVATE) {
      this.socketService.sendPrivateMessage(text, room.id);
    }
  }

  sendGuess(text: string) {
    this.socketService.sendGuess(text);
    this.guessing = false;
  }

  closeRoom(roomName: string) {
    const roomIndex = this.rooms.findIndex((room) => room.name === roomName);
    if (roomIndex > -1) {
      this.rooms.splice(roomIndex, 1);
      this.currentRoomIndex = 0;
      this.chatRoomChanged.emit();
    }
  }

  focusRoom(roomName: string) {
    const roomIndex = this.rooms.findIndex((room) => room.name === roomName);
    if (roomIndex > -1) {
      this.currentRoomIndex = roomIndex;
      this.chatRoomChanged.emit();
    }
  }

  resetGameMessages() {
    const roomIndex = this.rooms.findIndex((room) => room.type === ChatRoomType.GAME);
    if (roomIndex > -1) {
      this.rooms[roomIndex].messages = [];
    }
  }

  createDM(friendUsername: string, friendId: string) {
    this.apiService
      .getMessageHistory(friendId)
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
        this.rooms.push({ type: ChatRoomType.PRIVATE, name: friendUsername, id: friendId, messages: chatMessages });
        this.currentRoomIndex = this.rooms.findIndex((room) => room.name === friendUsername);
        this.friendslistOpened = false;
        this.chatRoomChanged.emit();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  joinChatRoom(roomName: string) {
    this.socketService.joinChatRoom(roomName).then(() => {
      this.currentRoomIndex = this.rooms.findIndex((room) => room.name === roomName);
      this.chatRoomsOpened = false;
      this.chatRoomChanged.emit();
    });
  }

  leaveChatRoom(roomName: string) {
    this.socketService.leaveChatRoom(roomName);
    this.closeRoom(roomName);
  }

  deleteChatRoom(roomName: string) {
    this.socketService.deleteChatRoom(roomName);
    this.closeRoom(roomName);
  }

  get messages() {
    if (this.rooms[this.currentRoomIndex]) {
      return this.rooms[this.currentRoomIndex].messages;
    } else {
      return [];
    }
  }

  get roomName() {
    if (this.rooms[this.currentRoomIndex]) {
      return this.rooms[this.currentRoomIndex].name;
    } else {
      return null;
    }
  }

  get canGuess(): boolean {
    return this.gameService.canGuess && this.rooms[this.currentRoomIndex].type === ChatRoomType.GAME;
  }

  get standalone(): boolean {
    return this.router.url === '/chat';
  }
}
