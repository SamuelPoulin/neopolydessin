package com.projet.clientleger.data.model
import kotlinx.serialization.Serializable

@Serializable
data class MessageChat(override var user: String, override var content: String, override var timestamp: Long): IMessageChat {
    override fun toString(): String {
        return "user: $user, content: $content, time: $timestamp"
    }
}