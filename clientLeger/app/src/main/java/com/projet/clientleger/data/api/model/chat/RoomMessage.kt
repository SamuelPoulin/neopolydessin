package com.projet.clientleger.data.api.model.chat

import kotlinx.serialization.Serializable

@Serializable
data class RoomMessage(override var content: String,
                       override var timestamp: Long,
                       override var senderUsername: String,
                       override var senderAccountId: String,
                       override var roomName: String): IRoomMessage
