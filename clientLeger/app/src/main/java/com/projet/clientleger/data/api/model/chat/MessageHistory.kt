package com.projet.clientleger.data.api.model.chat

import com.projet.clientleger.data.model.chat.MessageId
import kotlinx.serialization.Serializable

@Serializable
data class MessageHistory(val messages: ArrayList<MessageId>)
