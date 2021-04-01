package com.projet.clientleger.data.api.model.chat

import com.projet.clientleger.data.model.chat.IGuessMessageInfo
import com.projet.clientleger.data.model.chat.IMessageChat

interface IGuessMessage: IMessageChat {
    var guessStatus: String
}