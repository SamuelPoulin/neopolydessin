package com.projet.clientleger.ui.lobby.view

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.TextView
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.projet.clientleger.R
import com.projet.clientleger.data.api.model.GameCreationInfosModel
import com.projet.clientleger.data.api.model.lobby.Player
import com.projet.clientleger.data.model.lobby.PlayerInfo
import com.projet.clientleger.databinding.ActivityLobbyBinding
import com.projet.clientleger.ui.game.view.GameActivity
import com.projet.clientleger.ui.lobby.TeamAdapter
import com.projet.clientleger.ui.lobby.viewmodel.LobbyViewModel
import com.projet.clientleger.ui.mainmenu.view.MainmenuActivity
import com.projet.clientleger.utils.BitmapConversion
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class LobbyActivity : AppCompatActivity() {
    private val vm: LobbyViewModel by viewModels()
    lateinit var binding: ActivityLobbyBinding
    private var playerCount:Int = 0
    private val playersView = ArrayList<ConstraintLayout>()
    private val teams: Array<ArrayList<PlayerInfo>> = arrayOf(ArrayList(), ArrayList())
    private lateinit var rvTeams: Array<RecyclerView>

    private fun setSubscriptions() {
//        vm.receivePlayersInfo()
//                .subscribe { username ->
//                    lifecycleScope.launch {
//                        addPlayerToGame(username.toString())
//                    }
//                }

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
        rvTeams = arrayOf(binding.teamContent1, binding.teamContent2)
        for(i in rvTeams.indices){
            val manager = LinearLayoutManager(this)
            manager.orientation = RecyclerView.HORIZONTAL
            rvTeams[i].layoutManager = manager
            rvTeams[i].adapter = TeamAdapter(teams[i], ::kickPlayer)

            vm.teams[i].observe(this){
                teams[i].clear()
                teams[i].addAll(it)
                rvTeams[i].adapter?.notifyDataSetChanged()
            }
        }
        vm.fillTeams(BitmapConversion.vectorDrawableToBitmap(this, R.drawable.ic_missing_player))
        val gameInfo:GameCreationInfosModel = intent.getSerializableExtra("GAME_INFO") as GameCreationInfosModel
        val username = vm.getUsername()
        //intent.getParcelableExtra<LobbyInfo>("LOBBY_INFO")?.let { fillLobbyInfo(it) }
        binding.gamemode.text = getFrenchGameMode(gameInfo.gameMode)
        binding.difficulty.text = getFrenchDifficulty(gameInfo.difficulty)
        //addPlayerToGame(gameInfo.gameCreator)
        setSubscriptions()
        if(gameInfo.gameCreator != username){
            binding.startGameButton.visibility = View.INVISIBLE
        } else{
            vm.setUserInfo()
        }

//        val fragment :ChatFragment = ChatFragment.newInstance()
//
//        if(savedInstanceState == null){
//            supportFragmentManager
//                .beginTransaction()
//                .add(R.id.chat_root,fragment,"chat_fragment")
//                .commit()
//        }
    }
    private fun getFrenchGameMode(englishMode:String):String{
        when(englishMode){
            "classic" -> return "Classique"
            "solo" -> return "Solo"
            "coop" -> return "Coop"
        }
        return "Classique"
    }
    private fun getFrenchDifficulty(englishDifficulty:String):String{
        when(englishDifficulty){
            "easy" -> return "Facile"
            "intermediate" -> return "Intermediaire"
            "hard" -> return "Difficile"
        }
        return "Facile"
    }

    /*private fun fillLobbyInfo(lobbyInfo: LobbyInfo){
        for(i in lobbyInfo.playerInfo.indices){
            playersView[i].text = lobbyInfo.playerInfo[i].playerName
        }
    }*/

    private fun setupButtons(){
        binding.startGameButton.setOnClickListener {
            startGame()
        }
        binding.exitGame.setOnClickListener {
            vm.leaveLobby()
            goToMainMenu()
        }
//        binding.removePlayer1Button.setOnClickListener {
//            kickPlayer(1)
//        }
//        binding.removePlayer2Button.setOnClickListener {
//            kickPlayer(2)
//        }
//        binding.removePlayer3Button.setOnClickListener {
//            kickPlayer(3)
//        }
//        binding.removePlayer4Button.setOnClickListener {
//            kickPlayer(4)
//        }
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
    private fun kickPlayer(player:PlayerInfo){
        println("kic: ${player.username}")
    }
    private fun addPlayerToGame(info: Player){
        playerCount++
        val textView = playersView[playerCount].findViewWithTag<TextView>("playerView")
        textView.text = info.playerName
        textView.isEnabled = true
    }
    private fun disableRemoveButtonWithIndex(index:Int){
        when(index){
//            1-> binding.removePlayer1Button.isEnabled = false
//            2-> binding.removePlayer2Button.isEnabled = false
//            3-> binding.removePlayer3Button.isEnabled = false
//            4-> binding.removePlayer4Button.isEnabled = false
        }
    }
    private fun disableAllRemoveButtons(){
//        binding.removePlayer1Button.isEnabled = false
//        binding.removePlayer2Button.isEnabled = false
//        binding.removePlayer3Button.isEnabled = false
//        binding.removePlayer4Button.isEnabled = false
    }
}