export enum SocketDrawing {
    START_PATH = 'startPath',
    START_PATH_BC = 'startPathBroadcast',

    UPDATE_PATH = 'updatePath',
    UPDATE_PATH_BC = 'updatePathBroadcast',

    END_PATH = 'endPath',
    END_PATH_BC = 'endPathBroadcast',

    ERASE = 'erase',
    ERASE_BC = 'eraseBroadcast',

    UNDO = 'undo',
    UNDO_BC = 'undoBroadcast',

    REDO = 'redo',
    REDO_BC = 'redoBroadcast',
}