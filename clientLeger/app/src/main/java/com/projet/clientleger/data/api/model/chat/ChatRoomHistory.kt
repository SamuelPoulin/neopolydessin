package com.projet.clientleger.data.api.model.chat

import com.projet.clientleger.data.model.chat.MessageChat
import kotlinx.serialization.Serializable

@Serializable
data class ChatRoomHistory(val roomName: String, val messages: ArrayList<RoomMessage>){
    fun messagesToMessagesChat():ArrayList<MessageChat>{
        val list = ArrayList<MessageChat>()

        for(message in messages){
            list.add(message.toMessageChat())
        }
        return list
    }
}
