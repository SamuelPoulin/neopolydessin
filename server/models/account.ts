import * as mongoose from 'mongoose';

export interface Account extends mongoose.Document {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

export const accountSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  logins: [Date]
});

const accountModel = mongoose.model<Account>('Account', accountSchema);
export default accountModel;
