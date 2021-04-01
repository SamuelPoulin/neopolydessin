package com.projet.clientleger.data.model.chat
import kotlinx.serialization.Serializable

@Serializable
data class MessageChat(override var content: String,
                       override var timestamp: Long,
                       override var senderUsername: String) : IMessageChat