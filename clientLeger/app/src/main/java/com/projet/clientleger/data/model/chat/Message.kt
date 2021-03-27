package com.projet.clientleger.data.model.chat

import kotlinx.serialization.Serializable

@Serializable
data class Message(
    override var content: String
) : IMessage