package com.projet.clientleger.ui.chat

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.projet.clientleger.data.enumData.GuessStatus
import com.projet.clientleger.data.model.chat.*
import com.projet.clientleger.data.repository.ChatRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

@HiltViewModel
class ChatViewModel @Inject constructor(private val chatRepository: ChatRepository):ViewModel() {
    val messageContentLiveData: MutableLiveData<String> = MutableLiveData("")
    val messagesLiveData: MutableLiveData<ArrayList<IMessage>> = MutableLiveData(ArrayList())
    val username: String = chatRepository.getUsername()
    val isGuessing: MutableLiveData<Boolean> = MutableLiveData(false)
    val isGuesser: MutableLiveData<Boolean> = MutableLiveData(false)
    init {
        receiveMessage()
        receivePlayerConnection()
        receivePlayerDisconnect()
        chatRepository.receiveGuessClassic().subscribe{
            messagesLiveData.value!!.add(it)
            messagesLiveData.postValue(messagesLiveData.value)
        }
    }

    fun sendMessage(){
        messageContentLiveData.value?.let{
            if(isGuessing.value!!) {
                chatRepository.sendGuess(it)
                } else {
                chatRepository.sendMessage(Message(formatMessageContent(it)))
            }
        }
    }

    private fun receiveMessage(){
        chatRepository.receiveMessage().subscribe{
            messagesLiveData.value!!.add(it)
            messagesLiveData.postValue(messagesLiveData.value)
        }
    }

    private fun receivePlayerConnection(){
        chatRepository.receivePlayerConnection().subscribe{
            it.content = "${it.content} a rejoint la discussion"
            messagesLiveData.value!!.add(it)
            messagesLiveData.postValue(messagesLiveData.value)
        }
    }

    private fun receivePlayerDisconnect(){
        chatRepository.receivePlayerDisconnection().subscribe{
            it.content = "${it.content} a quitté la discussion"
            messagesLiveData.value!!.add(it)
            messagesLiveData.postValue(messagesLiveData.value)
        }
    }

    private fun formatMessageContent(messageContent: String): String {
        var adjustedText: String = messageContent.replace("\\s+".toRegex(), " ")
        adjustedText = adjustedText.trimStart()
        return adjustedText
    }
}