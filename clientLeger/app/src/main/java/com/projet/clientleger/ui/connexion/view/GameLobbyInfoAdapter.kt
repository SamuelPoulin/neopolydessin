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
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): GameLobbyInfoAdapter.ViewHolder {
        val inflater = LayoutInflater.from(parent.context)
        // Inflate the custom layout
        val contactView = inflater.inflate(R.layout.item_lobbyinfo, parent, false)
        // Return a new holder instance
        return ViewHolder(contactView)
    }

    override fun onBindViewHolder(viewHolder: GameLobbyInfoAdapter.ViewHolder, position: Int) {
        //viewHolder.messageTextView.text = games[position].content

    }
    override fun getItemCount(): Int {
        return games.size
    }
}
