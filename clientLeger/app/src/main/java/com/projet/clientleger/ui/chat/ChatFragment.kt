package com.projet.clientleger.ui.chat

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.os.Bundle
import android.os.IBinder
import android.text.Html
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.projet.clientleger.R
import com.projet.clientleger.data.api.service.SocketService
import com.projet.clientleger.data.model.IMessage
import com.projet.clientleger.data.model.MessageChat
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.android.synthetic.main.fragment_chat.*
import java.util.regex.Pattern
import javax.inject.Inject

private const val USERNAME_FORMAT_ERROR: String = "Doit contenir seulement 10 lettres ou chiffres."
private const val USERNAME_UNICITY_ERROR: String = "Pseudonyme déjà utilisé, choisir un autre !"
private const val MESSAGE_CONTENT_ERROR: String =
    "Le message ne doit pas être vide et ne doit pas dépasser 200 caractères"
private const val CHOOSING_USERNAME_TITLE: String = "Choisir son pseudonyme"
private const val CONNECT_BUTTON_TITLE: String = "Connect"
private const val USERNAME_INPUT_HINT: String = "Nom d'utilisateur"

@AndroidEntryPoint
class ChatFragment @Inject constructor() : Fragment() {
    private var messages: ArrayList<IMessage> = ArrayList()
    private lateinit var username: String

    @Inject
    lateinit var socketService: SocketService

    fun setSubscriptions() {
        socketService?.receiveMessage()
            ?.subscribe { message ->
                addMessage(message)
            }
        socketService?.receivePlayerConnection()?.subscribe { message ->
            message.content = "${message.content} a rejoint la discussion"
            addMessage(message)
        }
        socketService?.receivePlayerDisconnection()?.subscribe { message ->
            message.content = "${message.content} a quitté la discussion"
            addMessage(message)
        }

    }


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        username = arguments?.getString("username") ?: "unknowned_user"
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_chat, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        sendButton.setOnClickListener {
            sendButton()
        }
        val rvMessages = activity?.findViewById<View>(R.id.rvMessages) as RecyclerView
        val adapter = MessagesAdapter(messages)
        val mLinearLayoutManager = LinearLayoutManager(activity)
        mLinearLayoutManager.stackFromEnd = true
        rvMessages.layoutManager = LinearLayoutManager(activity)
        rvMessages.adapter = adapter
    }

    private fun sendButton() {
        val text: String = (chatBox.text).toString()
        val adjustedText: String = formatMessageContent(text)
        if (isMessageValidFormat(adjustedText)) {
            addMessage(MessageChat(username, adjustedText, System.currentTimeMillis()))
            socketService?.sendMessage(
                MessageChat(
                    username,
                    adjustedText,
                    System.currentTimeMillis()
                )
            )
        } else {
            showErrorToast(MESSAGE_CONTENT_ERROR)
        }
        chatBox.text?.clear()
    }

    private fun addMessage(message: IMessage) {
        message.content = formatMessageContent(message.content)
        messages.add(message)
        activity?.runOnUiThread {
            //rvMessages.adapter?.notifyItemInserted(messages.size - 1)
            rvMessages.adapter?.notifyDataSetChanged()
            rvMessages.scrollToPosition(messages.size - 1)
        }
    }

    private fun isUsernameValidFormat(username: String): Boolean {
        return Pattern.matches("^[A-Za-z0-9. ]+(?:[_&%$*#@!-][A-Za-z0-9. ]+)*$", username)
    }

    private fun isMessageValidFormat(message: String): Boolean {
        return Pattern.matches(".*\\S.*", message) && message.length <= 200 && message.isNotEmpty()
    }

    private fun formatMessageContent(messageContent: String): String {
        var adjustedText: String = messageContent.replace("\\s+".toRegex(), " ")
        adjustedText = adjustedText.trimStart()
        return adjustedText
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
}