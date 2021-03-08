package com.projet.clientleger.ui.friendslist

import androidx.lifecycle.ViewModelProvider
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.os.bundleOf
import androidx.fragment.app.setFragmentResult
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.projet.clientleger.R
import com.projet.clientleger.data.enum.FriendStatus
import com.projet.clientleger.data.model.Friend
import com.projet.clientleger.data.model.FriendSimplified
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject
import com.projet.clientleger.databinding.FriendslistFragmentBinding
import kotlinx.android.synthetic.main.activity_register.*
import kotlinx.coroutines.launch

@AndroidEntryPoint
class FriendslistFragment @Inject constructor(): Fragment() {
    val vm: FriendslistViewModel by viewModels()

    private var friends: ArrayList<FriendSimplified> = ArrayList()
    private var binding: FriendslistFragmentBinding? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        vm.friendsLiveData.observe(this){list ->
            friends.clear()
            friends.addAll(list)
            binding?.rvFriends?.adapter?.notifyDataSetChanged()
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        binding = FriendslistFragmentBinding.inflate(inflater, container, false)
        return binding!!.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        binding?.rvFriends?.layoutManager = LinearLayoutManager(activity)
        binding?.rvFriends?.adapter = FriendsAdapter(friends, ::openFriendChat, ::acceptFriendRequest, ::refuseFriendRequest)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        binding = null
    }

    private fun openFriendChat(friendSimplified: FriendSimplified){
        setFragmentResult("openFriendChat", bundleOf("friend" to friendSimplified))
    }

    private fun acceptFriendRequest(idOfFriend: String){
        println("accept")
        lifecycleScope.launch {
            vm.acceptFriendRequest(idOfFriend)
        }
    }

    private fun refuseFriendRequest(idOfFriend: String){
        println("refuse")
        lifecycleScope.launch {
            vm.refuseFriendRequest(idOfFriend)
        }
    }
}