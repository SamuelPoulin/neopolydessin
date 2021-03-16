package com.projet.clientleger.ui.lobby.view

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.View
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.projet.clientleger.R
import com.projet.clientleger.data.api.model.GameCreationInfosModel
import com.projet.clientleger.data.api.service.LobbySocketService
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
    private var playerCount:Int = 0

    private fun setSubscriptions() {
        vm.receivePlayersInfo()
                .subscribe { username ->
                    addPlayerToGame(username.toString())
                }
    }

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
        var gameInfo:GameCreationInfosModel = intent.getSerializableExtra("GAME_INFO") as GameCreationInfosModel
        binding.gamemode.text = gameInfo.gameMode
        binding.difficulty.text = gameInfo.difficulty
        addPlayerToGame(gameInfo.gameCreator)
        setSubscriptions()
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
        disableAllRemoveButtons()
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
    private fun addPlayerToGame(name:String){
        println("NOM DU JOUEUR AJOUTÉ $name")
        playerCount++
        when(playerCount){
            1->{
                binding.player1Name.text = name
                binding.removePlayer1Button.isEnabled = true
            }
            2->{
                binding.player2Name.text = name
                binding.removePlayer2Button.isEnabled = true
            }
            3->{
                binding.player3Name.text = name
                binding.removePlayer3Button.isEnabled = true
            }
            4->{
                binding.player4Name.text = name
                binding.removePlayer4Button.isEnabled = true
            }
        }
    }
    private fun disableRemoveButtonWithIndex(index:Int){
        when(index){
            1-> binding.removePlayer1Button.isEnabled = false
            2-> binding.removePlayer2Button.isEnabled = false
            3-> binding.removePlayer3Button.isEnabled = false
            4-> binding.removePlayer4Button.isEnabled = false
        }
    }
    private fun disableAllRemoveButtons(){
        binding.removePlayer1Button.isEnabled = false
        binding.removePlayer2Button.isEnabled = false
        binding.removePlayer3Button.isEnabled = false
        binding.removePlayer4Button.isEnabled = false
    }
}