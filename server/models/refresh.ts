import * as mongoose from 'mongoose';

export interface Refresh extends mongoose.Document {
    accountId: string;
    token: string;
}

export const refreshSchema = new mongoose.Schema({
    accountId: {
        type: String,
        required: true,
        unique: true
    },
    token: {
        type: String,
        required: true
    }
});

const refreshModel = mongoose.model<Refresh>('Refresh', refreshSchema);
export default refreshModel;
