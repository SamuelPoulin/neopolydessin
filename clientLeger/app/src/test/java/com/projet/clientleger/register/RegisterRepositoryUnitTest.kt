package com.projet.clientleger.register


import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.http.ApiRegisterInterface
import com.projet.clientleger.data.api.model.RegisterModel
import com.projet.clientleger.data.api.model.RegisterResponse
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

@Config(application = HiltTestApplication::class, sdk = [28])
@RunWith(RobolectricTestRunner::class)
@HiltAndroidTest
class RegisterRepositoryUnitTest {

    @get:Rule
    val hiltRule = HiltAndroidRule(this)

    @Inject
    lateinit var apiRegisterInterface: ApiRegisterInterface

    @Inject
    lateinit var sessionManager:SessionManager

    private lateinit var registerRepo: RegisterRepository

    @Before
    fun setUp(){
        hiltRule.inject()
        registerRepo = RegisterRepository(sessionManager ,apiRegisterInterface)
    }

    @Test
    fun registerAccount_errorServer(){
        val registerModel = RegisterModel(username = "error_server")
        runBlocking { assert(!registerRepo.registerAccount(registerModel).isSucessful) }
    }

    @Test
    fun registerAccount_errorRequest(){
        val registerModel = RegisterModel(username = "invalid")
        runBlocking { assert(!registerRepo.registerAccount(registerModel).isSucessful) }
    }

    @Test
    fun registerAccount_unknownError(){
        val registerModel = RegisterModel(username = "unknown")
        runBlocking { assert(!registerRepo.registerAccount(registerModel).isSucessful) }
    }

    @Test
    fun registerAccount_success(){
        val registerModel = RegisterModel()
        var response: RegisterResponse
        runBlocking { response = registerRepo.registerAccount(registerModel) }
        assert(response.isSucessful && response.accessToken.isNotEmpty() && response.refreshToken.isNotEmpty())
    }
}