package com.projet.clientleger.data.endpoint

enum class DrawingSocketEndpoints(val endpoint: String) {
    START_PATH("startPath"),
    RECEIVE_START_PATH("startPathBroadcast"),

    UPDATE_PATH("updatePath"),
    RECEIVE_UPDATE_PATH("updatePathBroadcast"),

    END_PATH("endPath"),
    RECEIVE_END_PATH("endPathBroadcast"),

    SEND_ERASE("erase"),
    RECEIVE_ERASE("eraseBroadcast"),

    SEND_PATH("addPath"),
    RECEIVE_PATH("addPathBroadcast"),
}