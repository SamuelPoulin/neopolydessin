package com.projet.clientleger.ui.lobby.view

import android.os.Bundle
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.projet.clientleger.databinding.ConnexionActivityBinding
import com.projet.clientleger.ui.connexion.viewmodel.ConnexionViewModel
import com.projet.clientleger.databinding.ActivityLobbyBinding
import com.projet.clientleger.databinding.ActivityMainmenuBinding

class LobbyActivity : AppCompatActivity() {
    //private val vm: ConnexionViewModel by viewModels()
    lateinit var binding: ActivityLobbyBinding
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLobbyBinding.inflate(layoutInflater)
        setContentView(binding.root)
    }
}