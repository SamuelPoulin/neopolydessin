package com.projet.clientleger.data.model.chat

import com.projet.clientleger.data.enumData.GuessStatus

interface IGuessMessageInfo: IMessageChat {
    var guessStatus: GuessStatus
}