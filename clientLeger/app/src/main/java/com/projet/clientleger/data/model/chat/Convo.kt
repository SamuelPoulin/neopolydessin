package com.projet.clientleger.data.model.chat

data class Convo(val tabInfo: TabInfo = TabInfo(), val usernames: HashMap<String, String> = HashMap(), val messages: ArrayList<IMessage> = ArrayList())
