package com.projet.clientleger.ui.chat

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.projet.clientleger.R
import com.projet.clientleger.data.api.model.chat.RoomMessage
import com.projet.clientleger.data.enumData.GuessStatus
import com.projet.clientleger.data.enumData.MessageType
import com.projet.clientleger.data.model.chat.*
import java.text.SimpleDateFormat
import java.util.*

class MessagesAdapter(private val mMessages: List<IMessage>, private val username: String) : RecyclerView.Adapter<MessagesAdapter.ViewHolderMessage>() {

    class ViewHolderMessage(listItemView: View) : RecyclerView.ViewHolder(listItemView) {
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

            mMessages[position] is RoomMessage -> {
                val msg = mMessages[position] as RoomMessage
                type = when (msg.senderUsername) {
                    username -> MessageType.USER
                    else -> MessageType.OTHER
                }
            }

            mMessages[position] is GuessMessageInfo || mMessages[position] is GuessMessageSoloCoopInfo -> {
                val msg: IGuessMessageInfo = if(mMessages[position] is GuessMessageInfo)
                    mMessages[position] as GuessMessageInfo
                else
                    mMessages[position] as GuessMessageSoloCoopInfo

                type = if (msg.senderUsername == username) {
                    when (msg.guessStatus) {
                        GuessStatus.WRONG -> MessageType.USER_GUESS_WRONG
                        GuessStatus.CLOSE -> MessageType.USER_GUESS_CLOSE
                        GuessStatus.CORRECT -> MessageType.USER_GUESS_CORRECT
                    }
                } else {
                    when (msg.guessStatus) {
                        GuessStatus.WRONG -> MessageType.GUESS_WRONG
                        GuessStatus.CLOSE -> MessageType.GUESS_CLOSE
                        GuessStatus.CORRECT -> MessageType.GUESS_CORRECT
                    }
                }
            }
            else -> {
                type = MessageType.SYSTEM
            }
        }
        return type.ordinal
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MessagesAdapter.ViewHolderMessage {
        val inflater = LayoutInflater.from(parent.context)
        // Inflate the custom layout
        val layoutId = when (viewType) {
            MessageType.USER.ordinal -> R.layout.item_user_message
            MessageType.OTHER.ordinal -> R.layout.item_message
            MessageType.GUESS_WRONG.ordinal -> R.layout.item_guess_wrong_message
            MessageType.GUESS_CLOSE.ordinal -> R.layout.item_guess_close_message
            MessageType.GUESS_CORRECT.ordinal -> R.layout.item_guess_correct_message
            MessageType.USER_GUESS_WRONG.ordinal -> R.layout.item_guess_wrong_user_message
            MessageType.USER_GUESS_CLOSE.ordinal -> R.layout.item_guess_close_user_message
            MessageType.USER_GUESS_CORRECT.ordinal -> R.layout.item_guess_correct_user_message
            else -> R.layout.item_system_message
            // Return a new holder instance
        }
        return ViewHolderMessage(inflater.inflate(layoutId, parent, false))
    }

    override fun onBindViewHolder(viewHolder: ViewHolderMessage, position: Int) {
        val msgType = getItemViewType(position)
        if (msgType != MessageType.SYSTEM.ordinal) {
            val msg = mMessages[position] as IMessageChat
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
