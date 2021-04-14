package com.projet.clientleger.ui.friendslist

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.projet.clientleger.data.model.Friend
import com.projet.clientleger.data.model.FriendSimplified
import com.projet.clientleger.data.model.Friendslist
import com.projet.clientleger.data.repository.FriendslistRepository
import com.projet.clientleger.data.service.AudioService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.*
import javax.inject.Inject

@HiltViewModel
class FriendslistViewModel @Inject constructor(private val friendslistRepository: FriendslistRepository,private val audioService: AudioService) : ViewModel() {
    var friendsLiveData: MutableLiveData<List<FriendSimplified>> = MutableLiveData(ArrayList())

    init {
        CoroutineScope(Job() + Dispatchers.Main).launch {
            updateFriends(friendslistRepository.getFriends())
        }
        friendslistRepository.friendRequestReceived().subscribe{
            updateFriends(it.friends as ArrayList<Friend>)
        }
        friendslistRepository.updateFriendslist().subscribe{
            updateFriends(it.friends as ArrayList<Friend>)
        }
        friendslistRepository.friendRequestAccepted().subscribe{
            updateFriends(it.friends as ArrayList<Friend>)
        }
        friendslistRepository.friendRequestRefused().subscribe{
            updateFriends(it.friends as ArrayList<Friend>)
        }
    }

    suspend fun sendFriendRequest(friendUsername: String){
        updateFriends(friendslistRepository.sendFriendRequest(friendUsername))
    }

    suspend fun acceptFriendRequest(idOfFriend: String){
        updateFriends(friendslistRepository.acceptFriend(idOfFriend))
    }

    suspend fun refuseFriendRequest(idOfFriend: String){
        updateFriends(friendslistRepository.refuseFriend(idOfFriend))
    }

    private fun updateFriends(friendslist: ArrayList<Friend>){

        val friendSimplifiedList = ArrayList<FriendSimplified>()
        for(friend in friendslist){
            if(friend.friendId != null)
                friendSimplifiedList.add(FriendSimplified(friend))
        }
        friendsLiveData.postValue(friendSimplifiedList.sortedWith(compareBy({it.status}, {it.friendId})))
    }
    fun playSound(soundId:Int){
        audioService.playSound(soundId)
    }
}