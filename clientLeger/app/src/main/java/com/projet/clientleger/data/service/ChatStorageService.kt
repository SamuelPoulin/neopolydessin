package com.projet.clientleger.data.service

import android.app.Service
import android.content.Intent
import android.os.Binder
import android.os.IBinder
import com.google.android.material.tabs.TabLayout
import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.model.chat.ReceivedPrivateMessage
import com.projet.clientleger.data.api.model.chat.RoomMessage
import com.projet.clientleger.data.api.model.chat.RoomSystemMessage
import com.projet.clientleger.data.enumData.TabType
import com.projet.clientleger.data.model.account.AccountInfo
import com.projet.clientleger.data.model.chat.*
import com.projet.clientleger.data.repository.ChatRepository
import com.projet.clientleger.ui.chat.ChatFragment
import com.projet.clientleger.ui.chat.ChatViewModel
import com.projet.clientleger.ui.lobby.viewmodel.LobbyViewModel
import dagger.hilt.android.AndroidEntryPoint
import io.reactivex.rxjava3.core.Observable
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import javax.inject.Inject

const val GENERAL_ROOM_ID = "general"

@AndroidEntryPoint
class ChatStorageService @Inject constructor() : Service() {

    @Inject
    lateinit var chatRepository: ChatRepository

    @Inject
    lateinit var sessionManager: SessionManager

    private val convos: ArrayList<Convo> = ArrayList()
    lateinit var accountInfo: AccountInfo
    var currentConvo: Convo? = null
    var convosListeners: ArrayList<(ArrayList<Convo>) -> Unit> = ArrayList()
    private var currentConvoListeners: ArrayList<() -> Unit> = ArrayList()
    private var currentTabListeners: ArrayList<(TabInfo?) -> Unit> = ArrayList()

    //Hashmap: AccountId - username
    private val friendslistUsernames: HashMap<String, String> = HashMap()
    private val binder = LocalBinder()

