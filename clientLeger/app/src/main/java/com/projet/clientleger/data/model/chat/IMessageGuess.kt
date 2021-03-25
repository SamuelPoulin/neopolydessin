package com.projet.clientleger.data.model.chat

import com.projet.clientleger.data.enumData.GuessStatus

interface IMessageGuess: IMessageSystem {
    var guessStatus: GuessStatus
}