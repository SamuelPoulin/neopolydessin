export enum SocketDrawing {
    START_PATH = 'startPath',
    START_PATH_BC = 'startPathBroadcast',

    UPDATE_PATH = 'updatePath',
    UPDATE_PATH_BC = 'updatePathBroadcast',

    END_PATH = 'endPath',
    END_PATH_BC = 'endPathBroadcast',

    START_ERASE = 'startErase',
    START_ERASE_BC = 'startEraseBroadcast',

    UPDATE_ERASE = 'updateErase',
    UPDATE_ERASE_BC = 'updateEraseBroadcast',

    END_ERASE = 'endErase',
    END_ERASE_BC = 'endEraseBroadcast',

    UNDO = 'undo',
    UNDO_BC = 'undoBroadcast',

    REDO = 'redo',
    REDO_BC = 'redoBroadcast',
}