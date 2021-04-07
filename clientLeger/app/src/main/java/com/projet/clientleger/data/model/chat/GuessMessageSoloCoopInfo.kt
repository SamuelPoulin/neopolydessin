package com.projet.clientleger.data.model.chat

import com.projet.clientleger.data.enumData.GuessStatus
import kotlinx.serialization.Serializable

@Serializable
data class GuessMessageSoloCoopInfo(override var nbGuessLeft: Int,
                                    override var guessStatus: GuessStatus,
                                    override var senderUsername: String,
                                    override var timestamp: Long,
                                    override var content: String): IGuessMessageSoloCoopInfo
