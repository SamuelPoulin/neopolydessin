package com.projet.clientleger.data.model.chat

import kotlinx.serialization.Serializable

@Serializable
data class MessageSystem(override var content: String,
                         override var timestamp: Long): IMessageSystem
