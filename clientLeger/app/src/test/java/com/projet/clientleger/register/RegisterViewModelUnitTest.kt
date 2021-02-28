package com.projet.clientleger.register

import com.projet.clientleger.data.repository.RegisterRepository
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
class RegisterViewModelUnitTest {

    @get:Rule
    val hiltRule = HiltAndroidRule(this)

    @Inject
    lateinit var registerRepository: RegisterRepository

    private lateinit var registerViewmodel: RegisterViewModel

    @Before fun setUp(){
        hiltRule.inject()
        registerViewmodel = RegisterViewModel(registerRepository)
    }


    @Test
    fun registerAccount(){
        runBlocking { assert(registerViewmodel.registerAccount().isSucessful)}
    }

    @Test
    fun isInvalidEmail_isInvalidEmpty(){
        registerViewmodel.registerEmailLiveData.value = ""
        assert(registerViewmodel.isInvalidEmail())
    }

    @Test
    fun isInvalidEmail_isInvalidNoContentBeforeAt(){
        registerViewmodel.registerEmailLiveData.value = "@a.com"
        assert(registerViewmodel.isInvalidEmail())
    }

    @Test
    fun isInvalidEmail_isValid(){
        registerViewmodel.registerEmailLiveData.value = "s@a.com"
        assert(!registerViewmodel.isInvalidEmail())
    }

    @Test
    fun isDifferentPasswords_isDifferent(){
        registerViewmodel.registerPasswordLiveData.value = "s"
        registerViewmodel.registerPasswordConfirmLiveData.value = "a"
        assert(registerViewmodel.isDifferentPasswords())
    }

    @Test
    fun isDifferentPasswords_isSame(){
        registerViewmodel.registerPasswordLiveData.value = "s"
        registerViewmodel.registerPasswordConfirmLiveData.value = "s"
        assert(!registerViewmodel.isDifferentPasswords())
    }

    @Test
    fun passwordContainsNoDigit_noDigit(){
        registerViewmodel.registerPasswordLiveData.value = "s"
        assert(registerViewmodel.passwordContainsNoDigit())
    }

    @Test
    fun passwordContainsNoDigit_digit(){
        registerViewmodel.registerPasswordLiveData.value = "s1"
        assert(!registerViewmodel.passwordContainsNoDigit())
    }

    @Test
    fun passwordIsNotMinLength_notMinLength(){
        registerViewmodel.registerPasswordLiveData.value = "s"
        assert(registerViewmodel.passwordIsNotMinLength())
    }

    @Test
    fun passwordIsNotMinLength_isMinLength(){
        registerViewmodel.registerPasswordLiveData.value = "ssssssss"
        assert(!registerViewmodel.passwordIsNotMinLength())
    }

    @Test
    fun clearForm(){
        registerViewmodel.registerFistNameLiveData.value = "s"
        registerViewmodel.registerLastNameLiveData.value = "s"
        registerViewmodel.registerUsernameLiveData.value = "s"
        registerViewmodel.registerEmailLiveData.value = "s"
        registerViewmodel.registerPasswordLiveData.value = "s"
        registerViewmodel.registerPasswordConfirmLiveData.value = "s"
        registerViewmodel.clearForm()
        assert(registerViewmodel.registerFistNameLiveData.value!!.isEmpty()
                && registerViewmodel.registerLastNameLiveData.value!!.isEmpty()
                && registerViewmodel.registerUsernameLiveData.value!!.isEmpty()
                && registerViewmodel.registerEmailLiveData.value!!.isEmpty()
                && registerViewmodel.registerPasswordLiveData.value!!.isEmpty()
                && registerViewmodel.registerPasswordConfirmLiveData.value!!.isEmpty())
    }

