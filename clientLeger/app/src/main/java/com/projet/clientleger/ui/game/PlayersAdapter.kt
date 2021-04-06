package com.projet.clientleger.ui.game

import android.media.Image
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextClock
import android.widget.TextView
import androidx.core.graphics.drawable.toBitmap
import androidx.recyclerview.widget.RecyclerView
import com.projet.clientleger.R
import com.projet.clientleger.data.enumData.PlayerRole
import com.projet.clientleger.data.model.lobby.PlayerInfo
import kotlinx.android.synthetic.main.item_game_player.view.*

class PlayersAdapter(private val players: List<PlayerInfo>) : RecyclerView.Adapter<PlayersAdapter.ViewHolderPlayer>() {

    class ViewHolderPlayer(view: View) : RecyclerView.ViewHolder(view){
        val avatarView: ImageView = itemView.findViewById(R.id.avatar)
        val usernameTextView: TextView = itemView.findViewById(R.id.username)
        val actionIcon: ImageView = itemView.findViewById(R.id.actionIcon)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolderPlayer {
        val inflater = LayoutInflater.from(parent.context)
        return ViewHolderPlayer(inflater.inflate(R.layout.item_game_player, parent, false))
    }

    override fun onBindViewHolder(holder: ViewHolderPlayer, position: Int) {
        if(players[position].avatar == null){
            holder.avatarView.setImageResource(R.drawable.ic_missing_player)
        }
        else{
            holder.avatarView.setImageBitmap(players[position].avatar)
        }
        holder.usernameTextView.text = players[position].username
        val icon = when(players[position].playerRole){
            PlayerRole.DRAWER -> R.drawable.ic_drawer
            PlayerRole.GUESSER -> R.drawable.ic_guessing
            else -> 0
        }
        if(icon != 0){
            holder.actionIcon.setImageResource(icon)
            holder.actionIcon.visibility = View.VISIBLE
        }
        else
            holder.actionIcon.visibility = View.INVISIBLE
    }

    override fun getItemCount(): Int {
        return players.size
    }
}