import { BrushInfo } from "./brush-info";

export interface Coord {
    x: number;
    y: number;
}
export interface Segment {
    zIndex: number;
    brushInfo: BrushInfo;
    path: Coord[];
}

export interface DrawingSequence {
    height: number;
    width: number;
    stack: Segment[];
}