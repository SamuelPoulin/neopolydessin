package com.projet.clientleger.data.repository

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.projet.clientleger.data.api.ApiClient
import com.projet.clientleger.data.api.ApiRegisterInterface
import com.projet.clientleger.data.api.model.RegisterModel
import com.projet.clientleger.data.api.model.RegisterResponseModel
import org.json.JSONArray
import org.json.JSONObject
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class RegisterRepository {

    private var apiRegisterInterface: ApiRegisterInterface?=null

    init {
        apiRegisterInterface = ApiClient.getApiClient().create(ApiRegisterInterface::class.java)
    }

    fun registerAccount(registerModel: RegisterModel): LiveData<RegisterResponseModel>{
        val res = MutableLiveData<RegisterResponseModel>()
        apiRegisterInterface?.registerAccount(registerModel)?.enqueue(object : Callback<String> {

            override fun onFailure(call: Call<String>, t: Throwable) {
                println("fail")
            }

            override fun onResponse(call: Call<String>, response: Response<String>) {
                var bufferRes = ""
                if(!response.isSuccessful){
                    val errorBodyString = response.errorBody()!!.string()
                    try {
                        val errors = (JSONObject(errorBodyString).get("errors") as JSONArray)
                        for(itemNb in 0 until errors.length()){
                            val error = JSONObject(errors[itemNb].toString())
                            bufferRes += "${error.get("param")}: ${error.get("msg")} \r\n"
                        }
                    }catch (e: Exception){
                        println("exception")
                        bufferRes = errorBodyString.replace("\"".toRegex(), "")
                        println(bufferRes)
                    }
                    res.value = RegisterResponseModel(false, bufferRes.trim())
                }
                else{
                    res.value = RegisterResponseModel(true,response.body()!!)
                }
            }
        })
        return res
    }
}