package com.projet.clientleger.data.api

import okhttp3.Interceptor
import okhttp3.Response
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TokenInterceptor @Inject constructor(): Interceptor {
    private var accessToken = ""

    fun setAccessToken(token: String){
        accessToken = token
    }

    fun clearToken(){
        accessToken = ""
    }

    override fun intercept(chain: Interceptor.Chain): Response {
        val requestBuilder = chain.request().newBuilder()
        if(accessToken.isNotEmpty()){
            requestBuilder.addHeader("authorization", accessToken)
        }
        return chain.proceed(requestBuilder.build())
    }
}