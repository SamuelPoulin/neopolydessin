package com.projet.clientleger.ui.chat

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.projet.clientleger.R
import com.projet.clientleger.data.model.chat.TabInfo
import kotlinx.android.synthetic.main.activity_mainmenu.view.*

class TabAdapter(private val tabs: ArrayList<TabInfo>,
                 private val clickCallback: (TabInfo) -> Unit): RecyclerView.Adapter<TabAdapter.ViewHolderTab>() {
    private var selectedTab: TabInfo? = null
    private val items: ArrayList<Pair<String, FrameLayout>> = ArrayList()
    class ViewHolderTab(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val rootView: View = itemView
        val tabTextView: TextView = itemView.findViewById(R.id.tabName)
        val selectedUnderline: FrameLayout = itemView.findViewById(R.id.selectedUnderline)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolderTab {
        val inflater = LayoutInflater.from(parent.context)
        return ViewHolderTab(inflater.inflate(R.layout.item_tab, parent, false))
    }

    override fun onBindViewHolder(holder: ViewHolderTab, position: Int) {
        holder.tabTextView.text = tabs[position].convoName
        val tabId = selectedTab?.convoId ?: ""
        if(tabs[position].convoId != tabId)
            holder.selectedUnderline.visibility = View.INVISIBLE
        else
            holder. selectedUnderline.visibility = View.VISIBLE

        holder.rootView.setOnClickListener {
            clickCallback.invoke(tabs[position])
        }
        items.add(Pair(tabs[position].convoId, holder.selectedUnderline))
    }

    override fun getItemCount(): Int {
       return tabs.size
    }

    fun setSelectedTabIndex(tabInfo: TabInfo){
        selectedTab = tabInfo

        for(item in items){
            if(item.first == tabInfo.convoId)
                item.second.visibility = View.VISIBLE
            else
                item.second.visibility = View.GONE
        }
    }
}