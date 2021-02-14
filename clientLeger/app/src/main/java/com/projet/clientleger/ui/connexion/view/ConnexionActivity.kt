package com.projet.clientleger.ui.connexion.view

import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.projet.clientleger.R
import com.projet.clientleger.data.model.GameInfo
import com.projet.clientleger.data.model.MessageChat
import com.projet.clientleger.ui.chat.MessagesAdapter
import kotlinx.android.synthetic.main.fragment_chat.*

class ConnexionActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.connexion_activity)
    }
}