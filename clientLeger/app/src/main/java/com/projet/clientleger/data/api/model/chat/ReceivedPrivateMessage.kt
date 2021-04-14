package com.projet.clientleger.data.api.model.chat

import com.projet.clientleger.data.model.chat.IMessage
import com.projet.clientleger.data.model.chat.IMessageSystem
import com.projet.clientleger.data.model.chat.MessageChat
import kotlinx.serialization.Serializable

@Serializable
data class ReceivedPrivateMessage(override var content: String, override var timestamp: Long, var senderAccountId: String, var receiverAccountId: String): IMessageSystem{
    fun toMessageChat(usernamesMap: HashMap<String, String>): MessageChat{
        var username = usernamesMap[senderAccountId]
        if(username == null)
            username = "nom d'utilisateur inconnue"
        return MessageChat(content, timestamp, username)
    }
}
