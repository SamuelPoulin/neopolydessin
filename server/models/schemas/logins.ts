import { ObjectId } from 'mongodb';
import { Document, Schema, Model, model, Query } from 'mongoose';
import { UpdateOneQueryResult } from './account';

export interface Login {
  start: Date;
  end?: Date;
}

export interface Logins extends Document {
  _id: ObjectId;
  accountId: string;
  logins: [Login];
}

interface LoginsModel extends Model<Logins> {
  findByAccountId: (id: string) => Query<Logins | null, Logins>;
  findByAccountIdAndDelete: (id: string) => Query<Logins | null, Logins>;
  addLogin: (id: string) => Query<UpdateOneQueryResult | null, Logins>;
  addLogout: (id: string) => Query<UpdateOneQueryResult | null, Logins>;
}

export const loginSchema = new Schema<Logins, LoginsModel>({
  accountId: {
    type: String,
    required: true,
    unique: true
  },
  logins: [{
    _id: false,
    start: {
      type: Number,
      required: true,
    },
    end: Number
  }]
});

loginSchema.statics.findByAccountId = (accountId: string) => {
  return loginsModel.findOne({ accountId });
};

loginSchema.statics.findByAccountIdAndDelete = (accountId: string) => {
  return loginsModel.findOneAndDelete({ accountId });
};

loginSchema.statics.addLogin = (accountId: string) => {
  return loginsModel.updateOne(
    { accountId },
    {
      $push: {
        logins: {
          $each: [{ start: new Date() }],
          $position: 0
        }
      }
    }
  );
};

loginSchema.statics.addLogout = (accountId: string) => {
  return loginsModel.updateOne(
    { accountId },
    {
      $set: {
        'logins.0.end': new Date(),
      }
    }
  );
};

const loginsModel: LoginsModel = model<Logins, LoginsModel>('Logins', loginSchema);
export default loginsModel;