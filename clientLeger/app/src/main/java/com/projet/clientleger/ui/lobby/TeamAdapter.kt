package com.projet.clientleger.ui.lobby

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.projet.clientleger.R
import com.projet.clientleger.data.api.model.lobby.Player

class TeamAdapter(private val players: List<Player>) : RecyclerView.Adapter<TeamAdapter.ViewHolderPlayer>(){

    class ViewHolderPlayer(view: View) : RecyclerView.ViewHolder(view){
        val avatarView: ImageView = itemView.findViewById(R.id.avatar)
        val usernameTextView: TextView = itemView.findViewById(R.id.username)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolderPlayer {
        val inflater = LayoutInflater.from(parent.context)

        return ViewHolderPlayer(inflater.inflate(R.layout.item_playerinfo, parent, false))
    }

    override fun onBindViewHolder(holder: ViewHolderPlayer, position: Int) {
        holder.usernameTextView.text = players[position].playerName
        //holder.avatarView.setImageBitmap(players[position].avatar)
        TODO("Not yet implemented")
    }

    override fun getItemCount(): Int {
        TODO("Not yet implemented")
    }
}