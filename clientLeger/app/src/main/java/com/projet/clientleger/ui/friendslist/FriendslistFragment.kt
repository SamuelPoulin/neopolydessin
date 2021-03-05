package com.projet.clientleger.ui.friendslist

import androidx.lifecycle.ViewModelProvider
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.viewModels
import androidx.recyclerview.widget.LinearLayoutManager
import com.projet.clientleger.R
import com.projet.clientleger.data.enum.FriendStatus
import com.projet.clientleger.data.model.Friend
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject
import com.projet.clientleger.databinding.FriendslistFragmentBinding

@AndroidEntryPoint
class FriendslistFragment @Inject constructor(): Fragment() {
    val vm: FriendslistViewModel by viewModels()

    private var friends: ArrayList<Friend> = ArrayList()
    private lateinit var binding: FriendslistFragmentBinding

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.friendslist_fragment, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        friends.add(Friend("id", "user", FriendStatus.FRIEND, false))

        binding = FriendslistFragmentBinding.bind(view)
        binding.rvFriends.layoutManager = LinearLayoutManager(activity)
        binding.rvFriends.adapter = FriendsAdapter(friends)

    }

}