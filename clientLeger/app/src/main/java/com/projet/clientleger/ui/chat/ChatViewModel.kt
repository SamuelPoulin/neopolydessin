package com.projet.clientleger.ui.chat

import android.content.ComponentName
import android.content.ServiceConnection
import android.os.IBinder
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.projet.clientleger.data.enumData.GuessStatus
import com.projet.clientleger.data.enumData.TabType
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
class ChatViewModel @Inject constructor(private val chatRepository: ChatRepository) : ViewModel() {
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


    fun fetchSavedData(convos: ArrayList<Convo>, newCurrentConvo: Convo?) {
        messagesLiveData.value!!.clear()
        val nonNullCurrentConvo: Convo = newCurrentConvo ?: Convo()
        messagesLiveData.value!!.addAll(nonNullCurrentConvo.messages)
        messagesLiveData.postValue(messagesLiveData.value!!)
        this.currentConvo.postValue(nonNullCurrentConvo)

        this.convos.value!!.clear()
        this.convos.value!!.addAll(convos)
        this.convos.postValue(this.convos.value!!)
    }

    private fun toMessagesChat() {

    }

    fun updateConvos(updatedConvos: ArrayList<Convo>) {
        convos.value?.let { convosList ->
            convosList.clear()
            convosList.addAll(updatedConvos)
            convos.postValue(convosList)
        }
    }

    fun updateCurrentConvo() {
        messagesLiveData.value!!.clear()
        messagesLiveData.value!!.addAll(currentConvo.value!!.messages)
        messagesLiveData.postValue(messagesLiveData.value!!)
    }

    fun changeCurrentTab(newTabId: TabInfo?) {
        val newCurrentConvo = convos.value!!.find { it.tabInfo.convoId == newTabId?.convoId }
        if (newCurrentConvo != null) {
            messagesLiveData.value?.let {
                it.clear()
                it.addAll(newCurrentConvo.messages)
                messagesLiveData.postValue(it)
            }
        }
        currentConvo.postValue(newCurrentConvo)
    }

    fun sendMessage() {
        messageContentLiveData.value?.let {
            if (it.isNotBlank()) {
                when (currentConvo.value!!.tabInfo.tabType) {
                    TabType.GAME -> sendGameMessage(it)
                    TabType.FRIEND -> chatRepository.sendPrivateMessage(it, currentConvo.value!!.tabInfo.convoId)
                    else -> chatRepository.sendRoomMessage(currentConvo.value!!.tabInfo.convoId, it)
                }
            }
        }
    }

    private fun sendGameMessage(content: String) {
        if (isGuessing.value!!) {
            chatRepository.sendGuess(content)
        } else {
            chatRepository.sendMessage(Message(formatMessageContent(content)))
        }
    }

    private fun formatMessageContent(messageContent: String): String {
        var adjustedText: String = messageContent.replace("\\s+".toRegex(), " ")
        adjustedText = adjustedText.trimStart()
        return adjustedText
    }

    private fun notifyUpdateTab(convoId: String) {
        // TODO
    }

    fun clear() {
        chatRepository.clearSocketSubscriptions()
    }
}