package com.projet.clientleger.connexion

import com.projet.clientleger.data.repository.ConnectionRepository
import com.projet.clientleger.ui.connexion.viewmodel.ConnexionViewModel
import com.projet.clientleger.ui.register.viewmodel.RegisterViewModel
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
class ConnexionViewModelUnitTest {

    @get:Rule
    val hiltRule = HiltAndroidRule(this)

    @Inject
    lateinit var connectionRepository: ConnectionRepository

    private lateinit var connexionViewModel: ConnexionViewModel

    @Before
    fun setUp(){
        hiltRule.inject()
        connexionViewModel = ConnexionViewModel(connectionRepository)
    }

    @Test
    fun connectAccount_returnsResponse(){
        runBlocking {
            val res = connexionViewModel.connectAccount("", "")
            assert(res.message.isNotEmpty() || res.accessToken.isNotEmpty())
        }
    }
}