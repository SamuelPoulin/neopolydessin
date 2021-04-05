package com.projet.clientleger.ui.chat

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.projet.clientleger.data.enumData.GuessStatus
import com.projet.clientleger.data.model.chat.*
import com.projet.clientleger.data.repository.ChatRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlin.random.Random

@HiltViewModel
class ChatViewModel @Inject constructor(private val chatRepository: ChatRepository):ViewModel() {
    val messageContentLiveData: MutableLiveData<String> = MutableLiveData("")
    val messagesLiveData: MutableLiveData<ArrayList<IMessage>> = MutableLiveData(ArrayList())
    val convosData: HashMap<String, ArrayList<IMessage>> = HashMap()
    val tabs: MutableLiveData<ArrayList<TabInfo>> = MutableLiveData(ArrayList())
    val username: String = chatRepository.getUsername()
    val isGuessing: MutableLiveData<Boolean> = MutableLiveData(false)
    val isGuesser: MutableLiveData<Boolean> = MutableLiveData(false)
    private var currentConvoId: String = ""
    val selectedTab: MutableLiveData<TabInfo> = MutableLiveData()
    init {
        receiveMessage()
        receivePlayerConnection()
        receivePlayerDisconnect()
        chatRepository.receiveGuessClassic().subscribe{
            messagesLiveData.value!!.add(it)
            messagesLiveData.postValue(messagesLiveData.value)
        }
        tabs.postValue(tabs.value!!)
    }

    fun addNewTab(convoName: String, convoId: String, hasHistory: Boolean){
        if(convosData[convoId] != null)
            changeSelectedTab(TabInfo(convoName, convoId))
        else{
            val oldMessages = ArrayList<IMessage>()
            oldMessages.addAll(messagesLiveData.value!!)
            convosData[currentConvoId] = oldMessages
            currentConvoId = convoId
            val newMessages: ArrayList<IMessage> = ArrayList()
            if(hasHistory){// TODO get history
                newMessages.add(MessageChat(Random.nextInt().toString(), 0, "notMe"))
            }
            messagesLiveData.value!!.clear()
            messagesLiveData.value!!.addAll(newMessages)
            messagesLiveData.postValue(messagesLiveData.value!!)

            val newTab = TabInfo(convoName, convoId)
            tabs.value!!.add(newTab)
            tabs.postValue(tabs.value!!)
            selectedTab.postValue(newTab)

            convosData[newTab.convoId] = messagesLiveData.value!!
        }
    }

    fun changeSelectedTab(tabInfo: TabInfo){
        convosData[tabInfo.convoId]?.let{
            selectedTab.postValue(tabInfo)

            messagesLiveData.value!!.clear()
            messagesLiveData.value!!.addAll(it)
            messagesLiveData.postValue(messagesLiveData.value!!)
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