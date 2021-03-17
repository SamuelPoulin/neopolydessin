package com.projet.clientleger.ui.lobby.view

import android.content.Intent
import android.os.Bundle
import android.widget.TextView
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.projet.clientleger.data.api.model.GameCreationInfosModel
import com.projet.clientleger.data.api.model.LobbyInfo
import com.projet.clientleger.databinding.ActivityLobbyBinding
import com.projet.clientleger.ui.game.GameActivity
import com.projet.clientleger.ui.lobby.viewmodel.LobbyViewModel
import com.projet.clientleger.ui.mainmenu.view.MainmenuActivity
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class LobbyActivity : AppCompatActivity() {
    private val vm: LobbyViewModel by viewModels()
    lateinit var binding: ActivityLobbyBinding
    private var playerCount:Int = 0
    private val playersView = ArrayList<TextView>()

    private fun setSubscriptions() {
        vm.receivePlayersInfo()
                .subscribe { username ->
                    lifecycleScope.launch {
                        addPlayerToGame(username.toString())
                    }
                }

        vm.receiveStartGame().subscribe{
            lifecycleScope.launch {
                goToActivity(GameActivity::class.java)
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLobbyBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupButtons()
        retrievePlayerInfos()
        playersView.add(binding.player1Name)
        playersView.add(binding.player2Name)
        playersView.add(binding.player3Name)
        playersView.add(binding.player4Name)
        val gameInfo:GameCreationInfosModel = intent.getSerializableExtra("GAME_INFO") as GameCreationInfosModel
        intent.getParcelableExtra<LobbyInfo>("LOBBY_INFO")?.let { fillLobbyInfo(it) }
        binding.gamemode.text = gameInfo.gameMode
        binding.difficulty.text = gameInfo.difficulty
        addPlayerToGame(gameInfo.gameCreator)
        setSubscriptions()
    }

    private fun fillLobbyInfo(lobbyInfo: LobbyInfo){
        for(i in lobbyInfo.playerInfo.indices){
            playersView[i].text = lobbyInfo.playerInfo[i].playerName
        }
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
        vm.startGame()
    }
    private fun goToMainMenu(){
        val intent = Intent(this, MainmenuActivity::class.java)
        startActivity(intent)
    }

    private fun <T> goToActivity(java: Class<T>) {
        startActivity(Intent(this, java))
    }
    private fun retrievePlayerInfos(){

    }
    private fun kickPlayer(playerIndex:Int){

    }
    private fun addPlayerToGame(name:String){
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