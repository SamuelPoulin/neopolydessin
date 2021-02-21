package com.projet.clientleger.data.repository

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.projet.clientleger.data.api.ApiClient
import com.projet.clientleger.data.api.ApiRegisterInterface
import com.projet.clientleger.data.api.model.RegisterModel
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

    fun registerAccount(registerModel: RegisterModel): LiveData<String>{
        val res = MutableLiveData<String>()
        println(registerModel.toString())
        apiRegisterInterface?.registerAccount(registerModel)?.enqueue(object : Callback<Any> {

            override fun onFailure(call: Call<Any>, t: Throwable) {
                TODO("Not yet implemented")
                println("fail")
            }

            override fun onResponse(call: Call<Any>, response: Response<Any>) {
                var bufferRes = ""
                if(!response.isSuccessful){
                    val errors = (JSONObject(response.errorBody()!!.string()).get("errors") as JSONArray)
                    for(itemNb in 0 until errors.length()){
                        val error = JSONObject(errors[itemNb].toString())
                        bufferRes += "${error.get("param")}: ${error.get("msg")} \r\n"
                    }
                }
                bufferRes = bufferRes.trim()
                res.value = bufferRes
            }
        })
        return res
    }
}