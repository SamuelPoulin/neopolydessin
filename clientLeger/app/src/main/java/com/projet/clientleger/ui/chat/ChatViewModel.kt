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
    val messagesLiveData: MutableLiveData<ArrayList<IMessage>> = MutableLiveData(ArrayList())
    val username: String = chatRepository.getUsername()
    var sendingModeIsGuessing = false

    init {
        messagesLiveData.value!!.add(MessageGuess("WRONG", 1, GuessStatus.WRONG.value))
        messagesLiveData.value!!.add(MessageGuess("CLOSE", 2, GuessStatus.CLOSE.value))
        messagesLiveData.value!!.add(MessageGuess("CORRECT", 2, GuessStatus.CORRECT.value))
        messagesLiveData.value!!.add(MessageGuess("esadasdasfasdfdasfasfdsafasfasfdasfasfasd", 2, GuessStatus.CORRECT.value))
        receiveMessage()
        receivePlayerConnection()
        receivePlayerDisconnect()
    }

    fun sendMessage(){
        messageContentLiveData.value?.let{
            if(sendingModeIsGuessing) {
                chatRepository.sendGuess(it).subscribe { guess ->
                    println(guess)
                    messagesLiveData.value!!.add(guess)
                    messagesLiveData.postValue(messagesLiveData.value)
                }
            } else{
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

    fun formatMessageContent(messageContent: String): String {
        var adjustedText: String = messageContent.replace("\\s+".toRegex(), " ")
        adjustedText = adjustedText.trimStart()
        return adjustedText
    }

    fun toggleSendMode(){
        sendingModeIsGuessing = !sendingModeIsGuessing
    }
}