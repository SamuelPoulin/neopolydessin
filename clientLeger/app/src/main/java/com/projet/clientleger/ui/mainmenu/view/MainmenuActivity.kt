package com.projet.clientleger.ui.mainmenu.view

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.FragmentManager
import com.projet.clientleger.R
import com.projet.clientleger.ui.chat.ChatFragment

class MainmenuActivity : AppCompatActivity() {
    val fragmentManager: FragmentManager = supportFragmentManager
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_mainmenu)
        if(savedInstanceState == null){
            println("activtycreation---------------------true")
            fragmentManager.beginTransaction().replace(R.id.chat_root, ChatFragment.newInstance(), "chat").commit()
        }
        else
            println("activtycreation---------------------false")
    }
}