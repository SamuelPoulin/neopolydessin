import { Timestamp } from 'mongodb';
import { Document, Schema, Model, model, Query } from 'mongoose';

export interface Login {
  start: Timestamp;
  end: Timestamp | undefined;
}

export interface Logins extends Document {
  accountId: string;
  logins: [Login];
}

interface LoginsModel extends Model<Logins> {
  findByAccountId: (id: string) => Query<Logins | null, Logins>;
  findByAccountIdAndDelete: (id: string) => Query<Logins | null, Logins>;
}

export const loginSchema = new Schema<Logins, LoginsModel>({
  accountId: {
    type: String,
    required: true,
    unique: true
  },
  logins: [{
    start: {
      type: String,
      timestamp: true
    },
    end: {
      type: String,
      timestamp: true
    },
  }]
});

loginSchema.statics.findByAccountId = (accountId: string) => {
  return loginsModel.findOne({ accountId });
};

loginSchema.statics.findByAccountIdAndDelete = (accountId: string) => {
  return loginsModel.findOneAndDelete({ accountId });
};

const loginsModel: LoginsModel = model<Logins, LoginsModel>('Logins', loginSchema);
export default loginsModel;