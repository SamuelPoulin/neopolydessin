package com.projet.clientleger.data.repository

import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.http.ApiFriendslistInterface
import com.projet.clientleger.data.api.model.chat.ChatRoomHistory
import com.projet.clientleger.data.api.model.chat.PrivateMessage
import com.projet.clientleger.data.api.model.chat.ReceivedPrivateMessage
import com.projet.clientleger.data.api.socket.ChatSocketService
import com.projet.clientleger.data.model.account.AccountInfo
import com.projet.clientleger.data.model.chat.*
import io.reactivex.rxjava3.core.Observable
import kotlinx.coroutines.withContext
import retrofit2.Response
import javax.inject.Inject
import javax.net.ssl.HttpsURLConnection

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

    fun getAccountInfo(): AccountInfo {
        return sessionManager.getAccountInfo()
    }

    fun sendGuess(guess: String){
        return  chatSocketService.sendGuess(guess)
    }

    fun receiveGuessClassic(): Observable<GuessMessageInfo> {
        return chatSocketService.receiveGuessClassic()
    }

    fun receiveGuessSoloCoop(): Observable<GuessMessageSoloCoopInfo>{
        return chatSocketService.receiveGuessSoloCoop()
    }

    suspend fun getChatFriendHistory(pageNumberWanted: Int, friendId: String, messagePerPage: Int): ArrayList<MessageId> {
        val messages = ArrayList<MessageId>()
        try{
            val res = sessionManager.request(pageNumberWanted, friendId, messagePerPage,apiFriendslistInterface::getFriendChatHistory)
            if(res.code() == HttpsURLConnection.HTTP_OK)
                messages.addAll(res.body()!!.messages)
        } catch (e: Exception) {println(e.message)}
        return messages
    }

    fun receiveRoomMessage(): Observable<IMessage>{
        return chatSocketService.receiveRoomMessage()
    }

    fun clearSocketSubscriptions(){
        chatSocketService.clearSubscriptions()
    }

    fun getRoomHistory(): Observable<ChatRoomHistory> {
        return chatSocketService.getRoomHistory()
    }

    fun sendRoomMessage(roomName: String, content: String){
        chatSocketService.sendRoomMessage(roomName, content)
    }
}