package com.projet.clientleger.data.api.model.chat

import com.projet.clientleger.data.model.chat.IMessageSystem

interface IRoomSystemMessage: IMessageSystem {
    var roomName: String
}