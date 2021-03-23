package com.projet.clientleger.ui.game.viewmodel

import androidx.lifecycle.ViewModel
import com.projet.clientleger.data.repository.GameRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

@HiltViewModel
class GameViewModel @Inject constructor(private val gameRepository: GameRepository): ViewModel() {
}