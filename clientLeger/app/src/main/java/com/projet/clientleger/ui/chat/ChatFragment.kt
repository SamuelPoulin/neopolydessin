package com.projet.clientleger.ui.chat

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment
import com.projet.clientleger.R
import com.projet.clientleger.data.api.service.SocketService
import kotlinx.android.synthetic.main.fragment_chat.*
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

//import java.time.LocalDateTime
//import java.time.format.DateTimeFormatter

// TODO: Rename parameter arguments, choose names that match
// the fragment initialization parameters, e.g. ARG_ITEM_NUMBER
private const val ARG_PARAM1 = "param1"
private const val ARG_PARAM2 = "param2"

/**
 * A simple [Fragment] subclass.
 * Use the [chat.newInstance] factory method to
 * create an instance of this fragment.
 */
class ChatFragment : Fragment() {
    // TODO: Rename and change types of parameters
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        arguments?.let {
        }
        activity?.startService(Intent(activity, SocketService::class.java))
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?,
                              savedInstanceState: Bundle?): View? {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_chat, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        sendButton.setOnClickListener(){
            sendButton()
        }
    }
    private fun sendButton(){
        val text:String = (chatBox.text).toString()
        val adjustedText:String = text.replace("(?m)^[ \t]*\r?\n".toRegex(), "")
        val timestamp = getTimestamp()
        addMessage(adjustedText, timestamp)
        chatBox.text.clear()

        //envoyer le message à la db
        //ajoute le message à la boite de chat locale
    }
    private fun getTimestamp():String{
        val formatter: DateTimeFormatter = DateTimeFormatter.ofPattern("HH:mm")
        return LocalDateTime.now().format(formatter)
    }
    private fun addMessage(text:String, timestamp:String){
        if(text.isNotBlank()){
            val formattedText:String = ("[$timestamp] $text")
            val messageView:TextView = TextView(activity)
            messageView.textSize = 20f
            messageView.text = formattedText
            messageBox.addView(messageView)
            scrollbar.post{
                scrollbar.fullScroll(View.FOCUS_DOWN)
            }
        }
    }
    companion object {
        /**
         * Use this factory method to create a new instance of
         * this fragment using the provided parameters.
         *
         * @param param1 Parameter 1.
         * @param param2 Parameter 2.
         * @return A new instance of fragment chat.
         */
        // TODO: Rename and change types and number of parameters
        @JvmStatic
        fun newInstance() =
                ChatFragment().apply {
                    arguments = Bundle().apply {
                    }
                }
    }
}