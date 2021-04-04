package com.projet.clientleger.ui.chat

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.projet.clientleger.R

class TabAdapter(private val tabs: ArrayList<String>): RecyclerView.Adapter<TabAdapter.ViewHolderTab>() {
    private var selectedIndex = 0
    class ViewHolderTab(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val tabTextView: TextView = itemView.findViewById(R.id.tabName)
        val selectedUnderline: FrameLayout = itemView.findViewById(R.id.selectedUnderline)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolderTab {
        val inflater = LayoutInflater.from(parent.context)
        return ViewHolderTab(inflater.inflate(R.layout.item_tab, parent, false))
    }

    override fun onBindViewHolder(holder: ViewHolderTab, position: Int) {
        holder.tabTextView.text = tabs[position]
        if(position != selectedIndex)
            holder.selectedUnderline.visibility = View.INVISIBLE
        else
            holder. selectedUnderline.visibility = View.VISIBLE
    }

    override fun getItemCount(): Int {
       return tabs.size
    }

    fun setSelectedTabIndex(index: Int){
        selectedIndex = index
    }
}