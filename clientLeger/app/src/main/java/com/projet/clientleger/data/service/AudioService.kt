package com.projet.clientleger.data.service

import android.content.Context
import android.media.AudioManager
import android.media.SoundPool
import com.projet.clientleger.R
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AudioService @Inject constructor(){
    private var soundPool: SoundPool? = null
    private val soundId = 1

    fun playSound(){
        soundPool?.play(soundId,1F,1F,0,0,1F)
    }
    fun setupAudio(context: Context){
        soundPool = SoundPool(6, AudioManager.STREAM_MUSIC,0)
        soundPool!!.load(context, R.raw.connected,1)
    }
}