package com.projet.clientleger.ui.connexion.viewmodel

import androidx.lifecycle.ViewModel

abstract class ConnexionViewModel():ViewModel() {

    abstract fun connect(username: String)

}