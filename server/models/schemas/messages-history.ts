import { ObjectId } from 'mongodb';
import { Document, Schema, Model, model, Query } from 'mongoose';
import { ChatMessage } from '../../../common/communication/chat-message';
import { PrivateMessage } from '../../../common/communication/private-message';
import { UpdateOneQueryResult } from './account';

export interface MessageHistory {
  messages: ChatMessage[];
}

export interface Messages extends Document {
  _id: ObjectId;
  accountId: ObjectId;
  otherAccountId: ObjectId;
  messages: [ChatMessage];
}

interface MessagesModel extends Model<Messages> {
  findHistory: (id: string, otherId: string, page: number, limit: number) => Query<MessageHistory | null, Messages>;
  addMessageToHistory: (msg: PrivateMessage) => Query<UpdateOneQueryResult, Messages>;
  removeHistory: (id: string, otherId: string) => Query<Messages | null, Messages>;
  removeHistoryOfAccount: (id: string) => Query<Messages | null, Messages>;
}

const findMessagesQuery = (id: string, otherId: string) => {
  const objId = new ObjectId(id);
  const otherObjId = new ObjectId(otherId);
  return {
    $or: [
      { accountId: objId, otherAccountId: otherObjId },
      { accountId: otherObjId, otherAccountId: objId }
    ]
  };
};

export const messagesSchema = new Schema<Messages, MessagesModel>({
  accountId: {
    type: ObjectId,
    required: true,
    ref: 'Account'
  },
  otherAccountId: {
    type: ObjectId,
    required: true,
    ref: 'Account'
  },
  messages: [
    {
      senderAccountId: {
        type: String,
        required: true,
      },
      content: String,
      timestamp: Number,
    }
  ]
});


messagesSchema.statics.findHistory = (id: string, otherId: string, page: number, limit: number) => {
  const skips = limit * (page - 1);
  return messagesHistoryModel.findOne(findMessagesQuery(id, otherId), 'messages')
    .skip(skips).limit(limit);
};

messagesSchema.statics.addMessageToHistory = (msg: PrivateMessage) => {
  return messagesHistoryModel.updateOne(findMessagesQuery(msg.senderAccountId, msg.receiverAccountId),
    {
      $push: {
        messages: {
          senderAccountId: msg.senderAccountId,
          content: msg.content,
          timestamp: msg.timestamp,
        }
      }
    }
  );
};

messagesSchema.statics.removeHistory = (id: string, otherId: string) => {
  return messagesHistoryModel.findOneAndRemove(findMessagesQuery(id, otherId), { useFindAndModify: false });
};

messagesSchema.statics.removeHistoryOfAccount = (id: string) => {
  return messagesHistoryModel.deleteMany({
    $or: [
      { accountId: id, },
      { otherAccountId: id }
    ]
  });
};

const messagesHistoryModel: MessagesModel = model<Messages, MessagesModel>('MessageHistory', messagesSchema);
export default messagesHistoryModel;