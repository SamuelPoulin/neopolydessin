package com.projet.clientleger.data.service

import android.app.Service
import android.content.Intent
import android.os.Binder
import android.os.IBinder
import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.model.chat.ReceivedPrivateMessage
import com.projet.clientleger.data.model.account.AccountInfo
import com.projet.clientleger.data.model.chat.*
import com.projet.clientleger.data.repository.ChatRepository
import com.projet.clientleger.ui.chat.ChatViewModel
import com.projet.clientleger.ui.lobby.viewmodel.LobbyViewModel
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class ChatStorageService @Inject constructor(): Service() {

    @Inject
    lateinit var chatRepository: ChatRepository

    @Inject
    lateinit var sessionManager: SessionManager

    private val convos: ArrayList<Convo> = ArrayList()
    lateinit var accountInfo: AccountInfo
    var currentConvo: Convo? = null
    lateinit var convosListeners: ArrayList<() -> Unit>
    private lateinit var currentConvoListeners: ArrayList<() -> Unit>
    private lateinit var currentTabListeners: ArrayList<(TabInfo?) -> Unit>
    private val binder = LocalBinder()

    inner class LocalBinder : Binder(){
        fun getService(): ChatStorageService = this@ChatStorageService
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        currentConvoListeners = ArrayList()
        convosListeners = ArrayList()
        currentTabListeners = ArrayList()

        accountInfo = sessionManager.getAccountInfo()
        chatRepository.receiveMessage().subscribe{
            receiveMessage(it, TabInfo(LobbyViewModel.GAME_TAB_NAME, ChatViewModel.GAME_TAB_ID, false))
        }
        chatRepository.receivePrivateMessage().subscribe{
            val convoId = if(it.senderAccountId != accountInfo.accountId) it.senderAccountId else it.receiverAccountId
            receiveMessage(it, TabInfo(convoId = convoId, isDM = true))
        }
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder {
        return binder
    }

    private fun receiveMessage(newMessage: IMessage, tabInfo: TabInfo){
        if(tabInfo.convoId != currentConvo?.tabInfo?.convoId){
            val newMessageConvo = convos.find { it.tabInfo.convoId == currentConvo?.tabInfo?.convoId }
            if(newMessageConvo != null){
                addMessageIdToList(newMessage as MessageId, newMessageConvo.messages)
                notifyUpdateTab(tabInfo.convoId)
            } else{
                addNewConvo(tabInfo, false)
            }
            emitConvosChange()
        } else {
            val newMessageConvo = convos.find { it.tabInfo.convoId == currentConvo?.tabInfo?.convoId }
            if(newMessageConvo != null) {
                val messageId = newMessage as ReceivedPrivateMessage
                newMessageConvo.messages.add(MessageChat(messageId.content, messageId.timestamp, messageId.senderAccountId))
                emitCurrentConvoChange()
            }
        }
    }

    fun addNewConvo(tabInfo: TabInfo, isSelected: Boolean){
        if(convos.find { it.tabInfo.convoId == tabInfo.convoId } == null){
            var newMessages: ArrayList<IMessage> = ArrayList()
            if(tabInfo.isDM){
                CoroutineScope(Job() + Dispatchers.Main).launch {
                    val listMessageId = chatRepository.getChatFriendHistory(1, tabInfo.convoId, ChatViewModel.NB_MESSAGES_PER_PAGE)
                    newMessages = messageIdListToMessageChatList(listMessageId)
                }
            }
            convos.add(Convo(tabInfo, messages = newMessages))
            emitConvosChange()
        }
        if (isSelected)
            changeSelectedConvo(tabInfo)
    }

    fun removeConvo(convoId: String){
        val convoToRemove = convos.find { it.tabInfo.convoId == convoId }
        if(convoToRemove != null){
            if(convoToRemove.tabInfo.convoId == currentConvo?.tabInfo?.convoId)
                changeSelectedConvo(convos.find { it.tabInfo.convoId != convoId }?.tabInfo)
            convos.removeIf { it.tabInfo.convoId == convoId }
            emitConvosChange()
        }
    }

    private fun messageIdListToMessageChatList(listMessageId: ArrayList<MessageId>):ArrayList<IMessage>{
        return ArrayList()
    }

    fun subscribeCurrentConvoChange(listener : () -> Unit){
        currentConvoListeners.add(listener)
    }

    fun subscribeConvosChange(listener : () -> Unit){
        convosListeners.add(listener)
    }

    private fun emitCurrentTabChange(){
        for (listener in currentTabListeners)
            listener.invoke(currentConvo?.tabInfo)
    }

    private fun changeSelectedConvo(tabInfo: TabInfo?){
        val convo = convos.find { it.tabInfo.convoId == tabInfo?.convoId }
        if(convo != null){
            currentConvo = convo
            emitCurrentTabChange()
        }
    }

    private fun emitConvosChange(){
        for (listener in convosListeners)
            listener.invoke()
    }

    private fun emitCurrentConvoChange(){
        for(listener in currentConvoListeners)
            listener.invoke()
    }

    private fun notifyUpdateTab(convoId: String){
        // TODO
    }

    private fun addMessageIdToList(messageId: MessageId, list: ArrayList<IMessage>){
        list.add(MessageChat(messageId.content, messageId.timestamp, messageId.senderAccountId))
    }

//    fun getTabs(): ArrayList<TabInfo> {
//        return tabs
//    }

    fun getConvos(): ArrayList<Convo> {
        return convos
    }

    fun saveData(convosToSave: ArrayList<Convo> , selectedConvoId: String) {

        convos.clear()
        convos.addAll(convosToSave)

//        tabs.clear()
//        tabs.addAll(tabsToSave.distinctBy { it.convoId })
    }

    fun clear() {
//        tabs.clear()
        convos.clear()
    }

    fun addEmptyTab(tabInfo: TabInfo, index: Int = 0, isSelected: Boolean = false){
    }
}