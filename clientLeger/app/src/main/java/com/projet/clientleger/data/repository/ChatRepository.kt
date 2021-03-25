package com.projet.clientleger.data.repository

import com.projet.clientleger.data.api.service.ChatSocketService
import com.projet.clientleger.data.model.chat.Message
import com.projet.clientleger.data.model.chat.MessageChat
import io.reactivex.rxjava3.core.Observable
import javax.inject.Inject

class ChatRepository @Inject constructor(private val chatSocketService: ChatSocketService){
    fun receiveMessage(): Observable<MessageChat> {
        return chatSocketService.receiveMessage()
    }

    fun receivePlayerConnection(): Observable<Message>{
        return chatSocketService.receivePlayerConnection()
    }

    fun receivePlayerDisconnection(): Observable<Message>{
        return chatSocketService.receivePlayerDisconnection()
    }

    fun sendMessage(msg: MessageChat){
        chatSocketService.sendMessage(msg)
    }
}