package com.projet.clientleger.ui.accountcreation.viewmodel

import android.util.Patterns
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.projet.clientleger.data.api.model.RegisterModel
import com.projet.clientleger.data.api.model.RegisterResponseModel
import com.projet.clientleger.data.repository.RegisterRepository

class RegisterViewModel() : ViewModel() {
    private var registerRepository: RegisterRepository? = null
    var registerAccountLiveData: LiveData<RegisterResponseModel>? = null

    val registerFistNameLiveData: MutableLiveData<String> = MutableLiveData("")
    val registerLastNameLiveData: MutableLiveData<String> = MutableLiveData("")
    val registerUsernameLiveData: MutableLiveData<String> = MutableLiveData("")
    val registerEmailLiveData: MutableLiveData<String> = MutableLiveData("")
    val registerPasswordLiveData: MutableLiveData<String> = MutableLiveData("")
    val registerPasswordConfirmLiveData: MutableLiveData<String> = MutableLiveData("")

    init {
        registerRepository = RegisterRepository()
    }

    fun registerAccount() {
        val name = "${registerFistNameLiveData.value?.trim()} ${registerLastNameLiveData.value?.trim()}"
        val register = RegisterModel(name, registerUsernameLiveData.value?.trim(),
                registerEmailLiveData.value?.trim(), registerPasswordLiveData.value?.trim(), registerPasswordConfirmLiveData.value?.trim())
        registerAccountLiveData = registerRepository?.registerAccount(register)
    }

    fun isInvalidEmail(): Boolean {
        return registerEmailLiveData.value!!.isNotEmpty() && !Patterns.EMAIL_ADDRESS.matcher(registerEmailLiveData.value!!).matches()
    }

    fun isInvalidPassword(): Boolean {
        return registerPasswordLiveData.value!!.isNotEmpty() && registerPasswordLiveData.value!!.length < 6
    }

    fun isInvalidPasswordConfirm(): Boolean {
        return registerPasswordConfirmLiveData.value!!.isNotEmpty() && registerPasswordConfirmLiveData.value!!.length < 6
    }

    fun clearForm() {
        registerFistNameLiveData.value = ""
        registerLastNameLiveData.value = ""
        registerUsernameLiveData.value = ""
        registerEmailLiveData.value = ""
        registerPasswordLiveData.value = ""
        registerPasswordConfirmLiveData.value = ""
    }

    fun clearPasswords() {
        registerPasswordLiveData.value = ""
        registerPasswordConfirmLiveData.value = ""
    }

    fun isValidFilled(): Boolean {
        return !(registerFistNameLiveData.value!!.isEmpty()
                || registerLastNameLiveData.value!!.isEmpty()
                || registerUsernameLiveData.value!!.isEmpty()
                || registerEmailLiveData.value!!.isEmpty()
                || registerPasswordLiveData.value!!.isEmpty()
                || registerPasswordConfirmLiveData.value!!.isEmpty())
                && !(isInvalidEmail()
                || isInvalidPassword()
                || isInvalidPasswordConfirm())
    }

}