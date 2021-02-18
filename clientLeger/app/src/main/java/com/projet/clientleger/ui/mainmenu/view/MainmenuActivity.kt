package com.projet.clientleger.ui.mainmenu.view

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.FragmentManager
import com.projet.clientleger.R
import com.projet.clientleger.data.api.service.SocketService
import com.projet.clientleger.ui.chat.ChatFragment

class MainmenuActivity : AppCompatActivity() {
    private val fragmentManager: FragmentManager = supportFragmentManager
    private lateinit var chat: ChatFragment

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        startService(Intent(this, SocketService::class.java))

        setContentView(R.layout.activity_mainmenu)
        chat = ChatFragment()
        fragmentManager.beginTransaction()
            .replace(R.id.chat_root, chat, "chat")
            .commit()
    }

    override fun onBackPressed() {
        stopService(Intent(this, SocketService::class.java))
        super.onBackPressed()
    }

}