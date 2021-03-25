package com.projet.clientleger.data.model.chat

import com.projet.clientleger.data.enumData.GuessStatus

data class MessageGuess(
        override var content: String,
        override var timestamp: Long,
        val guessStatus: GuessStatus
) : IMessage