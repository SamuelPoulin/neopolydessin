package com.projet.clientleger.data.api.model.chat

import com.projet.clientleger.data.enumData.GuessStatus
import com.projet.clientleger.data.model.chat.GuessMessageInfo
import kotlinx.serialization.Serializable

@Serializable
data class GuessMessage(override var content: String,
                        override var timestamp: Long,
                        override var senderUsername:String,
                        override var guessStatus: String): IGuessMessage{
                            fun toInfo(): GuessMessageInfo{
                                return GuessMessageInfo(content, timestamp, senderUsername, GuessStatus.sToEnum(guessStatus))
                            }
                        }
