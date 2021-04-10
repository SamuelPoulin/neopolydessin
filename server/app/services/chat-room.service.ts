import { NOT_FOUND } from 'http-status-codes';
import { inject, injectable } from 'inversify';
import { Server, Socket } from 'socket.io';
import chatRoomHistoryModel from '../../models/schemas/chat-room-history';
import { AccountInfo } from '../../../common/communication/account';
import { Message } from '../../../common/communication/chat-message';
import { ChatRoomHistory, ChatRoomMessage, ChatRoomSystemMessage } from '../../../common/communication/chat-room-history';
import { SocketMessages } from '../../../common/socketendpoints/socket-messages';
import Types from '../types';
import { DatabaseService } from './database.service';
import { SocketIdService } from './socket-id.service';

export const GENERAL_CHAT_ROOM: string = 'general';

@injectable()
export class ChatRoomService {

  rooms: string[] = [];

  private io: Server;

  constructor(
    @inject(Types.SocketIdService) private socketIdService: SocketIdService,
    @inject(Types.DatabaseService) private databaseService: DatabaseService,
  ) {
    chatRoomHistoryModel.findOne({ roomName: GENERAL_CHAT_ROOM })
      .then((chatRoom) => {
        if (!chatRoom) {
          this.createChatHistory(GENERAL_CHAT_ROOM);
        }
        return chatRoomHistoryModel.find();
      })
      .then((chatRooms) => {
        chatRooms.forEach((room) => {
          this.rooms.push(room.roomName);
        });
      });
  }

  initIo(io: Server) {
    this.io = io;
  }

  bindIoEvents(socket: Socket): void {

    socket.on(SocketMessages.GET_CHAT_ROOM_HISTORY,
      (roomName: string, page: number, limit: number, callback: (chatHistory: ChatRoomHistory | null) => void) => {
        if (this.chatRoomExists(roomName)) {
          this.getMessageHistory(roomName, page, limit)
            .then((chatHistory) => {
              callback(chatHistory);
            }).catch((err) => {
              callback(null);
            });
        }
      });

    socket.on(SocketMessages.GET_CHAT_ROOMS_IM_IN, (callback: (rooms: string[]) => void) => {
      const roomsImIn: string[] = [];
      socket.rooms.forEach((room) => {
        if (this.chatRoomExists(room)) {
          roomsImIn.push(room);
        }
      });
      callback(roomsImIn);
    });

    socket.on(SocketMessages.GET_CHAT_ROOMS, (callback: (rooms: string[]) => void) => {
      callback(this.rooms);
    });

    socket.on(SocketMessages.CREATE_CHAT_ROOM, (roomName: string, callback: (successfullyCreated: boolean) => void) => {
      if (!this.chatRoomExists(roomName)) {
        this.rooms.push(roomName);
        this.createChatHistory(roomName)
          .then((result) => {
            callback(true);
          });
        this.io.emit(SocketMessages.CHAT_ROOMS_UPDATED, this.rooms);
      } else {
        callback(false);
      }
    });

    socket.on(SocketMessages.DELETE_CHAT_ROOM, (roomName: string, callback: (successfullyDeleted: boolean) => void) => {
      if (this.chatRoomExists(roomName) && roomName !== GENERAL_CHAT_ROOM) {
        const roomIndex = this.rooms.findIndex((room) => room === roomName);
        if (roomIndex > -1) {
          this.io.of('/').in(roomName).sockets.forEach((socketOfClient) => {
            socketOfClient.leave(roomName);
          });
          this.rooms.splice(roomIndex, 1);
          this.deleteChatHistory(roomName)
            .then((result) => {
              callback(true);
            });
          this.io.emit(SocketMessages.CHAT_ROOMS_UPDATED, this.rooms);
        }
      } else {
        callback(false);
      }
    });

    socket.on(SocketMessages.JOIN_CHAT_ROOM, async (roomName: string, successfullyJoined: (joined: boolean) => void) => {
      if (this.chatRoomExists(roomName)) {
        const accountInfo = await this.getAccountOfUser(socket);
        if (accountInfo) {
          socket.join(roomName);
          const playerJoinedMsg: ChatRoomSystemMessage = {
            roomName,
            content: `${accountInfo.username} a rejoint le salon : ${roomName}`,
            timestamp: Date.now(),
          };
          this.io.in(roomName).emit(SocketMessages.RECEIVE_MESSAGE_OF_ROOM, playerJoinedMsg);
          successfullyJoined(true);
        } else {
          successfullyJoined(false);
        }
      }
    });

    socket.on(SocketMessages.LEAVE_CHAT_ROOM, async (roomName, successfullyLeft: (left: boolean) => void) => {
      if (this.chatRoomExists(roomName) && socket.rooms.has(roomName)) {
        const accountInfo = await this.getAccountOfUser(socket);
        if (accountInfo) {
          socket.leave(roomName);
          const playerLeft: ChatRoomSystemMessage = {
            roomName,
            content: `${accountInfo.username} a quitté le salon : ${roomName}`,
            timestamp: Date.now(),
          };
          this.io.in(roomName).emit(SocketMessages.RECEIVE_MESSAGE_OF_ROOM, playerLeft);
          successfullyLeft(true);
        } else {
          successfullyLeft(false);
        }
      }
    });

    socket.on(SocketMessages.SEND_MESSAGE_TO_ROOM, async (roomName: string, message: Message) => {
      if (this.chatRoomExists(roomName)) {
        const accountInfo = await this.getAccountOfUser(socket);
        if (accountInfo) {
          const roomMsg: ChatRoomMessage = {
            content: message.content,
            timestamp: Date.now(),
            senderAccountId: accountInfo._id,
            senderUsername: accountInfo.username,
            roomName
          };
          this.addMessageToHistory(roomName, roomMsg).then((result) => {
            this.io.in(roomName).emit(SocketMessages.RECEIVE_MESSAGE_OF_ROOM, roomMsg);
          });
        }
      }
    });
  }

