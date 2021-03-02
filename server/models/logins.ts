import { Document, Schema, Model, model, Query } from 'mongoose';

export interface Login {
  start: Date;
  end?: Date;
}

export interface Logins extends Document {
  accountId: string;
  logins: [Login];
}

interface LoginsModel extends Model<Logins> {
  findByAccountId: (id: string) => Query<Logins | null, Logins>;
  findByAccountIdAndDelete: (id: string) => Query<Logins | null, Logins>;
  addLogin: (id: string) => Query<Logins | null, Logins>;
  addLogout: (id: string) => Query<Logins | null, Logins>;
}

export const loginSchema = new Schema<Logins, LoginsModel>({
  accountId: {
    type: String,
    required: true,
    unique: true
  },
  logins: [{
    start: {
      type: Date,
      required: true,
    },
    end: Date
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