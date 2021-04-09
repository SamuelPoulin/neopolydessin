package com.projet.clientleger.ui.chat

import android.content.ComponentName
import android.content.ServiceConnection
import android.os.IBinder
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.projet.clientleger.data.enumData.GuessStatus
import com.projet.clientleger.data.model.account.AccountInfo
import com.projet.clientleger.data.model.chat.*
import com.projet.clientleger.data.repository.ChatRepository
import com.projet.clientleger.data.service.ChatStorageService
import com.projet.clientleger.ui.lobby.viewmodel.LobbyViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.internal.artificialFrame
import kotlinx.coroutines.launch
import javax.inject.Inject
import javax.net.ssl.HttpsURLConnection
import kotlin.random.Random

@HiltViewModel
class ChatViewModel @Inject constructor(private val chatRepository: ChatRepository):ViewModel() {
    companion object {
        const val NB_MESSAGES_PER_PAGE = 20
        const val GAME_TAB_ID = "GAME"
    }
    val messageContentLiveData: MutableLiveData<String> = MutableLiveData("")
    val messagesLiveData: MutableLiveData<ArrayList<IMessage>> = MutableLiveData(ArrayList())
    val convos: MutableLiveData<ArrayList<Convo>> = MutableLiveData(ArrayList())
    val accountInfo: AccountInfo = chatRepository.getAccountInfo()
    val isGuessing: MutableLiveData<Boolean> = MutableLiveData(false)
    val isGuesser: MutableLiveData<Boolean> = MutableLiveData(false)
    val currentConvo: MutableLiveData<Convo> = MutableLiveData(Convo())

    init {
//        receiveGameMessage()
//        receivePlayerConnection()
//        receivePlayerDisconnect()
//        chatRepository.receiveGuessClassic().subscribe{
//            receiveMessage(it, TabInfo(LobbyViewModel.GAME_TAB_NAME, GAME_TAB_ID, false))
//        }
//        chatRepository.receiveGuessSoloCoop().subscribe{
//            receiveMessage(it, TabInfo(LobbyViewModel.GAME_TAB_NAME, GAME_TAB_ID, false))
//        }
//        receivePrivateMessageSubscription()
    }



    fun fetchSavedData(convos: ArrayList<Convo>, newCurrentConvo: Convo?){
        messagesLiveData.value!!.clear()
        val nonNullCurrentConvo: Convo = newCurrentConvo ?: Convo()
        messagesLiveData.value!!.addAll(nonNullCurrentConvo.messages)
        messagesLiveData.postValue(messagesLiveData.value!!)
        this.currentConvo.postValue(nonNullCurrentConvo)

        this.convos.value!!.clear()
        this.convos.value!!.addAll(convos)
        this.convos.postValue(this.convos.value!!)
    }

    private fun toMessagesChat(){

    }

    fun updateConvos(newConvos: ArrayList<Convo>){
        convos.value?.let { convosList ->
            println("update convos: ${newConvos}")
            convosList.clear()
            convosList.addAll(newConvos)
            convos.postValue(convosList)

            val newMessages = (newConvos.find { it.tabInfo.convoId == currentConvo.value!!.tabInfo.convoId})?.messages
            println("dsadasda: ${newMessages} --- ${currentConvo.value}")
            if(newMessages != null){
                if(newMessages.size != currentConvo.value!!.messages.size){
                    messagesLiveData.value!!.clear()
                    messagesLiveData.value!!.addAll(newMessages)
                    messagesLiveData.postValue(messagesLiveData.value!!)
                }
            }
        }
    }

    fun updateCurrentConvo(newCurrentConvo: Convo?){
        currentConvo.postValue(newCurrentConvo)
    }

    fun sendMessage(){
        messageContentLiveData.value?.let{
            if(currentConvo.value!!.tabInfo.isDM)
                chatRepository.sendPrivateMessage(it, currentConvo.value!!.tabInfo.convoId)
            else{
                if(isGuessing.value!!) {
                    chatRepository.sendGuess(it)
                } else {
                    chatRepository.sendMessage(Message(formatMessageContent(it)))
                }
            }
        }
    }

    private fun formatMessageContent(messageContent: String): String {
        var adjustedText: String = messageContent.replace("\\s+".toRegex(), " ")
        adjustedText = adjustedText.trimStart()
        return adjustedText
    }

    private fun notifyUpdateTab(convoId: String){
        // TODO
    }

    fun clear(){
        chatRepository.clearSocketSubscriptions()
    }
}