package com.projet.clientleger.ui.friendslist

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.projet.clientleger.data.model.Friend
import com.projet.clientleger.data.repository.FriendslistRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.*
import javax.inject.Inject

@HiltViewModel
class FriendslistViewModel @Inject constructor(private val friendslistRepository: FriendslistRepository) : ViewModel() {
    var friendsLiveData: MutableLiveData<List<Friend>> = MutableLiveData(ArrayList<Friend>())

    init {
        CoroutineScope(Job() + Dispatchers.Main).launch {
            friendsLiveData.value = friendslistRepository.getFriends().friends
        }
    }
}