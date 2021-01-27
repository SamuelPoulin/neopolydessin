import * as express from 'express';
import * as httpStatus from 'http-status-codes';
import { injectable } from 'inversify';

import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import drawingModel, { Drawing } from '../../models/drawing';

export interface DrawingResponse<T> {
  statusCode: number;
  documents: T;
}

@injectable()
export class DatabaseService {
  private static readonly CONNECTION_OPTIONS: mongoose.ConnectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  mongoMS: MongoMemoryServer;

  constructor() {
    if (process.env.NODE_ENV !== 'test') {
      this.connectDB();
    }
  }

  private static determineStatus(err: Error, results: Drawing | Drawing[]): number {
    return err ? httpStatus.INTERNAL_SERVER_ERROR : results ? httpStatus.OK : httpStatus.NOT_FOUND;
  }

  static handleResults(res: express.Response, results: DrawingResponse<Drawing> | DrawingResponse<Drawing[]>): void {
    results.documents ? res.status(results.statusCode).json(results.documents) : res.sendStatus(results.statusCode);
  }

  // Documentation de mongodb-memory-server sur Github
  // https://github.com/nodkz/mongodb-memory-server
  async connectMS(): Promise<void> {
    this.mongoMS = new MongoMemoryServer();
    return this.mongoMS.getUri().then((mongoUri) => {
      mongoose.connect(mongoUri, DatabaseService.CONNECTION_OPTIONS);

      mongoose.connection.once('open', () => {
        console.log(`MongoDB successfully connected local instance ${mongoUri}`);
      });
    });
  }

  connectDB(): void {
    if (process.env.MONGODB_KEY) {
      mongoose.connect(
        process.env.MONGODB_KEY,
        DatabaseService.CONNECTION_OPTIONS,
        (err: mongoose.Error) => {
          err ? console.error(err.message) : console.log('Connected to MongoDB Atlas Cloud');
        },
      );
    }
  }

  async disconnectDB(): Promise<void> {
    await mongoose.disconnect();
    if (this.mongoMS) {
      await this.mongoMS.stop();
    }
  }

  async getAllDrawings(): Promise<DrawingResponse<Drawing[]>> {
    return new Promise<DrawingResponse<Drawing[]>>((resolve) => {
      drawingModel.find({}, (err: Error, docs: Drawing[]) => {
        const status = DatabaseService.determineStatus(err, docs);
        resolve({ statusCode: status, documents: docs });
      });
    });
  }

  async searchDrawings(name: string, tags: string | string[]): Promise<DrawingResponse<Drawing[]>> {
    return new Promise<DrawingResponse<Drawing[]>>((resolve) => {
      if (tags.length !== 0 && tags instanceof Array) {
        const regex = [];
        for (let i = 0; i < tags.length; ++i) {
          regex[i] = new RegExp('^' + tags[i]);
        }
        drawingModel.find(
          {
            name: { $regex: '.*' + name + '.*' },
            tags: { $all: regex },
          }, (err: Error, docs: Drawing[]) => {
            const status = DatabaseService.determineStatus(err, docs);
            resolve({ statusCode: status, documents: docs });
          });
      } else if (tags !== '') {
        drawingModel.find(
          {
            name: { $regex: '.*' + name + '.*' },
            tags: { $regex: '.*' + tags + '.*' },
          }, (err: Error, docs: Drawing[]) => {
            const status = DatabaseService.determineStatus(err, docs);
            resolve({ statusCode: status, documents: docs });
          });
      } else {
        drawingModel.find(
          {
            name: { $regex: '.*' + name + '.*' },
          }, (err: Error, docs: Drawing[]) => {
            const status = DatabaseService.determineStatus(err, docs);
            resolve({ statusCode: status, documents: docs });
          });
      }
    });
  }

  async getDrawingById(id: string): Promise<DrawingResponse<Drawing>> {
    return new Promise<DrawingResponse<Drawing>>((resolve) => {
      drawingModel.findById(id, (err: Error, doc: Drawing) => {
        const status = DatabaseService.determineStatus(err, doc);
        resolve({ statusCode: status, documents: doc });
      });
    });
  }

  async addDrawing(body: Drawing): Promise<DrawingResponse<Drawing>> {
    return new Promise<DrawingResponse<Drawing>>((resolve) => {
      const drawing = {
        name: body.name,
        tags: body.tags,
        data: body.data,
        color: body.color,
        width: body.width,
        height: body.height,
        previewURL: body.previewURL
      } as Drawing;
      const model = new drawingModel(drawing);
      model.save((err: mongoose.Error, doc: Drawing) => {
        const status = err ? httpStatus.INTERNAL_SERVER_ERROR : httpStatus.OK;
        resolve({ statusCode: status, documents: doc });
      });
    });
  }

  async deleteDrawing(id: string): Promise<DrawingResponse<Drawing>> {
    return new Promise<DrawingResponse<Drawing>>((resolve) => {
      drawingModel.findByIdAndDelete(id, (err: Error, doc: Drawing) => {
        resolve({ statusCode: DatabaseService.determineStatus(err, doc), documents: doc });
      });
    });
  }

  async updateDrawing(id: string, body: string): Promise<DrawingResponse<Drawing>> {
    return new Promise<DrawingResponse<Drawing>>((resolve) => {
      drawingModel.findByIdAndUpdate(id, body, (err: Error, doc: Drawing) => {
        resolve({ statusCode: DatabaseService.determineStatus(err, doc), documents: doc });
      });
    });
  }
}
