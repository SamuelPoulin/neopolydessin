package com.projet.clientleger.ui.lobby.view

import android.content.Context
import android.content.Intent
import android.os.Bundle
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.projet.clientleger.R
import com.projet.clientleger.databinding.ConnexionActivityBinding
import com.projet.clientleger.ui.connexion.viewmodel.ConnexionViewModel
import com.projet.clientleger.databinding.ActivityLobbyBinding
import com.projet.clientleger.databinding.ActivityMainmenuBinding
import com.projet.clientleger.ui.lobby.viewmodel.LobbyViewModel
import com.projet.clientleger.ui.mainmenu.view.MainmenuActivity
import com.projet.clientleger.ui.register.view.RegisterActivity
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class LobbyActivity : AppCompatActivity() {
    private val vm: LobbyViewModel by viewModels()
    lateinit var binding: ActivityLobbyBinding
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLobbyBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupButtons()
        vm.connectSocket(getSharedPreferences(
            getString(R.string.user_creds),
            Context.MODE_PRIVATE
        ).getString("accessToken", "")!!)
        retrievePlayerInfos()
    }
    private fun setupButtons(){
        binding.startGameButton.setOnClickListener {
            startGame()
        }
        binding.exitGame.setOnClickListener {
            goToMainMenu()
        }
        binding.removePlayer1Button.setOnClickListener {
            kickPlayer(1)
        }
        binding.removePlayer2Button.setOnClickListener {
            kickPlayer(2)
        }
        binding.removePlayer3Button.setOnClickListener {
            kickPlayer(3)
        }
        binding.removePlayer4Button.setOnClickListener {
            kickPlayer(4)
        }
    }
    private fun startGame(){
        //TODO
    }
    private fun goToMainMenu(){
        val intent = Intent(this, MainmenuActivity::class.java)
        startActivity(intent)
    }
    private fun retrievePlayerInfos(){

    }
    private fun kickPlayer(playerIndex:Int){

    }
}