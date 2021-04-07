import { DrawMode } from './draw-mode';
import { BrushInfo } from './brush-info';
import { Difficulty } from './lobby';

interface PictureWord {
    word: string,
    hints: string[],
    difficulty: Difficulty,
    drawMode: DrawMode
}

export interface PictureWordInfo {
    _id: string,
    word: string,
    drawMode: DrawMode,
    difficulty: Difficulty,
}

export interface UpdatePictureWord extends PictureWord {
    color: string;
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