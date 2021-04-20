package com.projet.clientleger.ui.game.view

import android.annotation.SuppressLint
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Rect
import android.graphics.drawable.ColorDrawable
import android.opengl.Visibility
import android.os.Bundle
import android.os.CountDownTimer
import android.os.IBinder
import android.util.AttributeSet
import android.view.Gravity
import android.view.View
import androidx.activity.viewModels
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.os.bundleOf
import androidx.fragment.app.commit
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.projet.clientleger.R
import com.projet.clientleger.data.api.model.TeamScore
import com.projet.clientleger.data.api.model.lobby.Player
import com.projet.clientleger.data.enumData.*
import com.projet.clientleger.data.model.chat.TabInfo
import com.projet.clientleger.data.model.game.PlayerAvatar
import com.projet.clientleger.data.model.lobby.PlayerInfo
import com.projet.clientleger.data.service.ChatStorageService
import com.projet.clientleger.ui.game.viewmodel.GameViewModel
import dagger.hilt.android.AndroidEntryPoint
import com.projet.clientleger.databinding.ActivityGameBinding
import com.projet.clientleger.ui.IAcceptGameInviteListener
import com.projet.clientleger.ui.chat.ChatFragment
import com.projet.clientleger.ui.chat.ChatViewModel
import com.projet.clientleger.ui.drawboard.DrawboardFragment
import com.projet.clientleger.ui.game.PlayersAdapter
import com.projet.clientleger.ui.lobby.view.LobbyActivity
import com.projet.clientleger.ui.lobby.viewmodel.LobbyViewModel
import com.projet.clientleger.ui.mainmenu.view.MainmenuActivity
import kotlinx.android.synthetic.main.dialog_button_quit_game.*
import kotlinx.android.synthetic.main.dialog_gamemode.*
import kotlinx.android.synthetic.main.dialog_gamemode.title
import kotlinx.coroutines.launch
import java.util.*
import javax.inject.Inject
import kotlin.collections.ArrayList

const val MILLIS_IN_SEC:Long = 1000
const val TIME_ALMOST_UP:Int= 15000
const val TWO_DIGITS:Int = 10
const val SEC_IN_MIN:Int = 60
const val QUIT_GAME_MESSAGE:String = "Voulez vous vraiment quitter?"
const val GAME_WON = "Victoire"
const val GAME_LOST = "Défaite"
const val GAME_TIED = "Égalité"

@AndroidEntryPoint
class GameActivity : AppCompatActivity(), IAcceptGameInviteListener {

    @Inject
    lateinit var drawboardFragment: DrawboardFragment

    @Inject
    lateinit var chatFragment: ChatFragment

    private val vm: GameViewModel by viewModels()
    lateinit var binding: ActivityGameBinding
    private val team1: ArrayList<PlayerInfo> = ArrayList()
    private val team2: ArrayList<PlayerInfo> = ArrayList()
    private var timer:CountDownTimer? = null
    private var chatService: ChatStorageService? = null


