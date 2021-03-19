package com.projet.clientleger.ui.game

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.projet.clientleger.R
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class GameActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_game)
    }
}