package com.projet.clientleger.ui.connexion.view

import android.content.Intent
import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import com.projet.clientleger.R
import com.projet.clientleger.ui.register.view.RegisterActivity
import kotlinx.android.synthetic.main.connexion_activity.*
import kotlinx.android.synthetic.main.fragment_chat.*

class ConnexionActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.connexion_activity)
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
        //send infos to server
        //await answer
        //if infos good, connect
        //else flag error message
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