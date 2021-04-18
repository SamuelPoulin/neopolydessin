package com.projet.clientleger.ui.friendslist

import android.content.res.ColorStateList
import android.graphics.Bitmap
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.projet.clientleger.R
import com.projet.clientleger.data.enumData.FriendStatus
import com.projet.clientleger.data.model.friendslist.FriendSimplified

class FriendsAdapter(private val friends: List<FriendSimplified>,
                     private val clickFriendCallback: (FriendSimplified) -> Unit,
                     private val acceptFriendRequestCallback: (String) -> Unit,
                     private val refuseFriendRequestCallback: (String) -> Unit,
                     private val deleteFriendCallback: (String) -> Unit,
                     private val inviteCallback: (String) -> Unit,
                     private val connectedColor: Int,
                     private val disconnectedColor: Int,
                     private val defaultAvatar: Bitmap) : RecyclerView.Adapter<FriendsAdapter.ViewHolderFriend>() {

    var canInvite: Boolean = false

    class ViewHolderFriend(listItemView: View) : RecyclerView.ViewHolder(listItemView) {
        val iconView: ImageView? = itemView.findViewById(R.id.icon)
        val usernameTextView: TextView = itemView.findViewById(R.id.username)
        val dmBtn: ImageButton? = itemView.findViewById(R.id.dmBtn)
        val statusView: ImageView? = itemView.findViewById(R.id.friendStatus)
    }

    override fun getItemViewType(position: Int): Int {
        return friends[position].status.ordinal
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolderFriend {
        val inflater = LayoutInflater.from(parent.context)

        val friendView: View = when (viewType) {
            FriendStatus.HEADER.ordinal -> inflater.inflate(R.layout.item_friend_header, parent, false)
            FriendStatus.PENDING_RECEIVED.ordinal -> inflater.inflate(R.layout.item_pending_received_friend, parent, false)
            FriendStatus.PENDING_SENT.ordinal -> inflater.inflate(R.layout.item_pending_sent_friend, parent, false)
            else -> inflater.inflate(R.layout.item_friend, parent, false)
        }

        return ViewHolderFriend(friendView)
    }

    override fun onBindViewHolder(holder: FriendsAdapter.ViewHolderFriend, position: Int) {
        val friend = friends[position]
        if(friend.username.length > 12)
            holder.usernameTextView.text = friend.username.subSequence(0, 12).toString() + "..."
        else
            holder.usernameTextView.text = friend.username

        if (friend.avatar != null)
            holder.iconView?.setImageBitmap(friend.avatar)
        else
            holder.iconView?.setImageBitmap(defaultAvatar)
        when (getItemViewType(position)) {
            FriendStatus.ACCEPTED.ordinal -> {

                if (friend.isOnline) {
                    holder.statusView!!.visibility= View.VISIBLE
                    holder.dmBtn?.visibility = View.VISIBLE
                }
                else {
                    holder.statusView!!.visibility = View.INVISIBLE
                    holder.dmBtn?.visibility = View.INVISIBLE
                }

                val inviteBtn = holder.itemView.findViewById<ImageButton>(R.id.inviteBtn)
                if (canInvite && friend.isOnline) {
                    inviteBtn.visibility = View.VISIBLE
                    inviteBtn.setOnClickListener { inviteCallback(friend.friendId) }
                } else
                    inviteBtn.visibility = View.INVISIBLE

                holder.dmBtn!!.setOnClickListener { clickFriendCallback(friend) }
                holder.itemView.findViewById<ImageButton>(R.id.deleteBtn).setOnClickListener { deleteFriendCallback(friend.friendId) }
            }
            FriendStatus.PENDING_RECEIVED.ordinal -> {
                holder.itemView.findViewById<ImageButton>(R.id.acceptBtn).setOnClickListener { acceptFriendRequestCallback(friend.friendId) }
                holder.itemView.findViewById<ImageButton>(R.id.refuseBtn).setOnClickListener { refuseFriendRequestCallback(friend.friendId) }
                if (friend.avatar != null)
                    holder.iconView?.setImageBitmap(friend.avatar)
                else
                    holder.iconView?.setImageBitmap(defaultAvatar)
            }
            FriendStatus.HEADER.ordinal ->{
                val msg = holder.itemView.findViewById<TextView>(R.id.emptyListMsg)
                if(friend.username == "Amis"){
                    if(friends.find { it.status == FriendStatus.ACCEPTED } == null) {
                        msg.visibility = View.VISIBLE
                        msg.text = "Vous n'avez pas encore ajouté d'amis"
                    } else
                        msg.visibility = View.GONE
                } else if(friend.username == "Requêtes") {
                    if(friends.find { it.status == FriendStatus.PENDING_SENT || it.status == FriendStatus.PENDING_RECEIVED } == null){
                        msg.visibility = View.VISIBLE
                        msg.text = "Vous n'avez pas de requête d'amitié"
                    } else
                        msg.visibility = View.GONE
                } else {
                    msg.visibility = View.GONE
                }
            }
        }
    }

    override fun getItemCount(): Int {
        return friends.size
    }
}