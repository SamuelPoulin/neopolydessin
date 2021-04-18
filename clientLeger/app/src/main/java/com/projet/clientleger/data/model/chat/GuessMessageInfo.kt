package com.projet.clientleger.data.model.chat

import com.projet.clientleger.data.enumData.GuessStatus
import kotlinx.serialization.Serializable

@Serializable
data class GuessMessageInfo(
        override var content: String,
        override var timestamp: Long,
        override var senderUsername: String,
        override var guessStatus: GuessStatus
) : IGuessMessageInfo