package com.projet.clientleger.ui.chat

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.projet.clientleger.data.enumData.GuessStatus
import com.projet.clientleger.data.model.chat.*
import com.projet.clientleger.data.repository.ChatRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import io.reactivex.rxjava3.core.Observable
import javax.inject.Inject

@HiltViewModel
class ChatViewModel @Inject constructor(private val chatRepository: ChatRepository):ViewModel() {
    val messageContentLiveData: MutableLiveData<String> = MutableLiveData("")
    lateinit var username: String
    val messages: ArrayList<IMessage> = ArrayList()
    var sendingModeIsGuessing = false

    init {
        messages.add(MessageGuess("WRONG", 1, GuessStatus.WRONG))
        messages.add(MessageGuess("CLOSE", 2, GuessStatus.CLOSE))
        messages.add(MessageGuess("CORRECT", 2, GuessStatus.CORRECT))
        messages.add(MessageGuess("esadasdasfasdfdasfasfdsafasfasfdasfasfasd", 2, GuessStatus.CORRECT))
    }

    fun sendMessage(): Boolean{
        messageContentLiveData.value?.let{
            chatRepository.sendMessage(Message(formatMessageContent(it)))
        }
        return true
    }

    fun receiveMessage(): Observable<MessageChat>{
        return chatRepository.receiveMessage()
    }

    fun receivePlayerConnection(): Observable<MessageSystem>{
        return chatRepository.receivePlayerConnection()
    }

    fun receivePlayerDisconnect(): Observable<MessageSystem>{
        return chatRepository.receivePlayerDisconnection()
    }

    fun formatMessageContent(messageContent: String): String {
        var adjustedText: String = messageContent.replace("\\s+".toRegex(), " ")
        adjustedText = adjustedText.trimStart()
        return adjustedText
    }

    fun toggleSendMode(){
        sendingModeIsGuessing = !sendingModeIsGuessing
    }
}