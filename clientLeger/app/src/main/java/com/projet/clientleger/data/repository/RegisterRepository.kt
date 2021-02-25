package com.projet.clientleger.data.repository

import com.projet.clientleger.data.api.ApiRegisterInterface
import com.projet.clientleger.data.api.model.RegisterModel
import com.projet.clientleger.data.api.model.RegisterResponse
import javax.inject.Inject
import javax.net.ssl.HttpsURLConnection

class RegisterRepository @Inject constructor(private val apiRegisterInterface: ApiRegisterInterface) {

    suspend fun registerAccount(registerModel: RegisterModel): RegisterResponse {
        val res = apiRegisterInterface.registerAccount(registerModel)
        return when (res.code()) {

            HttpsURLConnection.HTTP_INTERNAL_ERROR -> RegisterResponse(
                false,
                "Erreur du serveur",
                "",
                ""
            )

            HttpsURLConnection.HTTP_BAD_REQUEST -> RegisterResponse(
                false,
                "Nom d'utilisateur ou adresse courielle déjà utilisé",
                "",
                ""
            )
            HttpsURLConnection.HTTP_OK -> RegisterResponse(
                true,
                "",
                res.body()!!.accessToken,
                res.body()!!.accessToken
            )
            else -> RegisterResponse(false, "Erreur inconnue", "", "")

        }
    }
    //                        try {
//                                val errors =
//                                        (JSONObject(errorBodyString).get("errors") as JSONArray)
//                                for (itemNb in 0 until errors.length()) {
//                                        val error = JSONObject(errors[itemNb].toString())
//                                        bufferRes += "${error.get("param")}: ${error.get("msg")} \r\n"
//                                }
//                        } catch (e: Exception) {
//                                println("exception")
//                                bufferRes = errorBodyString.replace("\"".toRegex(), "")
//                                println(bufferRes)
//                        }
//                        res.value = RegisterResponseModel(false, bufferRes.trim())
}
//    : LiveData<RegisterResponseModel>{
//        val res = MutableLiveData<RegisterResponseModel>()
//        apiRegisterInterface.registerAccount(registerModel).enqueue(object : Callback<String> {
//
//            override fun onFailure(call: Call<String>, t: Throwable) {
//                println("fail")
//            }
//
//            override fun onResponse(call: Call<String>, response: Response<String>) {
//                var bufferRes = ""
//                if(!response.isSuccessful){
//                    val errorBodyString = response.errorBody()!!.string()
//                    try {
//                        val errors = (JSONObject(errorBodyString).get("errors") as JSONArray)
//                        for(itemNb in 0 until errors.length()){
//                            val error = JSONObject(errors[itemNb].toString())
//                            bufferRes += "${error.get("param")}: ${error.get("msg")} \r\n"
//                        }
//                    }catch (e: Exception){
//                        println("exception")
//                        bufferRes = errorBodyString.replace("\"".toRegex(), "")
//                        println(bufferRes)
//                    }
//                    res.value = RegisterResponseModel(false, bufferRes.trim())
//                } else{
//                    res.value = RegisterResponseModel(true,response.body()!!)
//                }
//            }
//        })
//        return res
//    }