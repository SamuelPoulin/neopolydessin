package com.projet.clientleger.ui.connexion.view

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.View
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.edit
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import com.projet.clientleger.R
import com.projet.clientleger.data.repository.ConnectionRepository
import com.projet.clientleger.ui.connexion.viewmodel.ConnexionViewModel
import com.projet.clientleger.ui.register.view.RegisterActivity
import com.projet.clientleger.ui.register.viewmodel.RegisterViewModel
import dagger.hilt.android.AndroidEntryPoint
import dagger.hilt.android.HiltAndroidApp
import kotlinx.android.synthetic.main.connexion_activity.*
import kotlinx.android.synthetic.main.fragment_chat.*
import kotlinx.coroutines.launch

@AndroidEntryPoint
class ConnexionActivity : AppCompatActivity() {
    private val vm: ConnexionViewModel by viewModels()
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.connexion_activity)
        setupButtons()
    }


    private fun setupButtons(){
        connectBtn.setOnClickListener {
            connectBtn()
        }
        forgottenPasswordBtn.setOnClickListener{
            forgottenPasswordBtn()
        }
        createAccountBtn.setOnClickListener {
            createAccountBtn()
        }
    }

    private fun connectBtn(){
        println(connectionUsername.text)
        println(connectionPassword.text)

        lifecycleScope.launch {
            val res = vm.connectAccount(connectionUsername.text.toString(),connectionPassword.text.toString())
            if (res.isSucessful) {
                connectionUsername.text.clear()
                connectionPassword.text.clear()
                setUserTokens(res.accessToken, res.refreshToken)
            } else {
                //showToast(res.message)
                println("NE FONCTIONNE PAS")
            }
        }

        //send infos to server
        //await answer
        //if infos good, connect
        //else flag error message
    }
    private fun setUserTokens(accessToken: String, refreshToken: String) {
        getSharedPreferences(
                getString(R.string.user_creds),
                Context.MODE_PRIVATE
        ).edit {
            putString("accessToken", accessToken)
            putString("refreshToken", refreshToken)
            apply()
        }
    }
    private fun forgottenPasswordBtn(){
        println("mot de passe oublié appuyé")

    }
    private fun createAccountBtn(){
        println("créer un compte appuyé")
        val intent = Intent(this, RegisterActivity::class.java)
        startActivity(intent)
    }
}