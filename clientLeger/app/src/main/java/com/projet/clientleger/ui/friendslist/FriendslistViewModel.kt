package com.projet.clientleger.ui.friendslist

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.projet.clientleger.data.model.Friend
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

@HiltViewModel
class FriendslistViewModel @Inject constructor() : ViewModel() {
    val friendsLiveData: MutableLiveData<ArrayList<Friend>> = MutableLiveData()
}