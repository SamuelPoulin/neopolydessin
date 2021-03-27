package com.projet.clientleger.utils

import com.projet.clientleger.data.model.chat.MessageChat

interface ChatListener {
    fun receiveMsg(msg: MessageChat)
    fun sendMsg(msg: MessageChat)
}