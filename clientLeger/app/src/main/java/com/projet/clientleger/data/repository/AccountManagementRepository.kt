package com.projet.clientleger.data.repository

import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.socket.AccountManagementSocketService
import javax.inject.Inject

public class AccountManagementRepository @Inject constructor(private val accountManagementSocketService: AccountManagementSocketService, private val sessionManager: SessionManager){

}