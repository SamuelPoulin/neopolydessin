import { DrawMode } from './draw-mode';
import { BrushInfo } from './brush-info';
import { Difficulty } from './lobby';

export interface PictureWord {
    word: string,
    hints: string[],
    difficulty: Difficulty,
    drawMode: DrawMode
}

export interface PictureWordDrawing extends PictureWord {
    drawnPaths: {
        brushInfo: BrushInfo
        path: { x: number, y: number }[]
        id: string
    }[],
}

export interface PictureWordPicture extends PictureWord {
    picture: string,
    color: string,
}