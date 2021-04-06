package com.projet.clientleger.data.service

import com.projet.clientleger.data.model.chat.IMessage
import com.projet.clientleger.data.model.chat.TabInfo
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ChatStorageService @Inject constructor() {
    private val tabs: ArrayList<TabInfo> = ArrayList()
    private val convos: HashMap<String, ArrayList<IMessage>> = HashMap()
    var selectedTab: TabInfo = TabInfo()

    fun getTabs(): ArrayList<TabInfo> {
        return tabs
    }

    fun getConvos(): HashMap<String, ArrayList<IMessage>> {
        return convos
    }

    fun saveData(convosToSave: HashMap<String, ArrayList<IMessage>>, tabsToSave: ArrayList<TabInfo>, selectedTab: TabInfo) {

        convos.clear()
        convos.putAll(convosToSave)

        tabs.clear()
        tabs.addAll(tabsToSave)

        this.selectedTab = selectedTab
    }

    fun clear() {
        tabs.clear()
        convos.clear()
    }

    fun addEmptyTab(tabInfo: TabInfo, index: Int = 0, isSelected: Boolean = false){
        tabs.add(index, tabInfo)
        if(isSelected)
            selectedTab = tabInfo
    }
}