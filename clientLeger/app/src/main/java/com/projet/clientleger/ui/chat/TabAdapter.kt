package com.projet.clientleger.ui.chat

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.projet.clientleger.R
import com.projet.clientleger.data.enumData.TabType
import com.projet.clientleger.data.model.chat.Convo
import com.projet.clientleger.data.model.chat.TabInfo
import kotlinx.android.synthetic.main.activity_mainmenu.view.*

class TabAdapter(private val convos: ArrayList<Convo>): RecyclerView.Adapter<TabAdapter.ViewHolderTab>() {
    private var selectedTab: TabInfo? = null
    private val items: ArrayList<Pair<String, FrameLayout>> = ArrayList()
    var removeCallback: ((String) -> Unit)? = null
    var changeTabCallback: ((TabInfo) -> Unit)? = null
    class ViewHolderTab(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val notifIcon: ImageView = itemView.findViewById(R.id.notificationIcon)
        val rootView: View = itemView
        val tabTextView: TextView = itemView.findViewById(R.id.tabName)
        val selectedUnderline: FrameLayout = itemView.findViewById(R.id.selectedUnderline)
        val closeBtn: ImageButton = itemView.findViewById(R.id.closeBtn)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolderTab {
        val inflater = LayoutInflater.from(parent.context)
        return ViewHolderTab(inflater.inflate(R.layout.item_tab, parent, false))
    }

    override fun onBindViewHolder(holder: ViewHolderTab, position: Int) {
        val convo = convos[position]
        if(convo.tabInfo.convoName.length > 12)
            holder.tabTextView.text = convo.tabInfo.convoName.subSequence(0, 12).toString() + "..."
        else
            holder.tabTextView.text = convos[position].tabInfo.convoName

        val tabId = selectedTab?.convoId ?: ""

        if(convo.tabInfo.tabType == TabType.STATIC_ROOM || convo.tabInfo.tabType == TabType.GAME)
            holder.closeBtn.visibility = View.GONE
        else
            holder.closeBtn.visibility = View.VISIBLE

        if(convo.tabInfo.convoId != tabId)
            holder.selectedUnderline.visibility = View.GONE
        else
            holder.selectedUnderline.visibility = View.VISIBLE

        if(convo.tabInfo.hasNotif)
            holder.notifIcon.visibility = View.VISIBLE
        else
            holder.notifIcon.visibility = View.GONE

        holder.rootView.setOnClickListener {
            changeTabCallback?.invoke(convo.tabInfo)
        }
        holder.closeBtn.setOnClickListener {
            removeCallback?.invoke(convo.tabInfo.convoId)
        }
        items.add(Pair(convo.tabInfo.convoId, holder.selectedUnderline))
    }

    override fun getItemCount(): Int {
       return convos.size
    }

    fun setSelectedTabIndex(tabInfo: TabInfo){
        selectedTab = tabInfo
        for(item in items){
            if(item.first == tabInfo.convoId){
                item.second.visibility = View.VISIBLE
            }
            else
                item.second.visibility = View.GONE
        }
    }
}