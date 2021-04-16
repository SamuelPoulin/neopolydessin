package com.projet.clientleger.ui.friendslist

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.os.Bundle
import android.os.IBinder
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import androidx.appcompat.app.AlertDialog
import androidx.core.content.ContextCompat
import androidx.core.os.bundleOf
import androidx.fragment.app.setFragmentResult
import androidx.fragment.app.setFragmentResultListener
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.android.material.snackbar.Snackbar
import com.projet.clientleger.R
import com.projet.clientleger.data.enumData.SoundId
import com.projet.clientleger.data.model.friendslist.FriendSimplified
import com.projet.clientleger.data.service.ChatStorageService
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject
import com.projet.clientleger.databinding.FriendslistFragmentBinding
import com.projet.clientleger.ui.IAcceptGameInviteListener
import com.projet.clientleger.utils.BitmapConversion
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

@AndroidEntryPoint
class FriendslistFragment @Inject constructor() : Fragment() {
    val vm: FriendslistViewModel by viewModels()

    private var friends: ArrayList<FriendSimplified> = ArrayList()
    private var binding: FriendslistFragmentBinding? = null
    private var chatService: ChatStorageService? = null

    private val chatConnection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            chatService = (service as ChatStorageService.LocalBinder).getService()
            chatService?.addFriendslistUsernames(createUsernamesMap())
        }

        override fun onServiceDisconnected(name: ComponentName?) {
        }
    }

    override fun onStart() {
        super.onStart()

        Intent(requireContext(), ChatStorageService::class.java).also { intent ->
            activity?.bindService(intent, chatConnection, Context.BIND_IMPORTANT)
        }
    }

    override fun onStop() {
        super.onStop()
        activity?.unbindService(chatConnection)
    }

    private fun createUsernamesMap(): HashMap<String, String> {
        val map = HashMap<String, String>()
        for (friend in friends)
            map[friend.friendId] = friend.username
        return map
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        vm.friendsLiveData.observe(this) { list ->
            friends.clear()
            friends.addAll(list)
            binding?.rvFriends?.adapter?.notifyDataSetChanged()
            chatService?.addFriendslistUsernames(createUsernamesMap())
        }
        setFragmentListeners()
        vm.receiveInvite().subscribe{
            showInviteSnackbar(it)
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
                FriendsAdapter(friends, ::openFriendChat, ::acceptFriendRequest, ::refuseFriendRequest, ::deleteFriend, vm::inviteFriend,
                        ContextCompat.getColor(requireContext(), R.color.lightGreen), ContextCompat.getColor(requireContext(), R.color.red),
                        BitmapConversion.vectorDrawableToBitmap(requireContext(), R.drawable.ic_missing_player))
        view.visibility = View.GONE
        setupClickListeners()
    }

    private fun setupClickListeners() {
        binding?.let { mBinding ->
            mBinding.closeBtn.setOnClickListener {
                toggleVisibility()
            }
            mBinding.addFriendBtn.setOnClickListener {
                showAddFriendDialog()
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        binding = null
    }

    private fun showInviteSnackbar(info: Pair<String, String>){
        view?.let {
            Snackbar.make(it, "${info.first} vous a inviter", Snackbar.LENGTH_LONG)
                    .setAction("Rejoindre"){
                        (activity as IAcceptGameInviteListener?)?.acceptInvite(info)
                    }.show()
        }
    }

    private fun setFragmentListeners() {
        setFragmentResultListener("toggleVisibility") { requestKey, bundle ->
            toggleVisibility()
        }
        setFragmentResultListener("canInvite") { requestKey, bundle ->
            (binding?.rvFriends?.adapter as FriendsAdapter?)?.canInvite = bundle["boolean"] as Boolean
            binding?.rvFriends?.adapter?.notifyDataSetChanged()
        }
    }

    private fun openFriendChat(friendSimplified: FriendSimplified) {
        setFragmentResult("openFriendChat", bundleOf("friend" to friendSimplified))
        view?.visibility = View.GONE
    }


    private fun acceptFriendRequest(idOfFriend: String) {
        vm.playSound(SoundId.CONFIRM.value)
        lifecycleScope.launch {
            vm.acceptFriendRequest(idOfFriend)
        }
    }

    private fun refuseFriendRequest(idOfFriend: String) {
        vm.playSound(SoundId.ERROR.value)
        lifecycleScope.launch {
            vm.refuseFriendRequest(idOfFriend)
        }
    }

    private fun deleteFriend(friendId: String) {
        lifecycleScope.launchWhenCreated {
            vm.deleteFriend(friendId)
        }
    }


    fun toggleVisibility() {
        view?.let {
            view?.visibility = when (it.visibility) {
                View.VISIBLE -> {
                    vm.playSound(SoundId.CLOSE_CHAT.value)
                    View.GONE
                }
                else -> {
                    vm.playSound(SoundId.OPEN_CHAT.value)
                    View.VISIBLE
                }
            }
        }
    }

    fun showAddFriendDialog() {
        activity?.let {
            vm.playSound(SoundId.SELECTED.value)
            val input = EditText(it)
            var wasFriendAdded = false
            val dialog = AlertDialog.Builder(it).setTitle("Ajouter un ami").setView(input)
                    .setPositiveButton("Envoyer") { dialog, id ->
                        wasFriendAdded = true
                        vm.playSound(SoundId.CONFIRM.value)
                        CoroutineScope(Job() + Dispatchers.Main).launch {
                            vm.sendFriendRequest(input.text.toString())
                        }
                    }
                    .show()
            dialog.setOnDismissListener {
                if (!wasFriendAdded) {
                    vm.playSound(SoundId.CLOSE_CHAT.value)
                }
            }
        }
    }
}