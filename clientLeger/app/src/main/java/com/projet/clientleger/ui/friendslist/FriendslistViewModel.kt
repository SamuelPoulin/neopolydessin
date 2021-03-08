package com.projet.clientleger.ui.friendslist

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.projet.clientleger.data.model.Friend
import com.projet.clientleger.data.model.FriendSimplified
import com.projet.clientleger.data.model.Friendslist
import com.projet.clientleger.data.repository.FriendslistRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.*
import javax.inject.Inject

@HiltViewModel
class FriendslistViewModel @Inject constructor(private val friendslistRepository: FriendslistRepository) : ViewModel() {
    var friendsLiveData: MutableLiveData<List<FriendSimplified>> = MutableLiveData(ArrayList())

    init {
        CoroutineScope(Job() + Dispatchers.Main).launch {
            val responseFriends = friendslistRepository.getFriends().friends
            val friendSimplifiedList = ArrayList<FriendSimplified>()
            for(friend in responseFriends){
                friendSimplifiedList.add(FriendSimplified(friend))
            }
            friendsLiveData.value = friendSimplifiedList.sortedWith(compareBy({it.status}, {it.friendId}))
        }
    }

    suspend fun acceptFriendRequest(idOfFriend: String){
        updateFriends(friendslistRepository.acceptFriend(idOfFriend))
    }

    suspend fun refuseFriendRequest(idOfFriend: String){
        updateFriends(friendslistRepository.refuseFriend(idOfFriend))
    }

    private fun updateFriends(friendslist: Friendslist){
        val friendSimplifiedList = ArrayList<FriendSimplified>()
        for(friend in friendslist.friends){
            friendSimplifiedList.add(FriendSimplified(friend))
        }
        friendsLiveData.value = friendSimplifiedList.sortedWith(compareBy({it.status}, {it.friendId}))
    }
}