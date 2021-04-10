package com.projet.clientleger.ui.mainmenu.view

import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.view.View
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.Spinner
import androidx.activity.viewModels
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat.startActivity
import androidx.core.os.bundleOf
import androidx.fragment.app.commit
import com.codertainment.materialintro.sequence.SkipLocation
import com.codertainment.materialintro.shape.Focus
import com.codertainment.materialintro.shape.FocusGravity
import com.codertainment.materialintro.shape.ShapeType
import com.codertainment.materialintro.utils.materialIntro
import com.codertainment.materialintro.utils.materialIntroSequence
import com.codertainment.materialintro.view.MaterialIntroView
import com.projet.clientleger.R
import com.projet.clientleger.data.enumData.Difficulty
import com.projet.clientleger.data.enumData.GameType
import com.projet.clientleger.data.service.TutorialService
import com.projet.clientleger.databinding.ActivityMainmenuBinding
import com.projet.clientleger.ui.accountmanagement.view.AccountManagementActivity
import com.projet.clientleger.ui.friendslist.FriendslistFragment
import com.projet.clientleger.ui.lobby.view.LobbyActivity
import com.projet.clientleger.ui.lobbylist.view.SearchLobbyActivity
import com.projet.clientleger.ui.mainmenu.MainMenuViewModel
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.android.synthetic.main.dialog_gamemode.*
import kotlinx.android.synthetic.main.dialog_gamemode.view.*
import javax.inject.Inject

@AndroidEntryPoint
class MainmenuActivity : AppCompatActivity() {

    var selectedGameType: GameType = GameType.CLASSIC
    var selectedDifficulty: Difficulty = Difficulty.EASY
    var isTutorialStarted:Boolean = false
    lateinit var binding: ActivityMainmenuBinding
    @Inject
    lateinit var friendslistFragment: FriendslistFragment
    val vm: MainMenuViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainmenuBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.activity = this

        binding.toolbar.setOnMenuItemClickListener { item ->
            when (item.itemId) {
                R.id.friendslistBtn -> friendslistFragment.toggleVisibility()
                R.id.addFriendBtn -> friendslistFragment.showAddFriendDialog()
            }
            true
        }
        binding.accountBtn.setOnClickListener {
            val intent = Intent(this, AccountManagementActivity::class.java)
            supportFragmentManager.setFragmentResult("activityChange", bundleOf("currentActivity" to "mainmenu"))
            startActivity(intent)
        }

