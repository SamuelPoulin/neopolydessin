package com.projet.clientleger.connexion

import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.ApiRegisterInterface
import com.projet.clientleger.data.api.model.RegisterModel
import com.projet.clientleger.data.api.model.RegisterResponse
import com.projet.clientleger.data.repository.ConnectionRepository
import com.projet.clientleger.data.repository.RegisterRepository
import dagger.hilt.android.testing.HiltAndroidRule
import dagger.hilt.android.testing.HiltAndroidTest
import dagger.hilt.android.testing.HiltTestApplication
import kotlinx.coroutines.runBlocking
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import javax.inject.Inject
import com.projet.clientleger.data.api.ApiConnectionInterface
import com.projet.clientleger.data.api.model.ConnectionModel
import com.projet.clientleger.data.api.service.SocketService

@Config(application = HiltTestApplication::class, sdk = [28])
@RunWith(RobolectricTestRunner::class)
@HiltAndroidTest
class ConnexionRepositoryTest {

    @get:Rule
    val hiltRule = HiltAndroidRule(this)

    @Inject
    lateinit var apiConnectionInterface: ApiConnectionInterface

    @Inject
    lateinit var sessionManager: SessionManager

    private lateinit var connectionRepo: ConnectionRepository

    @Before
    fun setUp(){
        hiltRule.inject()
        connectionRepo = ConnectionRepository(sessionManager,apiConnectionInterface)
    }

    @Test
    fun connectAccount_ServeError(){
        val connectionModel = ConnectionModel(username = "internal_error")
        runBlocking {
            val response = connectionRepo.connectAccount(connectionModel)
            assert(!response.isSucessful)
            assert(response.message.contains("serveur"))
        }
    }

    @Test
    fun connectAccount_NotFound(){
        val connectionModel = ConnectionModel(username = "http_not_found")
        runBlocking {
            val response = connectionRepo.connectAccount(connectionModel)
            assert(!response.isSucessful)
            assert(response.message.contains("invalide"))
        }
    }

    @Test
    fun connectAccount_UnknownError(){
        val connectionModel = ConnectionModel(username = "unknown")
        runBlocking {
            val response = connectionRepo.connectAccount(connectionModel)
            assert(!response.isSucessful)
            assert(response.message.contains("inconnue"))
        }
    }

    @Test
    fun connectAccount_Success(){
        val connectionModel = ConnectionModel(username = "http_ok")
        runBlocking {
            val response = connectionRepo.connectAccount(connectionModel)
            assert(response.isSucessful)
            assert(response.accessToken.isNotEmpty())
            assert(response.refreshToken.isNotEmpty())
        }
    }
}