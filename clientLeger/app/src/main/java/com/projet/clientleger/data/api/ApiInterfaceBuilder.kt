package com.projet.clientleger.data.api

import retrofit2.Retrofit
import javax.inject.Inject

class ApiInterfaceBuilder @Inject constructor(private val retrofit: Retrofit){

    fun <T> buildInterface(interfaceType: Class<T>): T {
        return retrofit.create(interfaceType)
    }
}