    inner class LocalBinder : Binder() {
        fun getService(): ChatStorageService = this@ChatStorageService
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        accountInfo = sessionManager.getAccountInfo()
        receiveMsgSubscriptions()
        addNewConvo(TabInfo("General", GENERAL_ROOM_ID, TabType.STATIC_ROOM), true)
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder {
        return binder
    }


    private fun receiveMsgSubscriptions() {
        chatRepository.receivePlayerConnection().subscribe {
            val tabInfo = TabInfo(LobbyViewModel.GAME_TAB_NAME, ChatViewModel.GAME_TAB_ID, TabType.GAME)
            receiveMessage(it, tabInfo)
        }
        chatRepository.receivePlayerDisconnection().subscribe {
            val tabInfo = TabInfo(LobbyViewModel.GAME_TAB_NAME, ChatViewModel.GAME_TAB_ID, TabType.GAME)
            receiveMessage(it, tabInfo)
        }
        chatRepository.receiveMessage().subscribe {
            val tabInfo = TabInfo(LobbyViewModel.GAME_TAB_NAME, ChatViewModel.GAME_TAB_ID, TabType.GAME)
            receiveMessage(it, tabInfo)
        }
        chatRepository.receivePrivateMessage().subscribe {
            val chatVersion = messageIdToMessageChat(it)
            // TODO
            val convoId: String = if (it.senderAccountId != accountInfo.accountId) it.senderAccountId else it.receiverAccountId
            val tabInfo = TabInfo(chatVersion.senderUsername, convoId, TabType.FRIEND)
            receiveMessage(chatVersion, tabInfo)
        }
        chatRepository.receiveGuess().subscribe {
            val tabInfo = TabInfo(LobbyViewModel.GAME_TAB_NAME, ChatViewModel.GAME_TAB_ID, TabType.GAME)
            receiveMessage(it, tabInfo)
        }
        chatRepository.receiveRoomMessage().subscribe {
            val message: IMessage
            val tabInfo: TabInfo
            val isSystem: Boolean
            if (it is RoomMessage) {
                tabInfo = TabInfo(it.roomName, it.roomName, TabType.ROOM)
                message = it.toMessageChat()
                isSystem = false
            } else {
                it as RoomSystemMessage
                tabInfo = TabInfo(it.roomName, it.roomName, TabType.ROOM)
                message = it.toMessageSystem()
                isSystem = true
            }
            receiveMessage(message, tabInfo, isSystem)
        }
    }

    private fun receiveMessage(newMessage: IMessage, tabInfo: TabInfo, isSystem: Boolean = false) {
        val newMessageConvo = convos.find { it.tabInfo.convoId == tabInfo.convoId }
        if (newMessageConvo != null) {
            newMessageConvo.messages.add(newMessage)
        } else{
            if(!isSystem){
                addNewConvo(tabInfo, false)
                notifyUpdateTab(tabInfo.convoId)
            }
        }
        emitConvosChange()
        emitCurrentConvoChange()

        // If not selected tab
//        if (tabInfo.convoId != currentConvo?.tabInfo?.convoId) {
//            changeSelectedConvo(tabInfo)
//            emitCurrentConvoChange()
//        }
    }

    private fun messageIdToMessageChat(msg: ReceivedPrivateMessage): MessageChat {
        val convoId = if (msg.senderAccountId != accountInfo.accountId) msg.senderAccountId else msg.receiverAccountId
        val convoOfMsg = convos.find { it.tabInfo.convoId == convoId }
        return if (convoOfMsg != null) {
            val senderUsername = if (msg.senderAccountId == accountInfo.accountId) accountInfo.username else convoOfMsg.tabInfo.convoName
            MessageChat(msg.content, msg.timestamp, senderUsername)
        } else {
            val senderUsername = friendslistUsernames[msg.senderAccountId] ?: "idk man"

            MessageChat(msg.content, msg.timestamp, senderUsername)
        }
    }

    fun addNewConvo(tabInfo: TabInfo, isSelected: Boolean) {
        if (convos.find { it.tabInfo.convoId == tabInfo.convoId } == null) {
            if(tabInfo.tabType != TabType.GAME){
                getHistory(tabInfo).subscribe { messages ->
                    convos.add(Convo(tabInfo, messages))
                    emitConvosChange()
                    if (isSelected)
                        changeSelectedConvo(tabInfo)
                }
            } else {
                addEmptyTab(tabInfo, 0, true)
            }
        }
    }
    private fun getHistory(tabInfo: TabInfo): Observable<ArrayList<IMessage>> {
        return Observable.create { emitter ->
            if (tabInfo.tabType == TabType.FRIEND) {
                CoroutineScope(Job() + Dispatchers.IO).launch {
                    val listMessageId = chatRepository.getChatFriendHistory(1, tabInfo.convoId, ChatViewModel.NB_MESSAGES_PER_PAGE)
                    val newMessages = friendsMessageToMessagesChat(listMessageId, tabInfo)
                    emitter.onNext(newMessages)
                }
            } else {
                chatRepository.getRoomHistory(tabInfo.convoId, 1, 20).subscribe {
                    val messages = ArrayList<IMessage>()
                    messages.addAll(it.messagesToMessagesChat())
                    emitter.onNext(messages)
                }
            }
        }
    }

    private fun friendsMessageToMessagesChat(messages: ArrayList<MessageId>, tabInfo: TabInfo): ArrayList<IMessage> {
        val messagesChat: ArrayList<IMessage> = ArrayList()
        for (message in messages) {
            val username = if (message.senderAccountId == accountInfo.accountId)
                accountInfo.username
            else tabInfo.convoName

            messagesChat.add(message.toMessageChat(username))
        }
        return messagesChat
    }

    fun removeConvo(convoId: String) {
        val convoToRemove = convos.find { it.tabInfo.convoId == convoId }
        if (convoToRemove != null) {
            if (convoToRemove.tabInfo.convoId == currentConvo?.tabInfo?.convoId)
                changeSelectedConvo(convos.find { it.tabInfo.convoId != convoId }?.tabInfo)
            convos.removeIf { it.tabInfo.convoId == convoId }
            emitConvosChange()
        }
    }

    fun subscribeCurrentConvoChange(listener: () -> Unit) {
        currentConvoListeners.add(listener)
    }

    fun subscribeConvosChange(listener: (ArrayList<Convo>) -> Unit) {
        convosListeners.add(listener)
    }

    fun subscribeCurrentTabChange(listener: (TabInfo?) -> Unit) {
        currentTabListeners.add(listener)
    }

    fun changeSelectedConvo(tabInfo: TabInfo?) {
        val convo = convos.find { it.tabInfo.convoId == tabInfo?.convoId }
        if (convo != null) {
            currentConvo = convo
            emitCurrentTabChange()
        }
    }

    private fun emitConvosChange() {
        for (listener in convosListeners)
            listener.invoke(convos)
    }

    private fun emitCurrentConvoChange() {
        for (listener in currentConvoListeners)
            listener.invoke()
    }

    private fun emitCurrentTabChange() {
        for (listener in currentTabListeners)
            listener.invoke(currentConvo?.tabInfo)
    }

    private fun notifyUpdateTab(convoId: String) {
        // TODO
    }

    private fun addMessageIdToList(messageId: MessageId, list: ArrayList<IMessage>) {
        list.add(MessageChat(messageId.content, messageId.timestamp, messageId.senderAccountId))
    }

    fun clear() {
        convos.clear()
    }

    private fun addEmptyTab(tabInfo: TabInfo, index: Int = 0, isSelected: Boolean = false) {
        convos.add(index, Convo(tabInfo, ArrayList()))
        emitConvosChange()
        if (isSelected)
            changeSelectedConvo(tabInfo)
    }

    fun getConvos(): ArrayList<Convo> {
        return convos
    }

    fun addFriendslistUsernames(usernames: HashMap<String, String> ){
        friendslistUsernames.putAll(usernames)
    }
}