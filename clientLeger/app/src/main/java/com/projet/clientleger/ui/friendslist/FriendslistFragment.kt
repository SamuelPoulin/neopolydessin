package com.projet.clientleger.ui.friendslist

import androidx.lifecycle.ViewModelProvider
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import androidx.appcompat.app.AlertDialog
import androidx.core.os.bundleOf
import androidx.fragment.app.setFragmentResult
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.projet.clientleger.data.model.FriendSimplified
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject
import com.projet.clientleger.databinding.FriendslistFragmentBinding
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

@AndroidEntryPoint
class FriendslistFragment @Inject constructor() : Fragment() {
    val vm: FriendslistViewModel by viewModels()

    private var friends: ArrayList<FriendSimplified> = ArrayList()
    private var binding: FriendslistFragmentBinding? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        vm.friendsLiveData.observe(this) { list ->
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
        binding?.rvFriends?.adapter =
            FriendsAdapter(friends, ::openFriendChat, ::acceptFriendRequest, ::refuseFriendRequest)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        binding = null
    }

    private fun openFriendChat(friendSimplified: FriendSimplified) {
        setFragmentResult("openFriendChat", bundleOf("friend" to friendSimplified))
    }

    private fun acceptFriendRequest(idOfFriend: String) {
        lifecycleScope.launch {
            vm.acceptFriendRequest(idOfFriend)
        }
    }

    private fun refuseFriendRequest(idOfFriend: String) {
        lifecycleScope.launch {
            vm.refuseFriendRequest(idOfFriend)
        }
    }

    fun showAddFriendDialog() {
        activity?.let {
            val input = EditText(it)
            val dialog = AlertDialog.Builder(it).setTitle("Ajouter un ami").setView(input)
                .setPositiveButton("Envoyer") { dialog, id ->
                    CoroutineScope(Job() + Dispatchers.Main).launch {
                        vm.sendFriendRequest(input.text.toString())
                    }
                }
                .show()
        }
    }
}