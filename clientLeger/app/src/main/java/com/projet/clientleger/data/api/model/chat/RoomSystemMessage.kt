package com.projet.clientleger.data.api.model.chat

import com.projet.clientleger.data.model.chat.MessageSystem
import kotlinx.serialization.Serializable

@Serializable
data class RoomSystemMessage(override var content: String,
                             override var timestamp: Long,
                             override var roomName: String) : IRoomSystemMessage {
    fun toMessageSystem(): MessageSystem {
        return MessageSystem(content, timestamp)
    }
}