        supportFragmentManager.commit{
            add(R.id.friendslistContainer, friendslistFragment, "friendslist")
        }
        binding.toolbar.setNavigationIcon(R.drawable.ic_logout)
        binding.toolbar.setNavigationOnClickListener {
            finish()
        }
        binding.userGuideBtn.setOnClickListener {
            //userGuide("Haha tu sais meme pas comment utiliser l'application", binding.createGameBtn)
            tutorialSequence()
        }
    }
    private fun tutorialSequence(){
        materialIntroSequence(showSkip = true, persistSkip = true) {
            addConfig {
                viewId = "createGameBtn"
                targetView = binding.createGameBtn
                skipLocation = SkipLocation.BOTTOM_LEFT
                skipText = "Skip"
                isFadeInAnimationEnabled = true
                isFadeOutAnimationEnabled = true
                fadeAnimationDurationMillis = 300
                infoText=  "Haha tu sais meme pas comment utiliser l'application"
                focusType = Focus.ALL
                focusGravity = FocusGravity.CENTER
                dismissOnTouch = false
                isInfoEnabled = true
                infoTextColor = Color.BLACK
                infoTextSize = 18f
                infoTextAlignment = View.TEXT_ALIGNMENT_CENTER
                infoTextTypeface = Typeface.DEFAULT_BOLD
                infoCardBackgroundColor = Color.WHITE
                isHelpIconEnabled = true
                helpIconResource = R.drawable.ic_pencil
                helpIconColor = Color.BLUE
                isDotViewEnabled = false
                //viewId = "unique_id" // or automatically picked from view's tag
                isPerformClick = true
                showOnlyOnce = false
                shapeType = ShapeType.RECTANGLE
                dismissOnTouch = true
            }

        }
    }
    /*fun userGuide(message:String, target: View){
        materialIntro(show = true) {
            isFadeInAnimationEnabled = true
            isFadeOutAnimationEnabled = true
            fadeAnimationDurationMillis = 300
            focusType = Focus.ALL
            focusGravity = FocusGravity.CENTER
            dismissOnTouch = false
            isInfoEnabled = true
            infoText = message
            infoTextColor = Color.BLACK
            infoTextSize = 18f
            infoTextAlignment = View.TEXT_ALIGNMENT_CENTER
            infoTextTypeface = Typeface.DEFAULT_BOLD
            infoCardBackgroundColor = Color.WHITE
            isHelpIconEnabled = true
            helpIconResource = R.drawable.ic_pencil
            helpIconColor = Color.BLUE
            isDotViewEnabled = false
            //viewId = "unique_id" // or automatically picked from view's tag
            targetView = target
            isPerformClick = true
            showOnlyOnce = false
            shapeType = ShapeType.RECTANGLE
            dismissOnTouch = true
        }*/

    fun showGameDialog(isCreating: Boolean) {
        val visibility: Int
        val action: String
        val title: String
        if (isCreating) {
            visibility = View.VISIBLE
            action = resources.getString(R.string.create)
            title = resources.getString(R.string.createGame)
        } else {
            visibility = View.GONE
            action = resources.getString(R.string.join)
            title = resources.getString(R.string.joinGame)
        }
        val dialogView = layoutInflater.inflate(R.layout.dialog_gamemode, null)
        val dialog = AlertDialog.Builder(this).setView(dialogView).create()
        dialog.show()


        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        dialog.name.visibility = visibility
        dialog.actionBtn.text = action
        dialog.title.text = title

        setupGamemodeSpinner(dialogView)
        setupDifficultySpinner(dialogView)

        dialogView.actionBtn.setOnClickListener {
            val intent: Intent
            if(isCreating) {
                intent = Intent(this, LobbyActivity::class.java)
                intent.putExtra("gameName", getGameName(dialog))
                intent.putExtra("isPrivate", false)
            }
            else
                intent = Intent(this, SearchLobbyActivity::class.java)

            intent.putExtra("gameType", selectedGameType)
            intent.putExtra("difficulty", selectedDifficulty)
            supportFragmentManager.setFragmentResult("activityChange", bundleOf("currentActivity" to "mainmenu"))
            startActivity(intent)
            dialog.dismiss()
        }

        dialogView.cancelButton.setOnClickListener {
            dialog.dismiss()
        }
    }
    private fun getGameName(dialog: AlertDialog):String{
        var gameName = "Partie de ${vm.getUsername()}"
        if(dialog.gameName.text.toString() != ""){
            gameName = dialog.gameName.text.toString()
        }
        return gameName
    }
    private fun setupGamemodeSpinner(dialogView: View){
        val adapterGamemode = ArrayAdapter(this, R.layout.spinner_item, resources.getStringArray(R.array.gamemodes))
        adapterGamemode.setDropDownViewResource(R.layout.spinner_dropdown_item)
        val spinnerGamemode = dialogView.findViewById<Spinner>(R.id.gamemodeSpinner)
        spinnerGamemode.adapter = adapterGamemode

        spinnerGamemode.onItemSelectedListener = object :
                AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>,
                                        view: View, position: Int, id: Long) {
                selectedGameType = GameType.fromFrenchToEnum(adapterGamemode.getItem(position).toString())
            }

            override fun onNothingSelected(parent: AdapterView<*>) {
                // write code to perform some action
            }
        }
    }
    private fun setupDifficultySpinner(dialogView: View){
        val adapterDifficulty = ArrayAdapter(this, R.layout.spinner_item, resources.getStringArray(R.array.difficulty))
        adapterDifficulty.setDropDownViewResource(R.layout.spinner_dropdown_item)
        val spinnerDifficulty = dialogView.findViewById<Spinner>(R.id.difficultySpinner)
        spinnerDifficulty.adapter = adapterDifficulty

        spinnerDifficulty.onItemSelectedListener = object :
                AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>,
                                        view: View, position: Int, id: Long) {
                selectedDifficulty = Difficulty.fromFrenchToEnum(adapterDifficulty.getItem(position).toString())
                }

            override fun onNothingSelected(parent: AdapterView<*>) {
                // write code to perform some action
            }
        }
    }

    override fun onDestroy() {
        vm.disconnect()
        super.onDestroy()
    }

}