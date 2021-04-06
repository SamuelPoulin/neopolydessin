import { ObjectId } from 'mongodb';
import { Document, Model, model, Schema } from 'mongoose';
import { GameType } from '../../../common/communication/lobby';

export interface Game {
  startDate: number;
  endDate: number;
  gameType: GameType;
}

export interface GameHistory extends Document {
  _id: ObjectId;
  accountId: string;
  games: [Game];
}

interface GameHistoryModel extends Model<GameHistory> {
}

export const gameHistorySchema = new Schema<GameHistory, GameHistoryModel>({
  accountId: {
    type: String,
    required: true,
    unique: true
  },
  games: [{

  }]
});

const gameHistoryModel = model<GameHistory, GameHistoryModel>('GameHistory', gameHistorySchema);
export default gameHistoryModel;