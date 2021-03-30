package com.projet.clientleger.ui.lobby

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.projet.clientleger.R
import com.projet.clientleger.data.api.model.lobby.Player
import com.projet.clientleger.data.model.lobby.PlayerInfo
import kotlin.random.Random

class TeamAdapter(private val players: List<PlayerInfo>,
                  private val removePlayerCallback: (PlayerInfo) -> Unit) : RecyclerView.Adapter<TeamAdapter.ViewHolderPlayer>(){

    class ViewHolderPlayer(view: View) : RecyclerView.ViewHolder(view){
        val avatarView: ImageView = itemView.findViewById(R.id.avatar)
        val usernameTextView: TextView = itemView.findViewById(R.id.username)
        val removePlayerBtn: Button = itemView.findViewById(R.id.removePlayerBtn)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolderPlayer {
        val inflater = LayoutInflater.from(parent.context)
        return ViewHolderPlayer(inflater.inflate(R.layout.item_playerinfo, parent, false))
    }

    override fun onBindViewHolder(holder: ViewHolderPlayer, position: Int) {
        holder.usernameTextView.text = players[position].username
        holder.avatarView.setImageBitmap(players[position].avatar)
        holder.removePlayerBtn.setOnClickListener { removePlayerCallback.invoke(players[position]) }
        println("${Random.nextInt()}username :" + players[position].username)
        if(players[position].username.isEmpty())
            holder.removePlayerBtn.visibility = View.INVISIBLE
        else
            holder.removePlayerBtn.visibility = View.VISIBLE
    }

    override fun getItemCount(): Int {
        return players.size
    }
}