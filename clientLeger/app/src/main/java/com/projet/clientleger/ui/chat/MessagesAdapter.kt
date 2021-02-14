package com.projet.clientleger.ui.chat

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.projet.clientleger.R
import com.projet.clientleger.data.model.MessageChat

class MessagesAdapter(private val mMessages: List<MessageChat>): RecyclerView.Adapter<MessagesAdapter.ViewHolder>() {

    class ViewHolder(listItemView: View): RecyclerView.ViewHolder(listItemView){
        val messageTextView: TextView = itemView.findViewById<TextView>(R.id.message_content)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val inflater = LayoutInflater.from(parent.context)
        // Inflate the custom layout
        val contactView = inflater.inflate(R.layout.item_message, parent, false)
        // Return a new holder instance
        return ViewHolder(contactView)
    }
    override fun onBindViewHolder(viewHolder: MessagesAdapter.ViewHolder, position: Int) {
        // Get the data model based on position
        //val message: MessageChat = mMessages[position]
        // Set item views based on your views and data model
        //val textView = viewHolder.messageTextView
        //textView.text = message.content
        //val button = viewHolder.messageButton
        //button.text = if (contact.isOnline) "Message" else "Offline"
        //button.isEnabled = contact.isOnline
        viewHolder.messageTextView.text = mMessages[position].content
    }

    override fun getItemCount(): Int {
        return mMessages.size
    }
}