package com.projet.clientleger.data.api.model.chat

import com.projet.clientleger.data.enumData.GuessStatus
import com.projet.clientleger.data.model.chat.GuessMessageSoloCoopInfo
import kotlinx.serialization.Serializable

@Serializable
data class GuessMessageSoloCoop(override var nbGuessLeft: Int,
                                override var guessStatus: String,
                                override var senderUsername: String,
                                override var timestamp: Long,
                                override var content: String) : IGuessMessageSoloCoop {
    fun toInfo(): GuessMessageSoloCoopInfo {
        return GuessMessageSoloCoopInfo(nbGuessLeft,
                GuessStatus.sToEnum(guessStatus), senderUsername,
                timestamp, content)
    }
}
