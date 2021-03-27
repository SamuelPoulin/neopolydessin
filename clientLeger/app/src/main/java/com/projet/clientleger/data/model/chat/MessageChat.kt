package com.projet.clientleger.data.model.chat
import kotlinx.serialization.Serializable

@Serializable
data class MessageChat(override var senderUsername: String,
                       override var timestamp: Long,
                       override var content: String) : IMessageChat