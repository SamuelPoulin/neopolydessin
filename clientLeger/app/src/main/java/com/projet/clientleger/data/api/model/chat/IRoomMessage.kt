package com.projet.clientleger.data.api.model.chat

import com.projet.clientleger.data.model.chat.IMessageChat
import com.projet.clientleger.data.model.chat.IMessageSystem

interface IRoomMessage: IMessageChat {
    var senderAccountId: String
    var roomName: String
}