import { Timestamp } from 'mongodb';
import * as mongoose from 'mongoose';

export interface Login {
  start: Timestamp;
  end: Timestamp;
}

export interface Logins extends mongoose.Document {
  accountId: string;
  logins: [Login];
}

export const loginSchema = new mongoose.Schema({
  accountId: {
    type: String,
    required: true,
    unique: true
  },
  logins: [{
    start: Timestamp,
    end: Timestamp,
  }]
});

const loginsModel = mongoose.model<Logins>('Logins', loginSchema);
export default loginsModel;