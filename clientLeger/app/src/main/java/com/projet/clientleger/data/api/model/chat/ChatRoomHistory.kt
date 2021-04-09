package com.projet.clientleger.data.api.model.chat

import kotlinx.serialization.Serializable

@Serializable
data class ChatRoomHistory(val roomName: String, val messages: ArrayList<RoomMessage>)
