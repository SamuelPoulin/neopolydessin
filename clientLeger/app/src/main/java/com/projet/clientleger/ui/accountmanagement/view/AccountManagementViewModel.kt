package com.projet.clientleger.ui.accountmanagement.view

import androidx.lifecycle.ViewModel
import com.projet.clientleger.data.repository.AccountManagementRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

@HiltViewModel
class AccountManagementViewModel @Inject constructor(private val accountManagementRepository: AccountManagementRepository):ViewModel() {
}