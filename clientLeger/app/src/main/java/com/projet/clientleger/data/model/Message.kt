package com.projet.clientleger.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Message(
    override var content: String,
    override var timestamp: Long
) : IMessage {
    override fun toString(): String {
        return "content: $content, time: $timestamp"
    }
}