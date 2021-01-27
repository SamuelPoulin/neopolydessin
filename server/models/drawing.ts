import * as mongoose from 'mongoose';

export interface Drawing extends mongoose.Document {
  name: string;
  tags: string[];
  data: string;
  color: string;
  width: number;
  height: number;
  previewURL: string;
}

export const drawingSchema = new mongoose.Schema({
  name: String,
  tags: [String],
  data: String,
  color: String,
  width: Number,
  height: Number,
  previewURL: String,
});

const drawingModel = mongoose.model<Drawing>('Drawing', drawingSchema);
export default drawingModel;
