package com.projet.clientleger.data.repository

import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.socket.ChatSocketService
import com.projet.clientleger.data.model.chat.Message
import com.projet.clientleger.data.model.chat.MessageChat
import com.projet.clientleger.data.model.chat.GuessMessageInfo
import com.projet.clientleger.data.model.chat.MessageSystem
import io.reactivex.rxjava3.core.Observable
import javax.inject.Inject

class ChatRepository @Inject constructor(private val sessionManager: SessionManager, private val chatSocketService: ChatSocketService){
    fun receiveMessage(): Observable<MessageChat> {
        return chatSocketService.receiveMessage()
    }

    fun receivePlayerConnection(): Observable<MessageSystem>{
        return chatSocketService.receivePlayerConnection()
    }

    fun receivePlayerDisconnection(): Observable<MessageSystem>{
        return chatSocketService.receivePlayerDisconnection()
    }

    fun sendMessage(msg: Message){
        chatSocketService.sendMessage(msg)
    }

    fun getUsername(): String{
        return sessionManager.getUsername()
    }

    fun sendGuess(guess: String){
        return  chatSocketService.sendGuess(guess)
    }

    fun receiveGuessClassic(): Observable<GuessMessageInfo> {
        return chatSocketService.receiveGuessClassic()
    }
}