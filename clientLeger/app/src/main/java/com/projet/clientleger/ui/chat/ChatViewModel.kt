package com.projet.clientleger.ui.chat

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
class ChatViewModel @Inject constructor(private val chatRepository: ChatRepository, private val chatStorageService: ChatStorageService):ViewModel() {
    companion object {
        const val NB_MESSAGES_PER_PAGE = 20
        const val GAME_TAB_ID = "GAME"
    }
    val messageContentLiveData: MutableLiveData<String> = MutableLiveData("")
    val messagesLiveData: MutableLiveData<ArrayList<IMessage>> = MutableLiveData(ArrayList())
    val convosData: HashMap<String, ArrayList<IMessage>> = HashMap()
    val tabs: MutableLiveData<ArrayList<TabInfo>> = MutableLiveData(ArrayList())
    val accountInfo: AccountInfo = chatRepository.getAccountInfo()
    val isGuessing: MutableLiveData<Boolean> = MutableLiveData(false)
    val isGuesser: MutableLiveData<Boolean> = MutableLiveData(false)
    val currentTab: MutableLiveData<TabInfo> = MutableLiveData(TabInfo())

    init {
        receiveGameMessage()
        receivePlayerConnection()
        receivePlayerDisconnect()
        chatRepository.receiveGuessClassic().subscribe{
            println("guess received")
            receiveMessage(it, TabInfo(LobbyViewModel.GAME_TAB_NAME, GAME_TAB_ID, false))
        }
        receivePrivateMessageSubscription()
    }

    fun fetchSavedData(){
        convosData.clear()
        convosData.putAll(chatStorageService.getConvos())

        tabs.value!!.clear()
        tabs.value!!.addAll(chatStorageService.getTabs())
        tabs.value?.let {
            if(it.isNotEmpty())
                changeSelectedTab(tabs.value!!.first())
            tabs.postValue(it)
        }

        currentTab.postValue(chatStorageService.selectedTab)
    }

    fun addNewTab(tabInfo: TabInfo){
        if(convosData[tabInfo.convoId] != null)
            changeSelectedTab(tabInfo)
        else{
            val oldMessages = ArrayList<IMessage>()
            oldMessages.addAll(messagesLiveData.value!!)
            convosData[currentTab.value!!.convoId] = oldMessages
            currentTab.postValue(tabInfo)
            val newMessages: ArrayList<IMessage> = ArrayList()
            if(tabInfo.isDM){
                CoroutineScope(Job() + Dispatchers.Main).launch {
                    val res = chatRepository.getChatFriendHistory(1, tabInfo.convoId, NB_MESSAGES_PER_PAGE)
                    if(res.code() == HttpsURLConnection.HTTP_OK){
                        newMessages.addAll(res.body()!!)
                    }
                }
            }
            messagesLiveData.value!!.clear()
            messagesLiveData.value!!.addAll(newMessages)
            messagesLiveData.postValue(messagesLiveData.value!!)

            tabs.value!!.add(tabInfo)
            tabs.postValue(tabs.value!!)
            currentTab.postValue(tabInfo)
        }
    }

    fun removeTab(tabInfo: TabInfo){
        val newSelectedTab = tabs.value!!.find { it.convoId != tabInfo.convoId }
        if(newSelectedTab != null){

        } else{
            messagesLiveData.value!!.clear()
            messagesLiveData.postValue(messagesLiveData.value!!)
            tabs.value!!.clear()
            tabs.postValue(tabs.value!!)
            currentTab.postValue(TabInfo())
        }
    }

    fun changeSelectedTab(tabInfo: TabInfo){
        convosData[tabInfo.convoId]?.let{
            val oldMessages = ArrayList<IMessage>()
            oldMessages.addAll(messagesLiveData.value!!)
            convosData[currentTab.value!!.convoId] = oldMessages

            currentTab.postValue(tabInfo)

            messagesLiveData.value!!.clear()
            messagesLiveData.value!!.addAll(it)
            messagesLiveData.postValue(messagesLiveData.value!!)
        }
    }

    fun sendMessage(){
        messageContentLiveData.value?.let{
            if(currentTab.value!!.isDM)
                chatRepository.sendPrivateMessage(it, currentTab.value!!.convoId)
            else{
                if(isGuessing.value!!) {
                    chatRepository.sendGuess(it)
                } else {
                    chatRepository.sendMessage(Message(formatMessageContent(it)))
                }
            }
        }
    }

    private fun receiveGameMessage(){
        chatRepository.receiveMessage().subscribe{
            receiveMessage(it, TabInfo(LobbyViewModel.GAME_TAB_NAME, GAME_TAB_ID, false))
        }
    }

    private fun receivePrivateMessageSubscription(){
        chatRepository.receivePrivateMessage().subscribe{ msg ->
            val convoId: String =
                    if(msg.receiverAccountId != accountInfo.accountId)
                        msg.receiverAccountId
                    else
                        msg.senderAccountId

            val convoName = (tabs.value!!.find { it.convoId == convoId } as TabInfo).convoName
            receiveMessage(msg.toMessageChat(), TabInfo(convoName, convoId, true))
        }
    }

    private fun receivePlayerConnection(){
        chatRepository.receivePlayerConnection().subscribe{
            it.content = "${it.content} a rejoint la discussion"
            receiveMessage(it, TabInfo(LobbyViewModel.GAME_TAB_NAME, GAME_TAB_ID, false))
        }
    }

    private fun receivePlayerDisconnect(){
        chatRepository.receivePlayerDisconnection().subscribe{
            it.content = "${it.content} a quitté la discussion"
            receiveMessage(it, TabInfo(LobbyViewModel.GAME_TAB_NAME, GAME_TAB_ID, false))
        }
    }

    private fun formatMessageContent(messageContent: String): String {
        var adjustedText: String = messageContent.replace("\\s+".toRegex(), " ")
        adjustedText = adjustedText.trimStart()
        return adjustedText
    }

    private fun receiveMessage(newMessage: IMessage, tabInfo: TabInfo){
        if(tabInfo.convoId != currentTab.value!!.convoId){
            if(convosData.containsKey(tabInfo.convoId)){
                convosData[tabInfo.convoId]?.add(newMessage)
                notifyUpdateTab(tabInfo.convoId)
            } else{
                addNewTab(tabInfo)
            }
        } else {
            println("receive message : ${newMessage}-----------")
            messagesLiveData.value!!.add(newMessage)
            messagesLiveData.postValue(messagesLiveData.value)
        }
    }

    private fun notifyUpdateTab(convoId: String){
        // TODO
    }

    fun saveData(){
        chatStorageService.saveData(convosData, tabs.value!!, currentTab.value!!)
    }

    fun clear(){
        chatRepository.clearSocketSubscriptions()
    }
}