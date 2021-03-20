package com.projet.clientleger.data.api.service

import com.google.gson.Gson
import com.projet.clientleger.data.enum.Difficulty
import com.projet.clientleger.data.enum.DrawingSocketEndpoints
import com.projet.clientleger.data.enum.GameType
import com.projet.clientleger.data.model.BrushInfo
import com.projet.clientleger.data.model.Coordinate
import com.projet.clientleger.data.model.PenPath
import com.projet.clientleger.data.model.StartPoint
import io.reactivex.rxjava3.core.Observable
import kotlinx.serialization.builtins.serializer
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.decodeFromJsonElement
import kotlinx.serialization.json.encodeToJsonElement
import org.json.JSONArray
import org.json.JSONObject
import javax.inject.Inject

class DrawingSocketService @Inject constructor(val socketService: SocketService){

    fun sendStartPath(coords: Coordinate, brushInfo: BrushInfo){
        val coordToSend = JSONObject()
        coordToSend.put("x", coords.x)
        coordToSend.put("y", coords.y)

        val brushInfoJsonObject = JSONObject()
        brushInfoJsonObject.put("color", brushInfo.color)
        brushInfoJsonObject.put("strokeWidth", brushInfo.strokeWidth)

        socketService.socket.emit(DrawingSocketEndpoints.START_PATH.endpoint,
                coordToSend,
                brushInfoJsonObject)
    }

    fun sendUpdatePath(coords: Coordinate){
        val coordJsonObject = JSONObject()
        coordJsonObject.put("x", coords.x)
        coordJsonObject.put("y", coords.y)

        socketService.socket.emit(DrawingSocketEndpoints.UPDATE_PATH.endpoint, coordJsonObject)
    }

    fun sendEndPath(endCoords: Coordinate){
        val coordJsonObject = JSONObject()
        coordJsonObject.put("x", endCoords.x)
        coordJsonObject.put("y", endCoords.y)

        socketService.socket.emit(DrawingSocketEndpoints.END_PATH.endpoint, coordJsonObject)
    }

    fun sendPath(pathId: Int){
        socketService.socket.emit(DrawingSocketEndpoints.SEND_PATH.endpoint, pathId)
    }

    fun sendErasePath(pathId: Int){
        socketService.socket.emit(DrawingSocketEndpoints.SEND_ERASE.endpoint, pathId)
    }

    fun receivePath(): Observable<PenPath> {
        return socketService.receiveFromSocket(DrawingSocketEndpoints.RECEIVE_PATH.endpoint){ (id, coords, brushInfo) ->
            println(id)
            println(coords)
            println(brushInfo)
            PenPath(0, null, BrushInfo("", 0f), ArrayList(), ArrayList())
        }
    }

    fun receiveErasePath(): Observable<Int> {
        return socketService.receiveFromSocket(DrawingSocketEndpoints.RECEIVE_ERASE.endpoint){ (pathId) ->
            println(pathId)
            pathId as Int
        }
    }

    fun receiveStartPath() : Observable<StartPoint> {
        return socketService.receiveFromSocket(DrawingSocketEndpoints.RECEIVE_START_PATH.endpoint){ res ->
            val coord = Json.decodeFromString(Coordinate.serializer(),res[0].toString())
            val brushInfo = Json.decodeFromString(BrushInfo.serializer(), res[1].toString())
            StartPoint(0,coord, brushInfo)
        }
    }

    fun receiveUpdatePath() : Observable<Coordinate>{
        return socketService.receiveFromSocket(DrawingSocketEndpoints.RECEIVE_UPDATE_PATH.endpoint){ res->
            Json.decodeFromString(Coordinate.serializer(), res[0].toString())
        }
    }

    fun receiveEndPath() : Observable<Coordinate>{
        return socketService.receiveFromSocket(DrawingSocketEndpoints.RECEIVE_END_PATH.endpoint){res ->
            Json.decodeFromString(Coordinate.serializer(), res[0].toString())
        }
    }
}