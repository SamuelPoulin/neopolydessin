package com.projet.clientleger.ui.game.view

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Rect
import android.graphics.drawable.ColorDrawable
import android.opengl.Visibility
import android.os.Bundle
import android.os.CountDownTimer
import android.view.Gravity
import android.view.View
import androidx.activity.viewModels
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.os.bundleOf
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.projet.clientleger.R
import com.projet.clientleger.data.api.model.lobby.Player
import com.projet.clientleger.data.enumData.PlayerRole
import com.projet.clientleger.data.enumData.ReasonEndGame
import com.projet.clientleger.data.model.game.PlayerAvatar
import com.projet.clientleger.data.model.lobby.PlayerInfo
import com.projet.clientleger.ui.game.viewmodel.GameViewModel
import dagger.hilt.android.AndroidEntryPoint
import com.projet.clientleger.databinding.ActivityGameBinding
import com.projet.clientleger.ui.game.PlayersAdapter
import com.projet.clientleger.ui.mainmenu.view.MainmenuActivity
import kotlinx.android.synthetic.main.dialog_button_quit_game.*
import kotlinx.android.synthetic.main.dialog_gamemode.*
import kotlinx.android.synthetic.main.dialog_gamemode.title
import kotlinx.coroutines.launch
import java.util.*
import kotlin.collections.ArrayList

const val MILLIS_IN_SEC:Long = 1000
const val TIME_ALMOST_UP:Int= 15000
const val TWO_DIGITS:Int = 10
const val SEC_IN_MIN:Int = 60
const val QUIT_GAME_MESSAGE:String = "Voulez vous vraiment quitter?"

@AndroidEntryPoint
class GameActivity : AppCompatActivity() {

    private val vm: GameViewModel by viewModels()
    lateinit var binding: ActivityGameBinding
    //private var currentKeyWord : String = ""
    private val team1: ArrayList<PlayerInfo> = ArrayList()
    private val team2:ArrayList<PlayerInfo> = ArrayList()
    private var timer:CountDownTimer? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
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
        //clientRole.playerName = vm.accountInfo.username
        setSubscriptions()

        binding.team1Rv.layoutManager = LinearLayoutManager(this)
        binding.team1Rv.adapter = PlayersAdapter(team1)
        binding.team2Rv.layoutManager = LinearLayoutManager(this)
        binding.team2Rv.adapter = PlayersAdapter(team2)

        binding.logoutBtn.setOnClickListener {
            showQuitGameDialog(QUIT_GAME_MESSAGE, false)
        }
        vm.onPlayerReady()
    }
    private fun showQuitGameDialog(message:String, isMessageFromServer:Boolean){
        val dialogView = layoutInflater.inflate(R.layout.dialog_button_quit_game, null)
        val dialog = AlertDialog.Builder(this).setView(dialogView).create()

        dialog.show()
        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        dialog.title.text = message

        dialog.quitBtn.setOnClickListener {
            vm.unsubscribe()
            dialog.dismiss()
            finish()
        }

        if(isMessageFromServer){
            dialog.continueBtn.visibility = View.GONE
            dialog.setOnDismissListener {
                vm.unsubscribe()
                finish() }
        }
        else{
            dialog.continueBtn.setOnClickListener {
                dialog.dismiss()
            }
        }
    }
    @SuppressLint("SetTextI18n")
    private fun setSubscriptions(){
        vm.currentRoleLiveData.observe(this){
            supportFragmentManager.setFragmentResult("isGuessing", bundleOf("boolean" to (it == PlayerRole.GUESSER)))
            supportFragmentManager.setFragmentResult("isDrawing", bundleOf("boolean" to (it == PlayerRole.DRAWER)))
            binding.role.text = getFrenchRole(it.value)
        }

        vm.playersLiveData.observe(this){
            if(team1.isEmpty())
                updatePlayersAvatar(it)
            team1.clear()
            team2.clear()
            for(player in it){
                println(player.playerRole)
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
            println("Nouveau Mot : $it")
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
            println("Nouveau timer recu : $it")
            setTimer(it)
        }
        vm.teamScores.observe(this){
            println("score équipe 1 : ${it[0].score}")
            println("score équipe 2 : ${it[1].score}")
            binding.team1Label.text = "Équipe 1 - ${it[0].score}"
            binding.team2Label.text = "Équipe 1 - ${it[1].score}"
        }

        vm.receiveEndGameNotice().subscribe(){
            showQuitGameDialog(ReasonEndGame.stringToEnum(it).findDialogMessage(), true)
        }
    }

    private fun updatePlayersAvatar(playersInfo: ArrayList<PlayerInfo>){
        
    }

    /*private fun boardwipeNeeded(newPlayersInfo: ArrayList<PlayerInfo>): Boolean{
        val newDrawer = newPlayersInfo.find { it.playerRole == PlayerRole.DRAWER }
        val oldDrawer = players.find { it.playerRole == PlayerRole.DRAWER }
        return newDrawer != oldDrawer

    }*/

    private fun getFrenchRole(role:String):String{
        return when (role){
            PlayerRole.DRAWER.value -> "Dessinateur"
            PlayerRole.GUESSER.value -> "Devineur"
            else -> "Passif"
        }
    }
    private fun setTimer(timeInMilis:Long){
        timer?.cancel()
        timer = object: CountDownTimer(timeInMilis, MILLIS_IN_SEC){
            @SuppressLint("SetTextI18n")
            override fun onTick(millisUntilFinished:Long){
                if(millisUntilFinished <= TIME_ALMOST_UP){
                    binding.timer.setTextColor(Color.RED)
                    binding.timerIcon.setImageResource(R.drawable.ic_timer_red)
                }
                else{
                    binding.timer.setTextColor(Color.GREEN)
                    binding.timerIcon.setImageResource(R.drawable.ic_timer_green)
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
            override fun onFinish(){

            }
        }
        timer?.start()
    }

    override fun onDestroy() {
        println("Partie Détruite")
        vm.unsubscribe()
        super.onDestroy()
    }
}