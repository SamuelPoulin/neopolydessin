package com.projet.clientleger.data.api.service

import com.google.gson.Gson
import com.projet.clientleger.data.enum.Difficulty
import com.projet.clientleger.data.enum.DrawingSocketEndpoints
import com.projet.clientleger.data.enum.GameType
import com.projet.clientleger.data.model.BrushInfo
import com.projet.clientleger.data.model.Coordinate
import com.projet.clientleger.data.model.StartPoint
import io.reactivex.rxjava3.core.Observable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.decodeFromJsonElement
import kotlinx.serialization.json.encodeToJsonElement
import org.json.JSONArray
import org.json.JSONObject
import javax.inject.Inject

class DrawingSocketService @Inject constructor(val socketService: SocketService){

    fun sendStartPath(coords: Coordinate, brushInfo: BrushInfo){
        socketService.socket.emit(DrawingSocketEndpoints.START_PATH.endpoint,
                Json.encodeToJsonElement(Coordinate.serializer(), coords),
                Json.encodeToJsonElement(BrushInfo.serializer(), brushInfo))
    }

    fun sendUpdatePath(coords: Coordinate){
        val s = Json.encodeToJsonElement(Coordinate.serializer(),coords)
        socketService.socket.emit(DrawingSocketEndpoints.UPDATE_PATH.endpoint, s)
    }

    fun sendEndPath(endCoords: Coordinate){
        socketService.socket.emit(DrawingSocketEndpoints.END_PATH.endpoint, Json.encodeToJsonElement(Coordinate.serializer(), endCoords))
    }

    fun receiveStartPath() : Observable<StartPoint> {
        return socketService.receiveFromSocket(DrawingSocketEndpoints.RECEIVE_START_PATH.endpoint){ res ->
            val coord = Json.decodeFromString(Coordinate.serializer(),res[0].toString())
            val brushInfo = Json.decodeFromString(BrushInfo.serializer(), res[1].toString())
            StartPoint(coord, brushInfo)
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