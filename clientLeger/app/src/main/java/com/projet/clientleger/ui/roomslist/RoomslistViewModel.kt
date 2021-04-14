package com.projet.clientleger.ui.roomslist

import androidx.core.graphics.rotationMatrix
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.projet.clientleger.data.repository.RoomslistRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import io.reactivex.rxjava3.core.Observable
import javax.inject.Inject

@HiltViewModel
class RoomslistViewModel @Inject constructor(private val roomslistRepository: RoomslistRepository): ViewModel() {
    val rooms: MutableLiveData<ArrayList<String>> = MutableLiveData(ArrayList())

    init {
        roomslistRepository.getRooms().subscribe{ newRooms ->
            rooms.value?.let {
                it.clear()
                it.addAll(newRooms)
            }
            rooms.postValue(rooms.value!!)
        }
    }

    fun joinRoom(roomName: String): Observable<Boolean> {
        return roomslistRepository.joinRooms(roomName)
    }
}