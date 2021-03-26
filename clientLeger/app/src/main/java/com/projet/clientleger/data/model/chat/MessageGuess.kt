package com.projet.clientleger.data.model.chat

import com.projet.clientleger.data.enumData.GuessStatus
import kotlinx.serialization.Serializable

@Serializable
data class MessageGuess(
        override var content: String,
        override var timestamp: Long,
        override var guessStatus: String
) : IMessageGuess