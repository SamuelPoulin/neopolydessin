package com.projet.clientleger.data.repository

import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.http.ApiFriendslistInterface
import com.projet.clientleger.data.api.model.chat.PrivateMessage
import com.projet.clientleger.data.api.model.chat.ReceivedPrivateMessage
import com.projet.clientleger.data.api.socket.ChatSocketService
import com.projet.clientleger.data.model.chat.*
import io.reactivex.rxjava3.core.Observable
import retrofit2.Response
import javax.inject.Inject

class ChatRepository @Inject constructor(private val sessionManager: SessionManager,
                                         private val chatSocketService: ChatSocketService,
                                         private val apiFriendslistInterface: ApiFriendslistInterface){
    fun receiveMessage(): Observable<MessageChat> {
        return chatSocketService.receiveMessage()
    }

    fun receivePlayerConnection(): Observable<MessageSystem>{
        return chatSocketService.receivePlayerConnection()
    }

    fun receivePlayerDisconnection(): Observable<MessageSystem>{
        return chatSocketService.receivePlayerDisconnection()
    }

    fun sendPrivateMessage(msgContent: String, friendId: String){
        chatSocketService.sendPrivateMessage(msgContent, friendId)
    }

    fun receivePrivateMessage(): Observable<ReceivedPrivateMessage> {
        return chatSocketService.receivePrivateMessage()
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

    suspend fun getChatFriendHistory(pageNumberWanted: Int, friendId: String, messagePerPage: Int): Response<ArrayList<MessageChat>> {
        return sessionManager.request(pageNumberWanted, friendId, messagePerPage,apiFriendslistInterface::getFriendChatHistory)
    }
}