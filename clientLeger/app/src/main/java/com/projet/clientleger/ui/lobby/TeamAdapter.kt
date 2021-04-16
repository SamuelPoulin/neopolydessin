package com.projet.clientleger.ui.lobby

import android.graphics.drawable.Drawable
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.projet.clientleger.R
import com.projet.clientleger.data.model.account.AccountInfo
import com.projet.clientleger.data.model.lobby.PlayerInfo

class TeamAdapter(private val players: List<PlayerInfo>,
                  private val removePlayerCallback: (String) -> Unit,
                  private val userInfo: AccountInfo,
                  private val isOwnerIcon: Drawable,
                  private val isBotIcon: Drawable,
                  private val teamColor: Drawable?,
                  private val canRemoveBot: Boolean) : RecyclerView.Adapter<TeamAdapter.ViewHolderPlayer>() {
    var userIsOwner = false

    class ViewHolderPlayer(view: View) : RecyclerView.ViewHolder(view) {
        val avatarView: ImageView = itemView.findViewById(R.id.avatar)
        val usernameTextView: TextView = itemView.findViewById(R.id.username)
        val removePlayerBtn: ImageButton = itemView.findViewById(R.id.removePlayerBtn)
        val attributeIcon: ImageView = itemView.findViewById(R.id.attributeIcon)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolderPlayer {
        val inflater = LayoutInflater.from(parent.context)
        return ViewHolderPlayer(inflater.inflate(R.layout.item_team_playerinfo, parent, false))
    }

    override fun onBindViewHolder(holder: ViewHolderPlayer, position: Int) {
        holder.itemView.background = teamColor
        holder.usernameTextView.text = players[position].username
        holder.avatarView.setImageBitmap(players[position].avatar)
        val player = players[position]
        val attributeIcon = when {
            player.isBot -> isBotIcon
            player.isOwner -> isOwnerIcon
            else -> null
        }
        holder.attributeIcon.setImageDrawable(attributeIcon)
        holder.removePlayerBtn.visibility = View.INVISIBLE
        if (userIsOwner && player.accountId != userInfo.accountId && !player.isBot) {
                holder.removePlayerBtn.visibility = View.VISIBLE
                holder.removePlayerBtn.setOnClickListener { removePlayerCallback.invoke(player.accountId) }
        }
        if(player.isBot && canRemoveBot){
            holder.removePlayerBtn.visibility = View.VISIBLE
            holder.removePlayerBtn.setOnClickListener { removePlayerCallback.invoke(player.accountId) }
        }
    }

    fun updateGameOwner(owner: PlayerInfo?) {
        userIsOwner = if (owner == null)
            false
        else
            owner.accountId == userInfo.accountId
    }

    override fun getItemCount(): Int {
        return players.size
    }
}