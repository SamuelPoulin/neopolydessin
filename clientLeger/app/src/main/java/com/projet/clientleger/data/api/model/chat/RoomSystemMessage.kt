package com.projet.clientleger.data.api.model.chat

import kotlinx.serialization.Serializable

@Serializable
data class RoomSystemMessage(override var content: String,
                             override var timestamp: Long,
                             override var roomName: String): IRoomSystemMessage