    @Test
    fun clearPasswords_doesntClearRest(){
        registerViewmodel.registerPasswordLiveData.value = "das"
        registerViewmodel.registerPasswordConfirmLiveData.value = "das"
        registerViewmodel.registerFistNameLiveData.value = "s"
        registerViewmodel.registerLastNameLiveData.value = "s"
        registerViewmodel.registerUsernameLiveData.value = "s"
        registerViewmodel.registerEmailLiveData.value = "s"
        registerViewmodel.clearPasswords()
        assert(registerViewmodel.registerPasswordLiveData.value!!.isEmpty()
                && registerViewmodel.registerPasswordConfirmLiveData.value!!.isEmpty()
                && registerViewmodel.registerFistNameLiveData.value!!.isNotEmpty()
                && registerViewmodel.registerLastNameLiveData.value!!.isNotEmpty()
                && registerViewmodel.registerUsernameLiveData.value!!.isNotEmpty()
                && registerViewmodel.registerEmailLiveData.value!!.isNotEmpty())
    }

    @Test
    fun isValidFilled_isValid(){
        registerViewmodel.registerFistNameLiveData.value = "gui"
        registerViewmodel.registerLastNameLiveData.value = "boy"
        registerViewmodel.registerUsernameLiveData.value = "guiboy"
        registerViewmodel.registerEmailLiveData.value = "g@c.com"
        registerViewmodel.registerPasswordLiveData.value = "sssssss1"
        registerViewmodel.registerPasswordConfirmLiveData.value = "sssssss1"

        assert(registerViewmodel.isValidFilled())
    }

    @Test
    fun isValidFilled_emptyFirstName(){
        registerViewmodel.registerFistNameLiveData.value = ""
        registerViewmodel.registerLastNameLiveData.value = "boy"
        registerViewmodel.registerUsernameLiveData.value = "guiboy"
        registerViewmodel.registerEmailLiveData.value = "g@c.com"
        registerViewmodel.registerPasswordLiveData.value = "sssssss1"
        registerViewmodel.registerPasswordConfirmLiveData.value = "sssssss1"

        assert(!registerViewmodel.isValidFilled())
    }

    @Test
    fun isValidFilled_emptyLastName(){
        registerViewmodel.registerFistNameLiveData.value = "gui"
        registerViewmodel.registerLastNameLiveData.value = ""
        registerViewmodel.registerUsernameLiveData.value = "guiboy"
        registerViewmodel.registerEmailLiveData.value = "g@c.com"
        registerViewmodel.registerPasswordLiveData.value = "sssssss1"
        registerViewmodel.registerPasswordConfirmLiveData.value = "sssssss1"

        assert(!registerViewmodel.isValidFilled())
    }


    @Test
    fun isValidFilled_emptyUsername(){
        registerViewmodel.registerFistNameLiveData.value = "gui"
        registerViewmodel.registerLastNameLiveData.value = "boy"
        registerViewmodel.registerUsernameLiveData.value = ""
        registerViewmodel.registerEmailLiveData.value = "g@c.com"
        registerViewmodel.registerPasswordLiveData.value = "sssssss1"
        registerViewmodel.registerPasswordConfirmLiveData.value = "sssssss1"

        assert(!registerViewmodel.isValidFilled())
    }

    @Test
    fun isValidFilled_emptyPassword(){
        registerViewmodel.registerFistNameLiveData.value = "gui"
        registerViewmodel.registerLastNameLiveData.value = "boy"
        registerViewmodel.registerUsernameLiveData.value = "guiboy"
        registerViewmodel.registerEmailLiveData.value = "g@c.com"
        registerViewmodel.registerPasswordLiveData.value = ""
        registerViewmodel.registerPasswordConfirmLiveData.value = "sssssss1"

        assert(!registerViewmodel.isValidFilled())
    }

    @Test
    fun isValidFilled_emptyPasswordConfirm(){
        registerViewmodel.registerFistNameLiveData.value = "gui"
        registerViewmodel.registerLastNameLiveData.value = "boy"
        registerViewmodel.registerUsernameLiveData.value = "guiboy"
        registerViewmodel.registerEmailLiveData.value = "g@c.com"
        registerViewmodel.registerPasswordLiveData.value = "sssssss1"
        registerViewmodel.registerPasswordConfirmLiveData.value = ""

        assert(!registerViewmodel.isValidFilled())
    }
}