    private val chatConnection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            chatService = (service as ChatStorageService.LocalBinder).getService()
        }

        override fun onServiceDisconnected(name: ComponentName?) {
            chatService = null
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        supportFragmentManager.setFragmentResultListener("ready", this){ s: String, bundle: Bundle ->
            vm.onPlayerReady()
        }
        vm.init(supportFragmentManager)
        binding = ActivityGameBinding.inflate(layoutInflater)
        setContentView(binding.root)
        binding.lifecycleOwner = this
        binding.root.viewTreeObserver.addOnGlobalLayoutListener {
            val rect = Rect()
            binding.root.getWindowVisibleDisplayFrame(rect)
            val heightDiff = binding.root.height - rect.bottom
            supportFragmentManager.setFragmentResult("keyboardEvent", bundleOf("height" to heightDiff))
        }
        supportFragmentManager.setFragmentResult("isGuessing", bundleOf("boolean" to true))

        setSubscriptions()
        setupTeamsUi()
        binding.team1Rv.layoutManager = LinearLayoutManager(this)
        binding.team1Rv.adapter = PlayersAdapter(team1)
        binding.team2Rv.layoutManager = LinearLayoutManager(this)
        binding.team2Rv.adapter = PlayersAdapter(team2)

        supportFragmentManager.commit{
            add(R.id.drawboardContainer, drawboardFragment)
            add(R.id.chatRoot,chatFragment)
        }

        binding.logoutBtn.setOnClickListener {
            showQuitGameDialog(QUIT_GAME_MESSAGE, false)
        }
        binding.continueTutorial.visibility = View.INVISIBLE
    }

    override fun onStart() {
        super.onStart()
        if(chatService == null) {
            Intent(this, ChatStorageService::class.java).also { intent ->
                bindService(intent, chatConnection, Context.BIND_IMPORTANT)
            }
        }
    }

    override fun onStop() {
        super.onStop()
        chatService?.let {
            unbindService(chatConnection)
        }

    }

    private fun setupTeamsUi(){
        val gameType = intent.getSerializableExtra("gameType") as GameType
        binding.team1Score.text = "0"
        binding.team2Score.text = "0"
        if(gameType != GameType.CLASSIC){
            binding.team1Label.text = "Joueurs - "
            binding.team2Label.visibility = View.GONE
            binding.team2Score.visibility = View.GONE
        }
    }

    private fun showQuitGameDialog(message:String, isMessageFromServer:Boolean){
        val dialogView = layoutInflater.inflate(R.layout.dialog_button_quit_game, null)
        val dialog = AlertDialog.Builder(this).setView(dialogView).create()
        dialog.show()
        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        dialog.titleMessage.text = message

        dialog.quitBtn.setOnClickListener {
            chatService?.removeConvo(ChatViewModel.GAME_TAB_ID)
            vm.playSound(SoundId.CLOSE_GAME.value)
            dialog.dismiss()
            supportFragmentManager.setFragmentResult("closeGameChat", bundleOf("tabName" to LobbyViewModel.GAME_TAB_NAME))
            supportFragmentManager.setFragmentResult("activityChange", bundleOf("currentActivity" to "lobby"))
            finish()
        }

        if(isMessageFromServer){
            val endGameStatement = getEndGameStatement()
            when(endGameStatement){
                GameResult.NONE ->{
                    dialog.gameOutcome.visibility = View.GONE
                    dialog.gameScore.visibility = View.GONE
                }
                GameResult.COOP ->{
                    dialog.gameOutcome.visibility = View.GONE
                }
                else -> {
                    if(endGameStatement == GameResult.LOSE)
                        dialog.gameOutcome.setTextColor(Color.RED)
                }
            }

            dialog.gameOutcome.text = endGameStatement.value
            dialog.gameScore.text = "Vous avez accumulé ${getScore()} points"

            dialog.continueBtn.visibility = View.GONE
            dialog.setOnDismissListener {
                chatService?.removeConvo(ChatViewModel.GAME_TAB_ID)
                dialog.dismiss()
                supportFragmentManager.setFragmentResult("closeGameChat", bundleOf("tabName" to LobbyViewModel.GAME_TAB_NAME))
                supportFragmentManager.setFragmentResult("activityChange", bundleOf("currentActivity" to "lobby"))
                finish() }
        }
        else{
            dialog.gameOutcome.visibility = View.INVISIBLE
            dialog.gameScore.visibility = View.INVISIBLE
            dialog.continueBtn.setOnClickListener {
                vm.playSound(SoundId.SELECTED.value)
                dialog.dismiss()
            }
        }
    }
    private fun getScore():Int{
        return when(isPlayerInTeam(team1)){
            true -> vm.teamScores.value!![0].score!!
            else -> vm.teamScores.value!![1].score!!
        }
    }
    private fun getEndGameStatement(): GameResult{
        return if(vm.teamScores.value!!.size == 1){
            GameResult.COOP
        }
        else{
            when(isPlayerInTeam(team1)){
                true -> getGameOutcome(vm.teamScores.value!!,0,1)
                else -> getGameOutcome(vm.teamScores.value!!,1,0)
            }
        }
    }
    private fun isPlayerInTeam(team:ArrayList<PlayerInfo>):Boolean{
        var result = false
        for(i in 0 until team.size){
            if(team[i].username == vm.getUsername()){
                result = true
            }
        }
        return result
    }
    private fun getGameOutcome(scores:ArrayList<TeamScore>, allyTeam:Int, enemyTeam:Int): GameResult{
        return when{
            scores[allyTeam].score!! > scores[enemyTeam].score!! -> GameResult.WIN
            scores[enemyTeam].score!! > scores[allyTeam].score!! -> GameResult.LOSE
            else -> GameResult.NONE
        }
    }
    @SuppressLint("SetTextI18n")
    private fun setSubscriptions(){
        vm.currentRoleLiveData.observe(this){
            supportFragmentManager.setFragmentResult("isGuessing", bundleOf("boolean" to (it == PlayerRole.GUESSER)))
            supportFragmentManager.setFragmentResult("isDrawing", bundleOf("boolean" to (it == PlayerRole.DRAWER)))
            val icon = when(it){
                PlayerRole.DRAWER -> R.drawable.ic_drawer
                PlayerRole.GUESSER -> R.drawable.ic_guessing
                else -> 0
            }
            val instruction = when(it){
                PlayerRole.DRAWER -> "Dessinez"
                PlayerRole.GUESSER -> "Devinez"
                else -> "Attendez"
            }
            binding.roleInstruction.text = instruction
            if(icon != 0){
                binding.currentRole.setImageResource(icon)
                binding.currentRole.visibility = View.VISIBLE
            } else
                binding.currentRole.visibility = View.GONE
        }

        vm.playersLiveData.observe(this){
            team1.clear()
            team2.clear()
            for(player in it){
                when(player.teamNumber){
                    0 -> {team1.add(player)
                        binding.team1Rv.adapter?.notifyDataSetChanged()
                    }
                    1 ->{team2.add(player)
                        binding.team2Rv.adapter?.notifyDataSetChanged()
                    }
                }
            }
        }

        vm.activeWord.observe(this){
            if(vm.currentRoleLiveData.value == PlayerRole.DRAWER){
                binding.wordGuess.text = "Mot : ${vm.activeWord.value}"
                binding.wordGuess.visibility = View.VISIBLE
            }
            else{
                binding.wordGuess.visibility = View.INVISIBLE
                binding.wordGuess.text = ""
            }
        }
        vm.activeTimer.observe(this){
            setTimer(it)
        }
        vm.teamScores.observe(this){
            if(it.size > 0)
                binding.team1Score.text = it[0].score.toString()
            if(it.size > 1)
                binding.team2Score.text = it[1].score.toString()
        }
        vm.receiveEndGameNotice().subscribe{
            timer?.cancel()
            lifecycleScope.launch {
                showQuitGameDialog(ReasonEndGame.stringToEnum(it).findDialogMessage(), true)
            }
        }
    }

    private fun setTimer(timeInMilis:Long){
        timer?.cancel()
        timer = object: CountDownTimer(timeInMilis, MILLIS_IN_SEC){
            @SuppressLint("SetTextI18n")
            override fun onTick(millisUntilFinished:Long){
                if(millisUntilFinished <= TIME_ALMOST_UP){
                    vm.playSound(SoundId.TICK.value)
                }
                val secRemaining = (((millisUntilFinished / MILLIS_IN_SEC)) % SEC_IN_MIN).toInt()
                val minRemaining:Int = (((millisUntilFinished / MILLIS_IN_SEC) - secRemaining) / SEC_IN_MIN).toInt()
                if(secRemaining < TWO_DIGITS){
                    binding.timer.text = "$minRemaining:0$secRemaining"
                }
                else{
                    binding.timer.text = "$minRemaining:$secRemaining"
                }
            }
            override fun onFinish(){}
        }
        timer?.start()
    }

    override fun onDestroy() {
        timer?.cancel()
        vm.onLeaveGame()
        vm.unsubscribe()
        super.onDestroy()
    }
    override fun acceptInvite(info: Pair<String, String>) {
        intent = Intent(this, LobbyActivity::class.java)
        intent.putExtra("lobbyId", info.second)
        intent.putExtra("isJoining", true)
        startActivity(intent)
        finish()
    }

    override fun onBackPressed() {
        showQuitGameDialog(QUIT_GAME_MESSAGE, false)
    }
}