package com.projet.clientleger.data.service

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.http.ApiAvatarInterface
import com.projet.clientleger.data.api.model.lobby.Player
import com.projet.clientleger.data.model.account.AccountInfo
import com.projet.clientleger.data.model.friendslist.Friend
import com.projet.clientleger.utils.BitmapConversion
import javax.inject.Inject
import javax.inject.Singleton
import javax.net.ssl.HttpsURLConnection

@Singleton
class AvatarStorageService @Inject constructor(val sessionManager: SessionManager, private val apiAvatarInterface: ApiAvatarInterface) {
    private val gameAvatars: HashMap<String, Bitmap> = HashMap()
    private val friendsAvatars: HashMap<String, Bitmap> = HashMap()

    fun addFriends(friends: ArrayList<Friend>) {
        for (friend in friends) {
            if (isValidFriend(friend)) {
                val resAvatar = sessionManager.request(friend.friendId!!.avatar, apiAvatarInterface::getAvatar)
                if (resAvatar.code() == HttpsURLConnection.HTTP_OK) {
                    val avatar = BitmapFactory.decodeStream(resAvatar.body()!!.byteStream())
                    friendsAvatars[friend.friendId!!._id!!] = BitmapConversion.toRoundedBitmap(avatar)
                }
            }
        }

    }

    fun isValidFriend(friend: Friend): Boolean {
        return !friendsAvatars.containsKey(friend.friendId?._id) && friend.friendId != null && friend.friendId?._id != null
    }

    fun updateFriendAvatar(friendId: String, avatarId: String){
        val resAvatar = sessionManager.request(avatarId, apiAvatarInterface::getAvatar)
        if (resAvatar.code() == HttpsURLConnection.HTTP_OK) {
            val avatar = BitmapFactory.decodeStream(resAvatar.body()!!.byteStream())
            friendsAvatars[friendId] = BitmapConversion.toRoundedBitmap(avatar)
        }
    }

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

    fun addPlayer(accountInfo: AccountInfo) {
        if (gameAvatars.containsKey(accountInfo.accountId))
            return
        gameAvatars[accountInfo.accountId] = accountInfo.avatar
    }

    fun getAvatar(accountId: String?): Bitmap? {
        return gameAvatars[accountId]
    }

    fun getFriendAvatar(friendId: String): Bitmap? {
        return friendsAvatars[friendId]
    }

    fun clear() {
        gameAvatars.clear()
    }
}