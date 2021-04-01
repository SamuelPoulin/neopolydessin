package com.projet.clientleger.data.endpoint

enum class ChatSocketEndpoints(val value: String) {
    RECEIVE_MSG("ReceiveMsg"),
    SEND_MSG("SendMsg"),
    RECEIVE_PLAYER_CONNECTION("PlayerConnected"),
    RECEIVE_PLAYER_DISCONNECT("PlayerDisconnected"),
    SEND_GUESS("guess"),
    RECEIVE_GUESS_CLASSIC("classiqueGuessBroadcast"),
    RECEIVE_GUESS_COOP("coopGuessBroadcast")
}
