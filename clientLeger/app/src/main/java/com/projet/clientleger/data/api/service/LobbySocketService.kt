package com.projet.clientleger.data.api.service

import com.projet.clientleger.BuildConfig
import com.projet.clientleger.data.model.MessageChat
import io.socket.client.IO
import org.json.JSONObject
import io.socket.client.Socket
import java.net.URISyntaxException
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class LobbySocketService @Inject constructor(private val socketService: SocketService) {

    fun createGame(gameMode:String,difficulty:String, isPrivate:Boolean) {
        val obj: JSONObject = JSONObject()
        obj.put("gameTyoe", gameMode)
        obj.put("difficulty", difficulty)
        obj.put("privacySetting", isPrivate)
        socketService.socket.emit("CreateLobby", obj)
    }
}