package com.projet.clientleger.ui.accountmanagement.view

import android.graphics.Bitmap
import androidx.lifecycle.ViewModel
import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.model.account.Account
import com.projet.clientleger.data.api.model.account.AccountDashboard
import com.projet.clientleger.data.model.account.UpdateAccountModel
import com.projet.clientleger.data.repository.AccountManagementRepository
import com.projet.clientleger.data.service.AudioService
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

@HiltViewModel
class AccountManagementViewModel @Inject constructor(private val accountManagementRepository: AccountManagementRepository,private val audioService: AudioService, private val sessionManager: SessionManager):ViewModel() {
    lateinit var accountInfos: AccountDashboard
    suspend fun getAccountInfos(){
        accountInfos = accountManagementRepository.getAccountInfos()!!
    }
    suspend fun updateAccountInfos(account:UpdateAccountModel){
        accountManagementRepository.updateAccountInfos(account)
    }
    fun playSound(soundId:Int){
        audioService.playSound(soundId)
    }
    fun getAvatarBitmap():Bitmap{
        return sessionManager.getAccountInfo().avatar
    }
}