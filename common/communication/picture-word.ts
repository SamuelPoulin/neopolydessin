import { Difficulty } from './difficulty';
import { DrawMode } from './draw-mode';
import { BrushInfo } from './brush-info';

export interface PictureWordDrawing {
    word: string,
    drawnPaths: {
        brushinfo: BrushInfo
        coords: { x: number, y: number }[]
        id: string
    }[],
    hints: string[],
    difficulty: Difficulty,
    drawMoode: DrawMode
}

export interface PictureWordPicture {
    word: string,
    picture: ArrayBuffer,
    hints: string[],
    difficulty: Difficulty,
    drawMoode: DrawMode
}