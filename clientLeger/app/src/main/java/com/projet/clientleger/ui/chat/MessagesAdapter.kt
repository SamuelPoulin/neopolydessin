package com.projet.clientleger.ui.chat

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.projet.clientleger.R
import com.projet.clientleger.data.enum.MessageType
import com.projet.clientleger.data.model.IMessage
import com.projet.clientleger.data.model.Message
import com.projet.clientleger.data.model.MessageChat
import java.text.SimpleDateFormat
import java.util.*
class MessagesAdapter(private val mMessages: List<IMessage>) : RecyclerView.Adapter<MessagesAdapter.ViewHolderMessage>() {

    private lateinit var username: String

    class ViewHolderMessage(listItemView: View): RecyclerView.ViewHolder(listItemView){
        val messageTextView: TextView = itemView.findViewById(R.id.message_content)
        val messageUsernameTextView: TextView = itemView.findViewById(R.id.message_username)
        val messageTimeTextView: TextView = itemView.findViewById(R.id.message_time)
    }

    override fun getItemViewType(position: Int): Int {
        return when {
            mMessages[position] is Message -> MessageType.SYSTEM.ordinal
            (mMessages[position] as MessageChat).user == username -> MessageType.USER.ordinal
            else -> MessageType.OTHER.ordinal
        }
    }

    fun setUsername(username: String) {
        this.username = username
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolderMessage {
        val inflater = LayoutInflater.from(parent.context)
        // Inflate the custom layout
        val messageView: View = when(viewType) {
            MessageType.USER.ordinal -> inflater.inflate(R.layout.item_user_message, parent, false)
            MessageType.OTHER.ordinal -> inflater.inflate(R.layout.item_message, parent, false)
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
        if(getItemViewType(position) != MessageType.SYSTEM.ordinal){
            val time = SimpleDateFormat("HH:mm:ss", Locale.CANADA_FRENCH).format(Date(mMessages[position].timestamp))
            viewHolder.messageUsernameTextView.text = (mMessages[position] as MessageChat ).user //SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.CANADA_FRENCH).format(Date(mMessages[position].timestamp))
            viewHolder.messageTimeTextView.text = time
        }
        viewHolder.messageTextView.text = mMessages[position].content

    }

    override fun getItemCount(): Int {
        return mMessages.size
    }
}