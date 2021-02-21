package com.projet.clientleger.ui.accountcreation.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.ViewModel
import com.projet.clientleger.data.api.model.RegisterModel
import com.projet.clientleger.data.repository.RegisterRepository

class RegisterViewModel(): ViewModel() {
    private var registerRepository: RegisterRepository?=null
    var registerAccountLiveData: LiveData<String>?=null

    init {
        registerRepository = RegisterRepository()
    }

    fun registerAccount(registerModel: RegisterModel){
        registerAccountLiveData = registerRepository?.registerAccount(registerModel)
    }
}