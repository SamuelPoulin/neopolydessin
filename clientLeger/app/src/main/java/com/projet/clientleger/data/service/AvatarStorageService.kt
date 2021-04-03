package com.projet.clientleger.data.service

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.http.ApiAvatarInterface
import com.projet.clientleger.data.api.model.lobby.Player
import com.projet.clientleger.utils.BitmapConversion
import javax.inject.Inject
import javax.inject.Singleton
import javax.net.ssl.HttpsURLConnection

@Singleton
class AvatarStorageService @Inject constructor(val sessionManager: SessionManager, val apiAvatarInterface: ApiAvatarInterface) {
    private val gameAvatars: HashMap<String, Bitmap> = HashMap()

    fun addPlayer(player: Player) {
        if (gameAvatars.containsKey(player.accountId))
            return

        if (player.avatarId != null && player.accountId != null) {
            val resAvatar = sessionManager.request(player.avatarId, apiAvatarInterface::getAvatar)
            if (resAvatar.code() == HttpsURLConnection.HTTP_OK) {
                val avatar = BitmapFactory.decodeStream(resAvatar.body()!!.byteStream())
                gameAvatars[player.accountId!!] = BitmapConversion.toRoundedBitmap(avatar)
            }
        }
    }

    fun getAvatar(accountId: String?): Bitmap?{
        return gameAvatars[accountId]
    }

    fun clear(){
        gameAvatars.clear()
    }
}