import { ObjectId } from 'mongodb';
import { Document, Schema, model, Query, Model } from 'mongoose';
import { ChatRoomMessage } from '../../../common/communication/chat-room-history';
import { UpdateOneQueryResult } from './account';

export interface ChatRoomHistory extends Document {
  _id: ObjectId;
  roomName: string;
  messages: [ChatRoomMessage];
}

export interface ChatRoomHistoryModel extends Model<ChatRoomHistory> {
  addMessageToHistory: (roomName: string, msg: ChatRoomMessage) => Query<UpdateOneQueryResult, ChatRoomHistory>;
}

export const chatRoomHistorySchema = new Schema<ChatRoomHistory, ChatRoomHistoryModel>({
  roomName: {
    type: String,
    required: true,
  },
  messages: [{
    _id: false,
    roomName: {
      type: String,
      required: true,
    },
    senderAccountId: String,
    senderUsername: String,
    timestamp: Number,
    content: String,
  }]
});

chatRoomHistorySchema.statics.addMessageToHistory = (roomName: string, msg: ChatRoomMessage) => {
  return chatRoomHistoryModel.updateOne({ roomName }, {
    $push: {
      messages: {
        senderAccountId: msg.senderAccountId,
        senderUsername: msg.senderUsername,
        content: msg.content,
        timestamp: msg.timestamp,
        roomName: msg.roomName
      }
    }
  });
};

const chatRoomHistoryModel = model<ChatRoomHistory, ChatRoomHistoryModel>('ChatRoomHistory', chatRoomHistorySchema);
export default chatRoomHistoryModel;