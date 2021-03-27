package com.projet.clientleger.ui.friendslist

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.projet.clientleger.R
import com.projet.clientleger.data.enumData.FriendStatus
import com.projet.clientleger.data.model.FriendSimplified

class FriendsAdapter(private val friends: List<FriendSimplified>,
                     private val clickFriendCallback: (FriendSimplified) -> Unit,
                     private val acceptFriendRequestCallback: (String) -> Unit,
                     private val refuseFriendRequestCallback: (String) -> Unit) : RecyclerView.Adapter<FriendsAdapter.ViewHolderFriend>() {

    class ViewHolderFriend(listItemView: View) : RecyclerView.ViewHolder(listItemView) {
        val iconView: ImageView = itemView.findViewById(R.id.icon)
        val usernameTextView: TextView = itemView.findViewById(R.id.username)
    }

    override fun getItemViewType(position: Int): Int {
        return friends[position].status.ordinal
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolderFriend {
        val inflater = LayoutInflater.from(parent.context)

        val friendView: View = when (viewType) {
            FriendStatus.PENDING_RECEIVED.ordinal -> inflater.inflate(R.layout.item_pending_received_friend, parent, false)
            FriendStatus.PENDING_SENT.ordinal -> inflater.inflate(R.layout.item_pending_sent_friend, parent, false)
            else -> inflater.inflate(R.layout.item_friend, parent, false)
        }

        return ViewHolderFriend(friendView)
    }

    override fun onBindViewHolder(holder: FriendsAdapter.ViewHolderFriend, position: Int) {
        holder.usernameTextView.text = friends[position].username
        when (getItemViewType(position)) {
            FriendStatus.ACCEPTED.ordinal -> holder.itemView.setOnClickListener { clickFriendCallback(friends[position]) }
            FriendStatus.PENDING_RECEIVED.ordinal -> {
                holder.itemView.findViewById<ImageButton>(R.id.acceptBtn).setOnClickListener { acceptFriendRequestCallback(friends[position].friendId) }
                holder.itemView.findViewById<ImageButton>(R.id.refuseBtn).setOnClickListener { refuseFriendRequestCallback(friends[position].friendId) }
            }
        }
    }

    override fun getItemCount(): Int {
        return friends.size
    }
}