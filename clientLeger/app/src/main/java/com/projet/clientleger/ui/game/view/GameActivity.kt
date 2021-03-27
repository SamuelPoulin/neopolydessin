package com.projet.clientleger.ui.game.view

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Color
import android.graphics.Rect
import android.os.Bundle
import android.os.CountDownTimer
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.constraintlayout.widget.ConstraintSet
import androidx.core.os.bundleOf
import androidx.core.view.get
import androidx.fragment.app.setFragmentResult
import androidx.lifecycle.lifecycleScope
import com.projet.clientleger.R
import com.projet.clientleger.data.api.model.PlayerRole
import com.projet.clientleger.ui.connexion.viewmodel.ConnexionViewModel
import com.projet.clientleger.ui.game.viewmodel.GameViewModel
import dagger.hilt.android.AndroidEntryPoint
import com.projet.clientleger.databinding.ActivityGameBinding
import com.projet.clientleger.ui.chat.ChatFragment
import kotlinx.coroutines.launch
import kotlin.Exception
const val MILLIS_IN_SEC:Long = 1000
const val TIME_ALMOST_UP:Int= 15000
const val TWO_DIGITS:Int = 10
const val SEC_IN_MIN:Int = 60
@AndroidEntryPoint
class GameActivity : AppCompatActivity() {

    private val vm: GameViewModel by viewModels()
    lateinit var binding: ActivityGameBinding
    private var currentKeyWord : String = ""
    private var currentRoles: Array<PlayerRole> = arrayOf()

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
        supportFragmentManager.setFragmentResult("isGuessing", bundleOf("boolean" to true))
        //setSubscriptions()

    }
    private fun setSubscriptions(){
        vm.receiveKeyWord()
            .subscribe { keyWord ->
                lifecycleScope.launch {
                    println("Key Word Recu : $keyWord")
                    currentKeyWord = keyWord
                }
            }
        vm.receiveRoles()
            .subscribe { roles ->
                lifecycleScope.launch {
                    println("Roles reçus : $roles")
                    currentRoles = roles
                }
            }
        vm.receiveTimer()
            .subscribe { timer ->
                lifecycleScope.launch {
                    println("Timer de $timer reçu")
                    setTimer()
                }
            }
    }
    private fun setTimer(timeInMilis:Long){
        val timer = object: CountDownTimer(timeInMilis, MILLIS_IN_SEC){
            @SuppressLint("SetTextI18n")
            override fun onTick(millisUntilFinished:Long){
                if(millisUntilFinished <= TIME_ALMOST_UP){
                    binding.timer.setTextColor(Color.RED)
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
        timer.start()
    }
}