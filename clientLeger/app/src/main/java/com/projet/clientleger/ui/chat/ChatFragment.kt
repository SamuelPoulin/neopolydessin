package com.projet.clientleger.ui.chat

import android.os.Bundle
import android.text.Html
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.setFragmentResultListener
import androidx.fragment.app.viewModels
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.projet.clientleger.R
import com.projet.clientleger.data.model.FriendSimplified
import com.projet.clientleger.data.model.chat.IMessage
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.android.synthetic.main.fragment_chat.*
import java.util.regex.Pattern
import javax.inject.Inject
import com.projet.clientleger.databinding.FragmentChatBinding

private const val MESSAGE_CONTENT_ERROR: String =
    "Le message ne doit pas être vide et ne doit pas dépasser 200 caractères"

@AndroidEntryPoint
class ChatFragment @Inject constructor() : Fragment() {

    /*private var messages: ArrayList<IMessage> = ArrayList()
    private lateinit var username: String

    @Inject
    lateinit var socketService: SocketService

    fun setSubscriptions() {
        socketService.receiveMessage()
            .subscribe { message ->
                addMessage(message)
            }
        socketService.receivePlayerConnection().subscribe { message ->
            message.content = "${message.content} a rejoint la discussion"
            addMessage(message)
        }
        socketService.receivePlayerDisconnection().subscribe { message ->
            message.content = "${message.content} a quitté la discussion"
            addMessage(message)
        }
    }*/
    val vm: ChatViewModel by viewModels()
    private var binding: FragmentChatBinding? = null

    companion object {
        fun newInstance() = ChatFragment()
    }


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setFragmentResultListener("isGuessing"){ requestKey, bundle ->
            isGuessing(bundle["boolean"] as Boolean)
        }
        setFragmentResultListener("openFriendChat"){ requestKey, bundle ->
            (bundle["friend"] as FriendSimplified).username
            // TODO chat openned from friendslists
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        binding = null
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        binding = FragmentChatBinding.inflate(inflater, container, false)
        binding!!.sendButton.setOnClickListener { sendMessage() }
        binding!!.guessingToggleBtn.setOnClickListener { toggleSendMode() }
        vm.messagesLiveData.observe(requireActivity()){
            rvMessages.adapter?.notifyDataSetChanged()
            rvMessages.scrollToPosition(it.size - 1)
        }
        binding!!.vm = vm
        return binding!!.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val rvMessages = activity?.findViewById<View>(R.id.rvMessages) as RecyclerView
        val adapter = MessagesAdapter(vm.messagesLiveData.value!!, vm.username)
        val mLinearLayoutManager = LinearLayoutManager(activity)
        mLinearLayoutManager.stackFromEnd = true
        rvMessages.layoutManager = LinearLayoutManager(activity)
        rvMessages.adapter = adapter
    }

    /*private fun sendButton() {
        val text: String = (chatBox.text).toString()
        val adjustedText: String = formatMessageContent(text)
        if (isMessageValidFormat(adjustedText)) {
            addMessage(MessageChat(adjustedText, System.currentTimeMillis(),username))
            socketService.sendMessage(
                    adjustedText,
                    System.currentTimeMillis()
            )
        } else {
            showErrorToast(MESSAGE_CONTENT_ERROR)
        }
        chatBox.text?.clear()
    }*/
    private fun sendMessage() {
        vm.sendMessage()

        //TODO show loading message

        chatBox.text?.clear()
    }
    private fun isMessageValidFormat(message: String): Boolean {
        return Pattern.matches(".*\\S.*", message) && message.length <= 200 && message.isNotEmpty()
    }

    private fun toggleSendMode(){
        vm.toggleSendMode()
        if(vm.sendingModeIsGuessing) {
            binding!!.chatSendBox.background = ContextCompat.getDrawable(requireContext(), R.drawable.chat_guessing_input_background)
            binding!!.guessingToggleBtn.background = ContextCompat.getDrawable(requireContext(), R.drawable.ic_lightbulb_white)
            binding!!.sendButton.background = ContextCompat.getDrawable(requireContext(), R.drawable.ic_sent)
        } else{
            binding!!.chatSendBox.background = ContextCompat.getDrawable(requireContext(), R.drawable.chat_input_background)
            binding!!.guessingToggleBtn.background = ContextCompat.getDrawable(requireContext(), R.drawable.ic_lightbulb)
            binding!!.sendButton.background = ContextCompat.getDrawable(requireContext(), R.drawable.ic_baseline_send_24)
        }
    }

    private fun showErrorToast(errorMessage: String) {
        activity?.runOnUiThread {
            Toast.makeText(
                activity,
                Html.fromHtml(
                    "<font color='#e61515'><b>${errorMessage}</b></font>",
                    0
                ),
                Toast.LENGTH_SHORT
            ).show()
        }
    }

    fun isGuessing(isGuessing: Boolean){
        if(isGuessing){
            binding!!.guessingToggleBtn.visibility = View.VISIBLE
        }
        else{
            binding!!.guessingToggleBtn.visibility = View.GONE
        }

    }
}