package com.projet.clientleger.data.model.chat

import kotlinx.serialization.Serializable

@Serializable
data class MessageId(val senderAccountId: String, val receiverAccountId: String,
                     override var content: String, override var timestamp: Long): IMessageSystem{
                         fun toMessageChat(username: String) : MessageChat{
                             return MessageChat(content, timestamp, username)
                         }
                     }
