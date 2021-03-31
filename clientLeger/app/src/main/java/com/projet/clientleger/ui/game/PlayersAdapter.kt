package com.projet.clientleger.ui.game

import android.media.Image
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextClock
import androidx.recyclerview.widget.RecyclerView
import com.projet.clientleger.R
import com.projet.clientleger.data.enumData.PlayerRole
import com.projet.clientleger.data.model.lobby.PlayerInfo
import kotlinx.android.synthetic.main.item_game_player.view.*

class PlayersAdapter(private val players: List<PlayerInfo>) : RecyclerView.Adapter<PlayersAdapter.ViewHolderPlayer>() {

    class ViewHolderPlayer(view: View) : RecyclerView.ViewHolder(view){
        val avatarView: ImageView = itemView.findViewById(R.id.avatar)
        val usernameTextView: TextClock = itemView.findViewById(R.id.username)
        val actionIcon: ImageView = itemView.findViewById(R.id.actionIcon)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolderPlayer {
        val inflater = LayoutInflater.from(parent.context)
        return ViewHolderPlayer(inflater.inflate(R.layout.item_game_player, parent, false))
    }

    override fun onBindViewHolder(holder: ViewHolderPlayer, position: Int) {
        holder.avatarView.setImageBitmap(players[position].avatar)
        holder.usernameTextView.text = players[position].username
        val icon = when(players[position].playerRole){
            PlayerRole.DRAWER -> R.drawable.ic_drawer
            PlayerRole.GUESSER -> R.drawable.ic_guessing
            PlayerRole.PASSIVE -> 0
        }
        if(icon != 0)
            holder.actionIcon.setImageResource(icon)
        else
            holder.actionIcon.visibility = View.GONE
    }

    override fun getItemCount(): Int {
        return players.size
    }
}