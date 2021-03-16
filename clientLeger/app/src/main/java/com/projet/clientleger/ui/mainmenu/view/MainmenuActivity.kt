package com.projet.clientleger.ui.mainmenu.view

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.os.IBinder
import android.util.DisplayMetrics
import android.view.Menu
import android.view.MenuItem
import android.view.View
import android.view.WindowManager
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.Spinner
import androidx.activity.viewModels
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.edit
import androidx.core.content.res.ResourcesCompat
import androidx.fragment.app.FragmentManager
import androidx.fragment.app.FragmentTransaction
import androidx.fragment.app.commit
import com.projet.clientleger.R
import com.projet.clientleger.data.api.model.GameCreationInfosModel
import com.projet.clientleger.data.api.service.SocketService
import com.projet.clientleger.databinding.ActivityMainmenuBinding
import com.projet.clientleger.ui.chat.ChatFragment
import com.projet.clientleger.ui.friendslist.FriendslistFragment
import com.projet.clientleger.ui.lobby.view.LobbyActivity
import com.projet.clientleger.ui.mainmenu.MainMenuViewModel
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.android.synthetic.main.dialog_gamemode.*
import kotlinx.android.synthetic.main.dialog_gamemode.view.*
import java.io.Serializable
import javax.inject.Inject


@AndroidEntryPoint
class MainmenuActivity : AppCompatActivity() {

    var selectedGameMode:String = "none"
    var selectedDifficulty:String = "none"
    val fragmentManager: FragmentManager = supportFragmentManager
    lateinit var binding: ActivityMainmenuBinding

    val vm: MainMenuViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainmenuBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.activity = this

        binding.toolbar.setOnMenuItemClickListener { item ->
            when (item.itemId) {
                R.id.friendslistBtn -> toggleFriendslist()
            }
            true
        }

        vm.connectSocket(getSharedPreferences(
                getString(R.string.user_creds),
                Context.MODE_PRIVATE
        ).getString("accessToken", "")!!)
    }

    override fun onBackPressed() {
        super.onBackPressed()
    }

    fun toggleFriendslist() {
        binding.friendslistContainer.visibility =
                when (binding.friendslistContainer.visibility) {
                    View.VISIBLE -> View.GONE
                    View.GONE -> View.VISIBLE
                    else -> View.GONE
                }
    }

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
            vm.createGame(selectedGameMode , selectedDifficulty, false)
            var username:String = intent.getStringExtra("username").toString()
            val gameInfo = GameCreationInfosModel(username, selectedGameMode, selectedDifficulty, false)
            val intent = Intent(this,LobbyActivity::class.java).apply{
                putExtra("GAME_INFO",gameInfo as Serializable)
            }
            startActivity(intent)
        }
    }
    private fun setupGamemodeSpinner(dialogView:View){
        val adapterGamemode = ArrayAdapter(this, R.layout.spinner_item, resources.getStringArray(R.array.gamemodes))
        adapterGamemode.setDropDownViewResource(R.layout.spinner_dropdown_item)
        val spinnerGamemode = dialogView.findViewById<Spinner>(R.id.gamemodeSpinner)
        spinnerGamemode.adapter = adapterGamemode

        spinnerGamemode.onItemSelectedListener = object :
                AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>,
                                        view: View, position: Int, id: Long) {
                selectedGameMode = adapterGamemode.getItem(position).toString()
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
                selectedDifficulty = adapterDifficulty.getItem(position).toString()
            }

            override fun onNothingSelected(parent: AdapterView<*>) {
                // write code to perform some action
            }
        }
    }
}