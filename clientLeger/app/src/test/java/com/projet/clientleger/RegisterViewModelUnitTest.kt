package com.projet.clientleger

import androidx.arch.core.executor.testing.InstantTaskExecutorRule
import com.projet.clientleger.data.api.ApiRegisterInterface
import com.projet.clientleger.data.repository.RegisterRepository
import com.projet.clientleger.ui.accountcreation.viewmodel.RegisterViewModel
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.runners.MockitoJUnitRunner

@RunWith(MockitoJUnitRunner::class)
class RegisterViewModelUnitTest {

    @get:Rule
    val instantTaskExecutorRule = InstantTaskExecutorRule()

    @Mock
    lateinit var apiRegisterInterface: ApiRegisterInterface

    @InjectMocks
    lateinit var registerRepo: RegisterRepository

    lateinit var registerViewmodel: RegisterViewModel

    @Before fun setUp(){
        registerViewmodel = RegisterViewModel(registerRepo)
    }

    @Test
    fun isInvalidEmail_isInvalid(){
        registerViewmodel.registerEmailLiveData.value = ""
        assert(!registerViewmodel.isInvalidEmail())
    }
}