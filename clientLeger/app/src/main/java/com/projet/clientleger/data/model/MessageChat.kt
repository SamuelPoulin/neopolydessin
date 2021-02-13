package com.projet.clientleger.data.model
import kotlinx.serialization.Serializable

@Serializable
data class MessageChat(val user: String, val content: String, val timestamp: Long) {
    override fun toString(): String {
        return "user: $user, content: $content, time: $timestamp"
    }
}