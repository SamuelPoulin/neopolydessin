package com.projet.clientleger.ui.connexion.view

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.projet.clientleger.R
import com.projet.clientleger.data.model.GameInfo
import com.projet.clientleger.data.model.MessageChat

class GameLobbyInfoAdapter(private val games: List<GameInfo>): RecyclerView.Adapter<GameLobbyInfoAdapter.ViewHolder>() {
    class ViewHolder(listItemView: View) : RecyclerView.ViewHolder(listItemView) {
        val lobbyNameTextView: TextView = itemView.findViewById<TextView>(R.id.lobbyName)
        val gameOwnerTextView: TextView = itemView.findViewById<TextView>(R.id.gameOwner)
        val gameModeTextView: TextView = itemView.findViewById<TextView>(R.id.gameMode)
        val gameCapacityTextView: TextView = itemView.findViewById<TextView>(R.id.gameCapacity)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): GameLobbyInfoAdapter.ViewHolder {
        val inflater = LayoutInflater.from(parent.context)
        // Inflate the custom layout
        val contactView = inflater.inflate(R.layout.item_lobbyinfo, parent, false)
        // Return a new holder instance
        return ViewHolder(contactView)
    }

    override fun onBindViewHolder(viewHolder: GameLobbyInfoAdapter.ViewHolder, position: Int) {
        viewHolder.lobbyNameTextView.text = games[position].lobbyName
        viewHolder.gameOwnerTextView.text = games[position].lobbyOwner
        viewHolder.gameModeTextView.text = games[position].gameMode
        viewHolder.gameCapacityTextView.text = games[position].gameCapacity

    }
    override fun getItemCount(): Int {
        return games.size
    }
}