  async getMessageHistory(roomName: string, page: number, limit: number): Promise<ChatRoomHistory> {
    page = page < 1 ? 1 : page;
    limit = limit < 0 ? 0 : limit;
    return new Promise<ChatRoomHistory>((resolve, reject) => {
      const skips = limit * (page - 1);
      chatRoomHistoryModel.findOne({ roomName }, 'messages').skip(skips).limit(limit)
        .then((chatHistory) => {
          if (!chatHistory) throw Error();
          resolve(chatHistory);
        })
        .catch((err) => {
          reject('not found');
        });
    });
  }

  async createChatHistory(roomName: string): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      const history = new chatRoomHistoryModel({ roomName, messages: [] });
      history.save()
        .then((createdChatHistory) => {
          resolve(true);
        })
        .catch((err) => {
          resolve(false);
        });
    });
  }

  async addMessageToHistory(roomName: string, message: ChatRoomMessage): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      chatRoomHistoryModel.addMessageToHistory(roomName, message)
        .then((update) => {
          if (update.nModified > 0) {
            resolve(true);
          } else {
            throw Error(NOT_FOUND.toString());
          }
        })
        .catch((err) => {
          reject(false);
        });

    });
  }

  async deleteChatHistory(roomName: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      chatRoomHistoryModel.findOneAndDelete({ roomName }, { useFindAndModify: false })
        .then((deletedChatHistory) => {
          resolve(true);
        })
        .catch((err) => {
          reject(false);
        });
    });
  }

  private async getAccountOfUser(socket: Socket): Promise<AccountInfo | undefined> {
    const accountId = this.socketIdService.GetAccountIdOfSocketId(socket.id);
    if (accountId) {
      const account = await this.databaseService.getAccountById(accountId);
      return account.documents;
    } else {
      return undefined;
    }
  }

  private chatRoomExists(roomName: string): boolean {
    return this.rooms.includes(roomName);
  }


}