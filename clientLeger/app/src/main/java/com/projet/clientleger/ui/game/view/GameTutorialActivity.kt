package com.projet.clientleger.ui.game.view

import android.content.Context
import android.graphics.Color
import android.graphics.Rect
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.util.AttributeSet
import android.view.View
import androidx.activity.viewModels
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.os.bundleOf
import androidx.fragment.app.commit
import androidx.fragment.app.setFragmentResultListener
import androidx.recyclerview.widget.LinearLayoutManager
import com.projet.clientleger.R
import com.projet.clientleger.data.api.model.SequenceModel
import com.projet.clientleger.data.model.lobby.PlayerInfo
import com.projet.clientleger.databinding.ActivityGameBinding
import com.projet.clientleger.ui.drawboard.DrawboardFragment
import com.projet.clientleger.ui.game.PlayersAdapter
import com.projet.clientleger.ui.game.viewmodel.GameViewModel
import com.projet.clientleger.ui.lobby.viewmodel.LobbyViewModel
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.android.synthetic.main.dialog_button_quit_game.*
import kotlinx.android.synthetic.main.dialog_gamemode.*
import javax.inject.Inject

const val GAME_WELCOME = "Bienvenue dans le tutoriel de partie de Polydessin !"
const val GAME_INFOS_INTRO = "Voici le panneau contenant toutes les informations importante à la partie." +
        "\nPremièrement, on peut y trouver le décompte de la partie. Ce décompte représente le temps avant un changement de devineur" +
        "\nPar la suite, on a l'icône de crayon représentant que vous êtes actuellement le dessinateur" +
        "\nFinalement, on a les informations des joueurs dans la partie ainsi que le score d'équipe"
const val DRAWBOARD_INTRO = "Nous passons maintenant à la partie intéressante de la partie, c'est-à-dire le dessin !"
const val INTRO_CONCLUSION = "Félicitation, vous avez terminé le tutoriel de Polydessin!" +
        "\nPour revenir au menu principal et commencer à jouer, appuyez sur le bouton quitter en bas à gauche de l'écran"
@AndroidEntryPoint
class GameTutorialActivity: AppCompatActivity()  {
    private val vm: GameViewModel by viewModels()
    lateinit var binding: ActivityGameBinding
    private val team1: ArrayList<PlayerInfo> = ArrayList()

    @Inject
    lateinit var drawboardFragment:DrawboardFragment

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityGameBinding.inflate(layoutInflater)
        setContentView(binding.root)
        binding.lifecycleOwner = this
        binding.root.viewTreeObserver.addOnGlobalLayoutListener {
            val rect = Rect()
            binding.root.getWindowVisibleDisplayFrame(rect)
            val heightDiff = binding.root.height - rect.bottom
            supportFragmentManager.setFragmentResult("keyboardEvent", bundleOf("height" to heightDiff))
        }
        supportFragmentManager.setFragmentResult("isDrawing", bundleOf("boolean" to true))

        setupTeamsUi()
        binding.team1Rv.layoutManager = LinearLayoutManager(this)
        binding.team1Rv.adapter = PlayersAdapter(team1)

        binding.logoutBtn.setOnClickListener {
            showQuitGameDialog(QUIT_GAME_MESSAGE, false)
        }
        binding.currentRole.setImageResource(R.drawable.ic_drawer)

        supportFragmentManager.commit{
            add(R.id.drawboardContainer, drawboardFragment)
        }

        supportFragmentManager.setFragmentResultListener("ready",this){requestKey, bundle ->
            startTutorialSequence()
        }
    }

    private fun startTutorialSequence(){
        val models:ArrayList<SequenceModel> = ArrayList()
        models.add(SequenceModel(GAME_WELCOME,binding.drawboardContainer,this))
        models.add(SequenceModel(GAME_INFOS_INTRO,binding.team,this))
        models.add(SequenceModel(DRAWBOARD_INTRO,binding.drawboardContainer,this))
        val drawBoardSequenceModels = drawboardFragment.getTutorialSequence()
        for(i in 0 until drawBoardSequenceModels.size){
            models.add(drawBoardSequenceModels[i])
        }
        models.add(SequenceModel(INTRO_CONCLUSION, binding.drawboardContainer,this))
        vm.createSequence(models)
    }

    private fun setupTeamsUi(){
        team1.add(PlayerInfo(username = "stonkMaster"))
        binding.team1Rv.adapter?.notifyDataSetChanged()
        binding.team1Score.text = "0"
        binding.team2Label.visibility = View.GONE
        binding.team2Score.visibility = View.GONE
    }

    private fun showQuitGameDialog(message:String, isMessageFromServer:Boolean){
        val dialogView = layoutInflater.inflate(R.layout.dialog_button_quit_game, null)
        val dialog = AlertDialog.Builder(this).setView(dialogView).create()
        dialog.show()
        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        dialog.titleMessage.text = message

        dialog.quitBtn.setOnClickListener {
            dialog.dismiss()
            supportFragmentManager.setFragmentResult(
                "closeGameChat",
                bundleOf("tabName" to LobbyViewModel.GAME_TAB_NAME)
            )
            supportFragmentManager.setFragmentResult(
                "activityChange",
                bundleOf("currentActivity" to "lobby")
            )
            finish()
        }
            dialog.continueBtn.setOnClickListener {
                dialog.dismiss()
            }
    }
    /*private fun getFrenchRole(role:String):String{
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
            override fun onFinish(){}
        }
        timer?.start()
    }*/
}