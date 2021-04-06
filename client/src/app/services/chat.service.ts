import { Injectable } from '@angular/core';
import { FriendsList, FriendStatus, FriendWithConnection } from '@common/communication/friends';
import { ChatRoom, ChatRoomType } from '@models/chat/chat-room';
import { Subscription } from 'rxjs';
import { Message } from '../../../../common/communication/chat-message';
import { APIService } from './api.service';
import { GameService } from './game.service';
import { SocketService } from './socket-service.service';

@Injectable({ providedIn: 'root' })
export class ChatService {
  // private static GENERAL_ROOM_NAME: string = 'Général';
  private static GAME_ROOM_NAME: string = 'Partie';

  messageSubscription: Subscription;
  guessSubscription: Subscription;
  privateMessageSubscription: Subscription;
  playerConnectionSubscription: Subscription;
  playerDisconnectionSubscription: Subscription;
  friendslistSubscription: Subscription;

  rooms: ChatRoom[] = [];
  friends: FriendWithConnection[] = [];
  friendRequests: FriendWithConnection[] = [];
  currentRoomIndex: number = 0;
  guessing: boolean = false;
  friendslistOpened: boolean = false;

  constructor(private socketService: SocketService, private gameService: GameService, private apiService: APIService) {
    this.rooms.push({ name: ChatService.GAME_ROOM_NAME, type: ChatRoomType.GAME, messages: [] });
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

    this.privateMessageSubscription = this.socketService.receivePrivateMessage().subscribe((message) => {
      this.handleMessage(message);
    });

    this.playerConnectionSubscription = this.socketService.receivePlayerConnections().subscribe((message) => {
      this.handleMessage(message);
    });

    this.playerDisconnectionSubscription = this.socketService.receivePlayerDisconnections().subscribe((message) => {
      this.handleMessage(message);
    });

    this.friendslistSubscription = this.socketService.receiveFriendslist().subscribe((friendslist) => {
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
    this.socketService.sendMessage(text);
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
