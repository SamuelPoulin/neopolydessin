package com.projet.clientleger.data.api.model.chat

import com.projet.clientleger.data.model.chat.IMessage

data class PrivateMessage(override var content: String, var receiverAccountId: String): IMessage {
}