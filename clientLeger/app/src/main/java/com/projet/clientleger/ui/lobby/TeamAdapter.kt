package com.projet.clientleger.ui.lobby

import android.graphics.drawable.Drawable
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.button.MaterialButton
import com.projet.clientleger.R
import com.projet.clientleger.data.model.account.AccountInfo
import com.projet.clientleger.data.model.lobby.PlayerInfo

class TeamAdapter(private val players: List<PlayerInfo>,
                  private val addBotCallback: (Int) -> Unit,
                  private val removePlayerCallback: (String) -> Unit,
                  private val removeBotCallback: (String) -> Unit,
                  private val userInfo: AccountInfo,
                  private val isOwnerIcon: Drawable,
                  private val isBotIcon: Drawable,
                  private val teamColor: Drawable?,
                  private val canRemoveBot: Boolean) : RecyclerView.Adapter<TeamAdapter.ViewHolderPlayer>() {
    var userIsOwner = false

    class ViewHolderPlayer(view: View) : RecyclerView.ViewHolder(view) {
        val avatarView: ImageView? = itemView.findViewById(R.id.avatar)
        val usernameTextView: TextView? = itemView.findViewById(R.id.username)
        val removePlayerBtn: ImageButton? = itemView.findViewById(R.id.removePlayerBtn)
        val attributeIcon: ImageView? = itemView.findViewById(R.id.attributeIcon)
    }

    override fun getItemViewType(position: Int): Int {
        return when{
            players[position].accountId.isEmpty() && players[position].username.isEmpty() -> 0
            else -> 1
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolderPlayer {
        val inflater = LayoutInflater.from(parent.context)
        val layout = when(viewType){
            0 -> R.layout.item_team_add_bot
            else -> R.layout.item_team_playerinfo
        }
        return ViewHolderPlayer(inflater.inflate(layout, parent, false))
    }

    override fun onBindViewHolder(holder: ViewHolderPlayer, position: Int) {
        val player = players[position]
        if(player.accountId.isEmpty() && player.username.isEmpty()){
            holder.itemView.findViewById<LinearLayout>(R.id.addBotBtn).setOnClickListener { addBotCallback.invoke(player.teamNumber) }
        } else {
            holder.itemView.background = teamColor
            holder.usernameTextView?.text = players[position].username
            holder.avatarView?.setImageBitmap(players[position].avatar)
            val attributeIcon = when {
                player.isBot -> isBotIcon
                player.isOwner -> isOwnerIcon
                else -> null
            }
            holder.attributeIcon?.setImageDrawable(attributeIcon)
            holder.removePlayerBtn?.visibility = View.INVISIBLE
            if (userIsOwner && player.accountId != userInfo.accountId && !player.isBot) {
                holder.removePlayerBtn?.visibility = View.VISIBLE
                holder.removePlayerBtn?.setOnClickListener { removePlayerCallback.invoke(player.accountId) }
            }
            if(player.isBot && canRemoveBot && userIsOwner){
                holder.removePlayerBtn?.visibility = View.VISIBLE
                holder.removePlayerBtn?.setOnClickListener { removeBotCallback.invoke(player.username) }
            }
        }
    }

    override fun getItemCount(): Int {
        return players.size
    }
}