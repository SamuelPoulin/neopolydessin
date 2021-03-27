package com.projet.clientleger.ui.game

import android.content.Context
import android.graphics.Rect
import android.os.Bundle
import android.util.AttributeSet
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.constraintlayout.widget.ConstraintSet
import androidx.core.os.bundleOf
import androidx.core.view.get
import androidx.fragment.app.setFragmentResult
import com.projet.clientleger.R
import dagger.hilt.android.AndroidEntryPoint
import com.projet.clientleger.databinding.ActivityGameBinding
import com.projet.clientleger.ui.chat.ChatFragment
import kotlin.Exception

@AndroidEntryPoint
class GameActivity : AppCompatActivity() {
    lateinit var binding: ActivityGameBinding
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
    }
}