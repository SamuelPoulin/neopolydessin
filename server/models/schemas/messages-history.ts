import { ObjectId } from 'mongodb';
import { Document, Schema, Model, model, Query } from 'mongoose';
import { PrivateMessage, PrivateMessageTo } from '../../../common/communication/private-message';
import { UpdateOneQueryResult } from './account';

export interface MessageHistory {
  messages: PrivateMessage[];
}

export interface Messages extends Document {
  _id: ObjectId;
  accountId: ObjectId;
  otherAccountId: ObjectId;
  messages: [PrivateMessage];
}

interface MessagesModel extends Model<Messages> {
  findHistory: (id: string, otherId: string, page: number, limit: number) => Query<Messages | null, Messages>;
  addMessageToHistory: (msg: PrivateMessageTo, senderId: string, timestamp: number) => Query<UpdateOneQueryResult, Messages>;
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
      _id: false,
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

messagesSchema.statics.addMessageToHistory = (msg: PrivateMessageTo, senderId: string, timestamp: number) => {
  return messagesHistoryModel.updateOne(findMessagesQuery(senderId, msg.receiverAccountId),
    {
      $push: {
        messages: {
          senderAccountId: senderId,
          content: msg.content,
          timestamp,
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