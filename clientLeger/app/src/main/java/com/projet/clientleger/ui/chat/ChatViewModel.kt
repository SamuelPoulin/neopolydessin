package com.projet.clientleger.ui.chat

import android.content.ComponentName
import android.content.ServiceConnection
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.widget.Toast
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.projet.clientleger.data.api.model.chat.IGuessMessage
import com.projet.clientleger.data.enumData.GuessStatus
import com.projet.clientleger.data.enumData.TabType
import com.projet.clientleger.data.enumData.SoundId
import com.projet.clientleger.data.model.account.AccountInfo
import com.projet.clientleger.data.model.chat.*
import com.projet.clientleger.data.repository.ChatRepository
import com.projet.clientleger.data.service.AudioService
import com.projet.clientleger.data.service.ChatStorageService
import com.projet.clientleger.data.service.TutorialService
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
class ChatViewModel @Inject constructor(private val chatRepository: ChatRepository, private val audioService: AudioService, private val tutorialService: TutorialService) : ViewModel() {
    companion object {
        const val NB_MESSAGES_PER_PAGE = 20
        const val GAME_TAB_ID = "GAME"
        const val MAX_SPAM_COUNT = 5
    }

    val messageContentLiveData: MutableLiveData<String> = MutableLiveData("")
    val messagesLiveData: MutableLiveData<ArrayList<IMessage>> = MutableLiveData(ArrayList())
    val convos: MutableLiveData<ArrayList<Convo>> = MutableLiveData(ArrayList())
    val accountInfo: AccountInfo = chatRepository.getAccountInfo()
    val isGuessing: MutableLiveData<Boolean> = MutableLiveData(false)
    val isGuesser: MutableLiveData<Boolean> = MutableLiveData(false)
    val currentConvo: MutableLiveData<Convo> = MutableLiveData(Convo())
    var spamCounter: Int = 0


    private fun manageGuessSound(status: GuessStatus) {
        if (status == GuessStatus.CORRECT) {
            playSound(SoundId.CORRECT.value)
        } else {
            playSound(SoundId.ERROR.value)
        }
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

    fun sendMessage(): String? {
        var errorMsg: String? = null
        messageContentLiveData.value?.let {
            if (it.isNotBlank()) {
                when {
                    spamCounter == 0 -> {
                        Handler(Looper.getMainLooper()).postDelayed(::resetSpamCount, 3000)
                        spamCounter++
                        when (currentConvo.value!!.tabInfo.tabType) {
                            TabType.GAME -> sendGameMessage(it)
                            TabType.FRIEND -> chatRepository.sendPrivateMessage(it, currentConvo.value!!.tabInfo.convoId)
                            else -> chatRepository.sendRoomMessage(currentConvo.value!!.tabInfo.convoId, it)
                        }
                    }
                    spamCounter < MAX_SPAM_COUNT -> {
                        spamCounter++
                        when (currentConvo.value!!.tabInfo.tabType) {
                            TabType.GAME -> sendGameMessage(it)
                            TabType.FRIEND -> chatRepository.sendPrivateMessage(it, currentConvo.value!!.tabInfo.convoId)
                            else -> chatRepository.sendRoomMessage(currentConvo.value!!.tabInfo.convoId, it)
                        }
                    }
                    else -> errorMsg = "Vous avez envoyer trop de message récemment"
                }
            }
        }
        return errorMsg
    }

    private fun resetSpamCount() {
        spamCounter = 0
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

    fun clear() {
        chatRepository.clearSocketSubscriptions()
    }

    fun playSound(soundId: Int) {
        audioService.playSound(soundId)
    }

    fun isTutorialActive(): Boolean {
        return tutorialService.isTutorialActive()
    }
}