package com.projet.clientleger.ui.connexion.view

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.projet.clientleger.R
import com.projet.clientleger.data.model.MessageChat

class GameLobbyInfoAdapter(private val games: List<MessageChat>): RecyclerView.Adapter<GameLobbyInfoAdapter.ViewHolder>() {
    class ViewHolder(listItemView: View) : RecyclerView.ViewHolder(listItemView) {
        val lobbyItem: LinearLayout = itemView.findViewById<LinearLayout>(R.id.lobbyGame)
        val lobbyNameTextView: TextView = itemView.findViewById<TextView>(R.id.lobbyName)
        val lobbyOwnerTextView: TextView = itemView.findViewById<TextView>(R.id.gameOwner)
        val lobbyModeTextView: TextView = itemView.findViewById<TextView>(R.id.gameMode)
        val lobbyCapacityTextView: TextView = itemView.findViewById<TextView>(R.id.gameCapacity)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): GameLobbyInfoAdapter.ViewHolder {
        val inflater = LayoutInflater.from(parent.context)
        // Inflate the custom layout
        val contactView = inflater.inflate(R.layout.item_message, parent, false)
        // Return a new holder instance
        return GameLobbyInfoAdapter.ViewHolder(contactView)
    }

    override fun onBindViewHolder(viewHolder: GameLobbyInfoAdapter.ViewHolder, position: Int) {
        //viewHolder.messageTextView.text = games[position].content
    }
    override fun getItemCount(): Int {
        return games.size
    }
}
