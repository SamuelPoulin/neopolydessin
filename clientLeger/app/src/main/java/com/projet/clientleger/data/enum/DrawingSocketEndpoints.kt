package com.projet.clientleger.data.enum

enum class DrawingSocketEndpoints(val endpoint: String) {
    START_PATH("startPath"),
    RECEIVE_START_PATH("startPathBroadcast"),

    UPDATE_PATH("updatePath"),
    RECEIVE_UPDATE_PATH("updatePathBroadcast"),

    END_PATH("endPath"),
    RECEIVE_END_PATH("endPathBroadcast"),

    START_ERASE("startErase"),
    RECEIVE_START_ERASE("startEraseBroadcast"),

    UNDO("undo"),
    RECEIVE_UNDO("undoBroadcast"),

    REDO("redo"),
    RECEIVE_REDO("redoBroadcast"),

    CREATE_LOBBY("CreateLobby")
}