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
    val vm: ChatViewModel by viewModels()
    private var binding: FragmentChatBinding? = null

    private fun setSocketSubscriptions() {
        vm.receiveMessage().subscribe{
            addMessage(it)
        }
        vm.receivePlayerConnection().subscribe{
            it.content = "${it.content} a rejoint la discussion"
            addMessage(it)
        }
        vm.receivePlayerDisconnect().subscribe{
            it.content = "${it.content} a quitté la discussion"
            addMessage(it)
        }
    }


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        vm.username = arguments?.getString("username") ?: "unknowned_user"
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
        setSocketSubscriptions()
        binding!!.sendButton.setOnClickListener { sendMessage() }
        binding!!.guessingToggleBtn.setOnClickListener { toggleSendMode() }
        binding!!.vm = vm
        return binding!!.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val rvMessages = activity?.findViewById<View>(R.id.rvMessages) as RecyclerView
        val adapter = MessagesAdapter(vm.messages)
        val mLinearLayoutManager = LinearLayoutManager(activity)
        mLinearLayoutManager.stackFromEnd = true
        rvMessages.layoutManager = LinearLayoutManager(activity)
        rvMessages.adapter = adapter
    }

    private fun sendMessage() {
        if(!vm.sendMessage())
            showErrorToast(MESSAGE_CONTENT_ERROR)

        //TODO show loading message

        chatBox.text?.clear()
    }

    private fun addMessage(message: IMessage) {
        message.content = vm.formatMessageContent(message.content)
        vm.messages.add(message)
        activity?.runOnUiThread {
            //rvMessages.adapter?.notifyItemInserted(messages.size - 1)
            rvMessages.adapter?.notifyDataSetChanged()
            rvMessages.scrollToPosition(vm.messages.size - 1)
        }
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