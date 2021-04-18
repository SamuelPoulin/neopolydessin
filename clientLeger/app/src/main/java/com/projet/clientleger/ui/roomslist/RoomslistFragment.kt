package com.projet.clientleger.ui.roomslist

import android.app.AlertDialog
import android.content.*
import android.os.Bundle
import android.os.IBinder
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import androidx.core.os.bundleOf
import androidx.fragment.app.setFragmentResult
import androidx.fragment.app.setFragmentResultListener
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.projet.clientleger.data.service.ChatStorageService
import com.projet.clientleger.databinding.RoomlistFragmentBinding
import com.projet.clientleger.ui.chat.TabAdapter
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class RoomslistFragment @Inject constructor() : Fragment() {

    private val rooms: ArrayList<String> = ArrayList()
    val vm: RoomslistViewModel by viewModels()
    private var binding: RoomlistFragmentBinding? = null
    private var chatService: ChatStorageService? = null

    private val chatConnection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            chatService = (service as ChatStorageService.LocalBinder).getService()
        }

        override fun onServiceDisconnected(name: ComponentName?) {
            chatService = null
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
        chatService = null
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        vm.rooms.observe(this) { list ->
            chatService?.updateRooms(list)
            rooms.clear()
            rooms.addAll(list)
            binding?.rvRooms?.adapter?.notifyDataSetChanged()
        }
        setupFragmentListeners()
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        binding = RoomlistFragmentBinding.inflate(inflater, container, false)
        return binding!!.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        binding?.let { mBinding ->
            mBinding.rvRooms.layoutManager = LinearLayoutManager(activity)
            mBinding.rvRooms.adapter = RoomsAdatper(rooms, ::joinRoom, vm::deleteRoom)
        }
        view.visibility = View.GONE
        setupClickListeners()
    }

    private fun setupClickListeners() {
        binding?.let { mBinding ->
            mBinding.closeBtn.setOnClickListener {
                toggleVisibility()
            }
            mBinding.createRoomBtn.setOnClickListener {
                showAddRoomDialog()
            }
        }
    }

    private fun setupFragmentListeners() {
        setFragmentResultListener("toggleVisibilityRooms") { requestKey, bundle ->
            toggleVisibility()
        }
    }

    private fun showAddRoomDialog() {
        activity?.let {
            val roomName = EditText(it)
            val dialog = AlertDialog.Builder(it).setTitle("Créer un salon").setView(roomName)
                    .setPositiveButton("Créer"){ dialogInterface, i ->
                        vm.createRoom(roomName.text.toString())
                    }
                    .show()
        }
    }


    private fun toggleVisibility() {
        view?.let {
            it.visibility = when (it.visibility) {
                View.VISIBLE -> View.GONE
                else -> View.VISIBLE
            }
        }
    }

    private fun joinRoom(roomName: String) {
        vm.joinRoom(roomName).subscribe { isSuccess ->
            if (isSuccess) {
                setFragmentResult("openRoom", bundleOf("roomName" to roomName))
                activity?.runOnUiThread {
                    view?.let {
                        it.visibility = View.GONE
                    }
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        binding = null
    }
}