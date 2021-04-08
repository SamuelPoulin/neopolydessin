import { Injectable } from '@angular/core';
import { FriendsList, FriendStatus, FriendWithConnection } from '@common/communication/friends';
import { ChatRoom, ChatRoomType } from '@models/chat/chat-room';
import { Subscription } from 'rxjs';
import { ChatMessage, Message } from '../../../../common/communication/chat-message';
import { APIService } from './api.service';
import { GameService } from './game.service';
import { SocketService } from './socket-service.service';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class ChatService {
  // private static GENERAL_ROOM_NAME: string = 'Général';
  private static GAME_ROOM_NAME: string = 'Partie';

  messageSubscription: Subscription;
  guessSubscription: Subscription;
  privateMessageSubscription: Subscription;
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

  constructor(
    private socketService: SocketService,
    private gameService: GameService,
    private apiService: APIService,
    private userService: UserService,
  ) {
    this.rooms.push({ name: ChatService.GAME_ROOM_NAME, id: '', type: ChatRoomType.GAME, messages: [] });
    this.currentRoomIndex = 0;

    this.apiService.getFriendsList().then((friendslist) => {
      this.updateFriendsList(friendslist);
    });
    this.initSubscriptions();
  }

  initSubscriptions() {
    this.messageSubscription = this.socketService.receiveMessage().subscribe((message) => {
      const roomIndex = this.rooms.findIndex((room) => room.type === ChatRoomType.GAME);
      if (roomIndex > -1) {
        this.rooms[roomIndex].messages.push(message);
      }
    });

    this.guessSubscription = this.socketService.receiveGuess().subscribe((message) => {
      const roomIndex = this.rooms.findIndex((room) => room.type === ChatRoomType.GAME);
      if (roomIndex > -1) {
        this.rooms[roomIndex].messages.push(message);
      }
    });

    this.privateMessageSubscription = this.socketService.receivePrivateMessage().subscribe((privateMessage) => {
      console.log(privateMessage);
      let roomIndex = this.rooms.findIndex((room) => room.id === privateMessage.senderAccountId);

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
          senderUsername: this.rooms[roomIndex].name,
          content: privateMessage.content,
          timestamp: privateMessage.timestamp,
        } as ChatMessage);
      }
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
    if (this.rooms[this.currentRoomIndex].type === ChatRoomType.GAME) {
      this.socketService.sendMessage(text);
    } else if (this.rooms[this.currentRoomIndex].type === ChatRoomType.PRIVATE) {
      this.socketService.sendPrivateMessage(text, this.rooms[this.currentRoomIndex].id);
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
    }
  }

  focusRoom(roomName: string) {
    const roomIndex = this.rooms.findIndex((room) => room.name === roomName);
    if (roomIndex > -1) {
      this.currentRoomIndex = roomIndex;
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
      })
      .catch(() => {
        console.log('DM Error');
      });
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
    return this.gameService.canGuess;
  }
}
