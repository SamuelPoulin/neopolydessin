import { BrushInfo } from "./brush-info";

export interface Coord {
    x: number;
    y: number;
}
export interface Segment {
    brushInfo: BrushInfo;
    path: Coord[];
}

export interface DrawingSequence {
    stack: Segment[];
}