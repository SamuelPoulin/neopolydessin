package com.projet.clientleger.ui.friendslist

import android.widget.Toast
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.google.android.material.snackbar.Snackbar
import com.projet.clientleger.data.enumData.FriendStatus
import com.projet.clientleger.data.enumData.FriendsAction
import com.projet.clientleger.data.model.friendslist.Friend
import com.projet.clientleger.data.model.friendslist.FriendNotification
import com.projet.clientleger.data.model.friendslist.FriendSimplified
import com.projet.clientleger.data.repository.FriendslistRepository
import com.projet.clientleger.data.service.AudioService
import com.projet.clientleger.data.service.AvatarStorageService
import dagger.hilt.android.lifecycle.HiltViewModel
import io.reactivex.rxjava3.core.Observable
import kotlinx.coroutines.*
import javax.inject.Inject

@HiltViewModel
class FriendslistViewModel @Inject constructor(private val friendslistRepository: FriendslistRepository, private val audioService: AudioService, private val avatarStorageService: AvatarStorageService) : ViewModel() {
    var friendsLiveData: MutableLiveData<List<FriendSimplified>> = MutableLiveData(ArrayList())

    init {
        getFriendslist()
        friendslistRepository.updateFriendslist().subscribe {
            updateFriends(it)
        }
        friendslistRepository.receiveNotification().subscribe {
            when (it.type.actionNeeded) {
                FriendsAction.GET_UPDATE -> getFriendslist()
                FriendsAction.SHOW_NOTIFICATION -> showNotification(it)
                FriendsAction.NONE -> {
                }
            }
        }
        friendslistRepository.receiveAvatarNotificatino().subscribe { pair ->
            CoroutineScope(Job() + Dispatchers.IO).launch {
                avatarStorageService.updateFriendAvatar(pair.first, pair.second)
                friendsLiveData.value?.let { friends ->
                    (friends.find { it.friendId == pair.first } as FriendSimplified).avatar = avatarStorageService.getFriendAvatar(pair.first)
                    friendsLiveData.postValue(friends)
                }
            }
        }
    }

    fun receiveInvite(): Observable<Pair<String, String>> {
        return friendslistRepository.receiveInvite()
    }

    private fun getFriendslist() {
        CoroutineScope(Job() + Dispatchers.Main).launch {
            updateFriends(friendslistRepository.getFriends())
        }
    }

    private fun showNotification(notification: FriendNotification) {

    }

    suspend fun deleteFriend(friendId: String) {
        updateFriends(friendslistRepository.deleteFriend(friendId))
    }

    suspend fun sendFriendRequest(friendUsername: String) {
        updateFriends(friendslistRepository.sendFriendRequest(friendUsername))
    }

    suspend fun acceptFriendRequest(idOfFriend: String) {
        updateFriends(friendslistRepository.acceptFriend(idOfFriend))
    }

    suspend fun refuseFriendRequest(idOfFriend: String) {
        updateFriends(friendslistRepository.refuseFriend(idOfFriend))
    }

    private fun updateFriends(friendslist: ArrayList<Friend>) {
        CoroutineScope(Job() + Dispatchers.IO).launch {
            val friendSimplifiedList = ArrayList<FriendSimplified>()
            avatarStorageService.addFriends(friendslist)
            for (friend in friendslist) {
                if (friend.friendId != null) {
                    val avatar = avatarStorageService.getFriendAvatar(friend.friendId!!._id!!)
                    friendSimplifiedList.add(FriendSimplified(friend, avatar))
                }
            }
            val orderedList = friendSimplifiedList.sortedWith(compareBy({ it.status }, { it.friendId }))
            friendSimplifiedList.clear()
            friendSimplifiedList.addAll(orderedList)

            friendSimplifiedList.add(0, FriendSimplified("Requêtes"))

            var requestIndex = friendSimplifiedList.indexOfFirst { it.status == FriendStatus.ACCEPTED }
            if (requestIndex < 0)
                requestIndex = friendSimplifiedList.size
            friendSimplifiedList.add(requestIndex, FriendSimplified("Amis"))

            friendsLiveData.postValue(friendSimplifiedList)
        }
    }

    fun playSound(soundId: Int) {
        audioService.playSound(soundId)
    }

    fun inviteFriend(friendId: String) {
        friendslistRepository.inviteFriend(friendId)
    }
}