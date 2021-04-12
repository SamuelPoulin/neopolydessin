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

    fun playSound(soundId:Int){
        soundPool?.play(soundId,1F,1F,0,0,1F)
    }
    fun setupAudio(context: Context){
        soundPool = SoundPool(6, AudioManager.STREAM_MUSIC,0)
        soundPool!!.load(context, R.raw.connected,1)
        soundPool!!.load(context,R.raw.correct,1)
        soundPool!!.load(context,R.raw.error,1)
        soundPool!!.load(context,R.raw.selected,1)
        soundPool!!.load(context,R.raw.click,1)
        soundPool!!.load(context,R.raw.open_chat,1)
        soundPool!!.load(context,R.raw.close_chat,1)
        soundPool!!.load(context,R.raw.tick_timer,1)
        soundPool!!.load(context,R.raw.boardwipe,1)
        soundPool!!.load(context,R.raw.close_game,1)
        soundPool!!.load(context,R.raw.start_game,1)
        soundPool!!.load(context,R.raw.confirm,1)
    }
}