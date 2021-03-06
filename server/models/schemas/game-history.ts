import { ObjectId } from 'mongodb';
import { Document, Model, model, Query, Schema } from 'mongoose';
import { Game, GameResult } from '../../../common/communication/dashboard';
import { GameType } from '../../../common/communication/lobby';

export interface GameHistory extends Document {
  _id: ObjectId;
  accountId: string;
  games: [Game];
}

interface GameHistoryModel extends Model<GameHistory> {
  findByAccountId: (id: string) => Query<GameHistory | null, GameHistory>;
  addGame: (id: string, gameInfo: Game) => Query<GameHistory | null, GameHistory>;
}

export const gameHistorySchema = new Schema<GameHistory, GameHistoryModel>({
  accountId: {
    type: String,
    required: true,
    unique: true
  },
  games: [{
    _id: false,
    gameResult: {
      type: GameResult,
      required: true,
    },
    startDate: {
      type: Number,
      required: true,
    },
    endDate: {
      type: Number,
      required: true,
    },
    gameType: {
      type: GameType,
      required: true,
    },
    team: [{
      _id: false,
      score: Number,
      playerNames: [String]
    }]
  }]
});

gameHistorySchema.statics.addGame = (accountId: string, gameInfo: Game) => {
  return gameHistoryModel.updateOne(
    { accountId },
    {
      $push: {
        games: {
          gameResult: gameInfo.gameResult,
          startDate: gameInfo.startDate,
          endDate: gameInfo.endDate,
          gameType: gameInfo.gameType,
          team: gameInfo.team,
        }
      }
    }
  );
};

gameHistorySchema.statics.findByAccountId = (accountId: string) => {
  return gameHistoryModel.findOne({ accountId });
};

const gameHistoryModel = model<GameHistory, GameHistoryModel>('GameHistory', gameHistorySchema);
export default gameHistoryModel;