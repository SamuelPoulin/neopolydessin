package com.projet.clientleger.data.endpoint

enum class RoomslistSocketEndpoints(val value: String) {
    GET_ROOMS("getChatRooms"),
    JOIN_ROOM("joinChatRoom"),
    LEAVE_ROOM("leaveChatRoom"),
    CREATE_ROOM("createChatRoom"),
    DELETE_ROOM("deleteChatRoom"),
    RECEIVE_UPDATED_ROOMS("updatedChatRooms")
}