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
import kotlinx.android.synthetic.main.fragment_chat.*
import java.util.regex.Pattern
private const val USERNAME_FORMAT_ERROR: String = "Doit contenir seulement 10 lettres ou chiffres."
private const val USERNAME_UNICITY_ERROR: String = "Pseudonyme déjà utilisé, choisir un autre !"
private const val MESSAGE_CONTENT_ERROR: String = "Le message ne doit pas être vide et ne doit pas dépasser 200 caractères"
private const val CHOOSING_USERNAME_TITLE: String = "Choisir son pseudonyme"
private const val CONNECT_BUTTON_TITLE:String = "Connect"
private const val USERNAME_INPUT_HINT:String = "Nom d'utilisateur"
class ChatFragment() : Fragment() {
    private lateinit var connexionDialog: AlertDialog
    private var messages: ArrayList<IMessage> = ArrayList()
    private lateinit var username: String

    var socketService: SocketService? = null
    var isBound = false

    private val serviceConnection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            val binder = service as SocketService.LocalBinder
            socketService = binder.getService()
            isBound = true
            setSubscriptions()
        }

        override fun onServiceDisconnected(name: ComponentName?) {
            isBound = false
        }
    }

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

        val connexionDialogBuilder = activity?.let { AlertDialog.Builder(it) }
        val input = EditText(activity)
        input.hint = USERNAME_INPUT_HINT
        connexionDialogBuilder
            ?.setTitle(CHOOSING_USERNAME_TITLE)
            ?.setView(input)
            ?.setPositiveButton(CONNECT_BUTTON_TITLE, null)

        if (connexionDialogBuilder != null) {
            connexionDialog = connexionDialogBuilder.create()
            connexionDialog.setCanceledOnTouchOutside(false)
            connexionDialog.setCancelable(false)
            connexionDialog.show()
            connexionDialog.getButton(AlertDialog.BUTTON_POSITIVE)
                .setOnClickListener {
                    username = input.text.toString()
                    chooseUsername(username);
                    input.text.clear()
                }
        }
    }

    private fun chooseUsername(username: String) {
        if(!isUsernameValidFormat(username)) {
            showErrorToast(USERNAME_FORMAT_ERROR)
            return
        }
        socketService?.usernameConnexion(username)
            ?.doOnError { error -> println(error) }
            ?.subscribe { valid ->
                if (valid) {
                    connexionDialog.dismiss();
                    (rvMessages.adapter as MessagesAdapter).setUsername(username)
                } else {
                    showErrorToast(USERNAME_UNICITY_ERROR)
                }
            }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val intent = Intent(activity, SocketService::class.java)
        activity?.bindService(intent, serviceConnection, Context.BIND_IMPORTANT)
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
        val adjustedText: String = text.replace("\\s+".toRegex(), " ")
        if(isMessageValidFormat(adjustedText))
        {
            addMessage(MessageChat(username, adjustedText, System.currentTimeMillis()))
            socketService?.sendMessage(MessageChat(username, adjustedText, System.currentTimeMillis()))
        }
        else{
            showErrorToast(MESSAGE_CONTENT_ERROR)
        }
        chatBox.text?.clear()
    }

    private fun addMessage(message: IMessage) {
            messages.add(message)
            activity?.runOnUiThread {
                //rvMessages.adapter?.notifyItemInserted(messages.size - 1)
                rvMessages.adapter?.notifyDataSetChanged()
                rvMessages.scrollToPosition(messages.size - 1)
            }
    }

    private fun isUsernameValidFormat(username: String): Boolean{
        return Pattern.matches("^[A-Za-z0-9. ]+(?:[_&%$*#@!-][A-Za-z0-9. ]+)*$", username)
    }
    private fun isMessageValidFormat(message: String): Boolean{
        return Pattern.matches(".*\\S.*", message) && message.length <= 200 && message.isNotEmpty()
    }

    private fun showErrorToast(errorMessage: String){
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

    override fun onStop() {
        super.onStop()
        if (isBound) {
            activity?.unbindService(serviceConnection)
            isBound = false
        }
    }

    override fun onDestroy() {
        if(this::connexionDialog.isInitialized)
            connexionDialog.dismiss()
        super.onDestroy()
    }
}