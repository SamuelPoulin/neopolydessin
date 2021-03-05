package com.projet.clientleger.ui.friendslist

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.projet.clientleger.R
import com.projet.clientleger.data.model.Friend

class FriendsAdapter(private val friends: List<Friend>): RecyclerView.Adapter<FriendsAdapter.ViewHolderFriend>() {

    class ViewHolderFriend(listItemView: View): RecyclerView.ViewHolder(listItemView){
        val iconView:ImageView = itemView.findViewById(R.id.icon)
        val usernameTextView:TextView = itemView.findViewById(R.id.username)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolderFriend {
        val inflater = LayoutInflater.from(parent.context)

        val friendView: View = inflater.inflate(R.layout.item_friend, parent, false)
        return ViewHolderFriend(friendView)
    }

    override fun onBindViewHolder(holder: ViewHolderFriend, position: Int) {
        holder.usernameTextView.text = friends[position].username
    }

    override fun getItemCount(): Int {
        return friends.size
    }
}