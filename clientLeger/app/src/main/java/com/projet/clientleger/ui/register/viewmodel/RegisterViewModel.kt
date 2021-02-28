package com.projet.clientleger.ui.register.viewmodel

import android.util.Patterns
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.projet.clientleger.data.api.model.RegisterModel
import com.projet.clientleger.data.api.model.RegisterResponse
import com.projet.clientleger.data.repository.RegisterRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

@HiltViewModel
class RegisterViewModel @Inject constructor(private val registerRepository: RegisterRepository) :
        ViewModel() {
    val registerFistNameLiveData: MutableLiveData<String> = MutableLiveData("")
    val registerLastNameLiveData: MutableLiveData<String> = MutableLiveData("")
    val registerUsernameLiveData: MutableLiveData<String> = MutableLiveData("")
    val registerEmailLiveData: MutableLiveData<String> = MutableLiveData("")
    val registerPasswordLiveData: MutableLiveData<String> = MutableLiveData("")
    val registerPasswordConfirmLiveData: MutableLiveData<String> = MutableLiveData("")

    suspend fun registerAccount(): RegisterResponse {
        val register = RegisterModel(
                registerFistNameLiveData.value?.trim(),
                registerLastNameLiveData.value?.trim(),
                registerUsernameLiveData.value?.trim(),
                registerEmailLiveData.value?.trim(),
                registerPasswordLiveData.value?.trim(),
                registerPasswordConfirmLiveData.value?.trim()
        )
        return registerRepository.registerAccount(register)
    }

    fun isInvalidEmail(): Boolean {
        return registerEmailLiveData.value!!.isEmpty() || !Patterns.EMAIL_ADDRESS.matcher(
                registerEmailLiveData.value!!
        ).matches()
    }


    fun isDifferentPasswords(): Boolean {
        return !registerPasswordLiveData.value.equals(registerPasswordConfirmLiveData.value)
    }

    fun passwordContainsNoDigit(): Boolean {
        return !registerPasswordLiveData.value!!.contains(".*\\d.*".toRegex())
    }

    fun passwordIsNotMinLength(): Boolean {
        return registerPasswordLiveData.value!!.length < 8
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
                || passwordContainsNoDigit()
                || passwordIsNotMinLength())
    }
}