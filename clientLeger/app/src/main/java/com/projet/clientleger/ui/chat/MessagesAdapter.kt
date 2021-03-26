package com.projet.clientleger.ui.chat

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.projet.clientleger.R
import com.projet.clientleger.data.enumData.GuessStatus
import com.projet.clientleger.data.enumData.MessageType
import com.projet.clientleger.data.model.chat.IMessage
import com.projet.clientleger.data.model.chat.Message
import com.projet.clientleger.data.model.chat.MessageChat
import com.projet.clientleger.data.model.chat.MessageGuess
import java.text.SimpleDateFormat
import java.util.*
class MessagesAdapter(private val mMessages: List<IMessage>, private val username: String) : RecyclerView.Adapter<MessagesAdapter.ViewHolderMessage>() {

    class ViewHolderMessage(listItemView: View): RecyclerView.ViewHolder(listItemView){
        val messageTextView: TextView = itemView.findViewById(R.id.message_content)
        val messageUsernameTextView: TextView = itemView.findViewById(R.id.message_username)
        val messageTimeTextView: TextView = itemView.findViewById(R.id.message_time)
    }

    override fun getItemViewType(position: Int): Int {
        val type: MessageType
        when {
            mMessages[position] is MessageChat -> {
                val msg = mMessages[position] as MessageChat
                type = when (msg.senderUsername) {
                    username -> MessageType.USER
                    else -> MessageType.OTHER
                }
            }
            mMessages[position] is MessageGuess -> {
                val msg = mMessages[position] as MessageGuess
                type = when(GuessStatus.sToEnum(msg.guessStatus)){
                    GuessStatus.WRONG -> MessageType.GUESS_WRONG
                    GuessStatus.CLOSE -> MessageType.GUESS_CLOSE
                    GuessStatus.CORRECT -> MessageType.GUESS_CORRECT
                }
            }
            else -> {
                type = MessageType.SYSTEM
            }
        }
        return type.ordinal
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolderMessage {
        val inflater = LayoutInflater.from(parent.context)
        // Inflate the custom layout
        val messageView: View = when(viewType) {
            MessageType.USER.ordinal -> inflater.inflate(R.layout.item_user_message, parent, false)
            MessageType.OTHER.ordinal -> inflater.inflate(R.layout.item_message, parent, false)
            MessageType.GUESS_WRONG.ordinal -> inflater.inflate(R.layout.item_guess_message, parent, false)
            MessageType.GUESS_CLOSE.ordinal -> inflater.inflate(R.layout.item_guess_close_message, parent, false)
            MessageType.GUESS_CORRECT.ordinal -> inflater.inflate(R.layout.item_guess_correct_message, parent, false)
            else -> inflater.inflate(R.layout.item_system_message, parent, false)
            // Return a new holder instance
        }


        return ViewHolderMessage(messageView)
    }

    override fun onBindViewHolder(viewHolder: ViewHolderMessage, position: Int) {
        // Get the data model based on position
        //val message: MessageChat = mMessages[position]
        // Set item views based on your views and data model
        //val textView = viewHolder.messageTextView
        //textView.text = message.content
        //val button = viewHolder.messageButton
        //button.text = if (contact.isOnline) "Message" else "Offline"
        //button.isEnabled = contact.isOnline
        if(getItemViewType(position) == MessageType.OTHER.ordinal){
            val msg = mMessages[position] as MessageChat
            val time = SimpleDateFormat("HH:mm:ss", Locale.CANADA_FRENCH).format(Date(msg.timestamp))
            viewHolder.messageUsernameTextView.text = msg.senderUsername //SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.CANADA_FRENCH).format(Date(mMessages[position].timestamp))
            viewHolder.messageTimeTextView.text = time
        }
        viewHolder.messageTextView.text = mMessages[position].content
    }

    override fun getItemCount(): Int {
        return mMessages.size
    }
}
