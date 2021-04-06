package com.projet.clientleger.data.api.model.chat

import com.projet.clientleger.data.model.chat.IMessage
import com.projet.clientleger.data.model.chat.IMessageSystem
import com.projet.clientleger.data.model.chat.MessageChat
import kotlinx.serialization.Serializable

@Serializable
data class ReceivedPrivateMessage(override var content: String, override var timestamp: Long, var senderAccountId: String, var receiverAccountId: String): IMessageSystem{
    fun toMessageChat(): MessageChat{
        return MessageChat(content, timestamp, senderAccountId)
    }
}
