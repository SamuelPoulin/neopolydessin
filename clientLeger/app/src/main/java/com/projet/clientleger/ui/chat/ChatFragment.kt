package com.projet.clientleger.ui.chat

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.graphics.Color
import android.os.Bundle
import android.os.IBinder
import android.text.Html
import android.util.DisplayMetrics
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.core.os.bundleOf
import androidx.fragment.app.Fragment
import androidx.fragment.app.setFragmentResult
import androidx.fragment.app.setFragmentResultListener
import androidx.fragment.app.viewModels
import androidx.recyclerview.widget.LinearLayoutManager
import com.projet.clientleger.R
import com.projet.clientleger.data.enumData.TabType
import com.projet.clientleger.data.model.FriendSimplified
import com.projet.clientleger.data.model.chat.TabInfo
import com.projet.clientleger.data.service.ChatStorageService
import dagger.hilt.android.AndroidEntryPoint
import java.util.regex.Pattern
import javax.inject.Inject
import com.projet.clientleger.databinding.FragmentChatBinding

private const val MESSAGE_CONTENT_ERROR: String =
    "Le message ne doit pas être vide et ne doit pas dépasser 200 caractères"

@AndroidEntryPoint
class ChatFragment @Inject constructor() : Fragment() {

    val vm: ChatViewModel by viewModels()
    private var binding: FragmentChatBinding? = null
    var baseHeight: Int = -1
    var screenSize: Int = -1
    var baseWidth: Int = -1
    private var chatService: ChatStorageService? = null

    private val chatConnection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            chatService = (service as ChatStorageService.LocalBinder).getService()
            (binding?.rvTabs?.adapter as TabAdapter).clickCallback = chatService!!::removeConvo
            setupChatServiceSubscriptions()
        }

        override fun onServiceDisconnected(name: ComponentName?) {
            chatService = null
        }
    }

    companion object {
        fun newInstance() = ChatFragment()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val displayMetrics = DisplayMetrics()
        requireActivity().windowManager.defaultDisplay.getMetrics(displayMetrics)
        screenSize = displayMetrics.widthPixels
        baseWidth = screenSize/2

        vm.isGuessing.observe(requireActivity()){
            updateTheme(it)
        }
        vm.isGuesser.observe(requireActivity()){
            updateGuessingBtnVisibility(it)
        }
        setupFragmentListeners()
        setupTabsObservers()
    }

    override fun onStart() {
        super.onStart()

        Intent(requireContext(), ChatStorageService::class.java).also { intent ->
            activity?.bindService(intent, chatConnection, Context.BIND_IMPORTANT)
        }
    }

    override fun onStop() {
        super.onStop()
        activity?.unbindService(chatConnection)
        chatService = null
    }

    override fun onResume() {
        super.onResume()
        chatService?.let {
            vm.fetchSavedData(it.convos, it.currentConvo)
        }
    }

    private fun toggleVisibilityChat(){
        binding?.let { mBinding ->
            val newVisibility = when(mBinding.chatSendBox.visibility){
                View.VISIBLE -> View.GONE
                else -> View.VISIBLE
            }
            mBinding.rvTabs.visibility = newVisibility
            mBinding.messageContainer.visibility = newVisibility
            mBinding.chatSendBox.visibility = newVisibility

            when(newVisibility) {
                View.VISIBLE ->{
                    mBinding.root.setBackgroundResource(R.drawable.chat_background)
                    mBinding.hideIcon.setImageDrawable(ContextCompat.getDrawable(requireContext(), R.drawable.ic_hide_chat))
                    mBinding.headerSpaceBuffer.visibility = View.GONE
                }
                else -> {
                    mBinding.root.setBackgroundColor(Color.TRANSPARENT)
                    mBinding.hideIcon.setImageDrawable(ContextCompat.getDrawable(requireContext(), R.drawable.ic_open_chat))
                    mBinding.headerSpaceBuffer.visibility = View.VISIBLE
                }
            }
        }
    }

    private fun resize(height: Int){
        if(baseHeight < 0)
            baseHeight = binding!!.root.height
        if(height > 0 && baseHeight == binding!!.root.layoutParams.height) {
            val params = binding!!.root.layoutParams
            params.height = baseHeight - height
            binding?.let {
                it.root.requestLayout()
                it.rvMessages.adapter?.notifyDataSetChanged()
                it.rvMessages.scrollToPosition(vm.messagesLiveData.value!!.size - 1)
            }

        } else if(height < 0 && binding!!.root.layoutParams.height != baseHeight){
            val params = binding!!.root.layoutParams
            params.height = baseHeight
            binding?.let {
                it.root.requestLayout()
                it.rvMessages.adapter?.notifyDataSetChanged()
                it.rvMessages.scrollToPosition(vm.messagesLiveData.value!!.size - 1)
            }
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        binding = FragmentChatBinding.inflate(inflater, container, false)

        binding!!.sendButton.setOnClickListener { sendMessage() }
        binding!!.guessingToggleBtn.setOnClickListener { toggleSendMode() }

        binding!!.vm = vm
        return binding!!.root
    }


    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupRvMessages()

        setupMessagesObserver()

        setupClickListeners()
        binding?.let {
            val manager = LinearLayoutManager(activity)
            manager.orientation = LinearLayoutManager.HORIZONTAL
            it.rvTabs.layoutManager = manager
            it.rvTabs.adapter = TabAdapter(vm.convos.value!!)
        }
    }

    private fun setupClickListeners(){
        binding?.let { mBinding ->
            mBinding.toggleFriendslistBtn.setOnClickListener {
                setFragmentResult("toggleVisibility", Bundle())
            }
            mBinding.iconsHeader.setOnClickListener {
                toggleVisibilityChat()
            }
        }
    }

    private fun setupFragmentListeners(){
        setFragmentResultListener("isGuessing"){ requestKey, bundle ->
            vm.isGuesser.postValue(bundle["boolean"] as Boolean)
            vm.isGuessing.postValue(bundle["boolean"] as Boolean)
        }
        setFragmentResultListener("keyboardEvent"){ requestKey, bundle ->
            resize(bundle["height"] as Int)
        }
        setFragmentResultListener("openFriendChat"){ requestKey, bundle ->
            val friend = (bundle["friend"] as FriendSimplified)
            chatService?.addNewConvo(TabInfo(friend.username, friend.friendId, TabType.FRIEND), true)
        }

        setFragmentResultListener("openGameChat"){requestKey, bundle ->
            val tabName = (bundle["tabName"] as String)
            chatService?.addNewConvo(TabInfo(tabName, ChatViewModel.GAME_TAB_ID), true)
        }
        setFragmentResultListener("closeGameChat"){requestKey, bundle ->
            val tabName = (bundle["tabName"] as String)
            chatService?.removeConvo(ChatViewModel.GAME_TAB_ID)
        }
        setFragmentResultListener("activityChange"){requestKey, bundle ->
            vm.clear()
        }
    }

    private fun setupChatServiceSubscriptions(){
        chatService?.let { service ->
            service.subscribeConvosChange(vm::updateConvos)
            service.subscribeCurrentConvoChange(vm::updateCurrentConvo)
            service.subscribeCurrentTabChange(vm::changeCurrentTab)
        }
    }

    private fun setupTabsObservers(){
        vm.convos.observe(requireActivity()){ convos ->
            binding?.let { mBinding ->
                mBinding.rvTabs.adapter?.notifyDataSetChanged()
                var scrollIndex = convos.indexOfFirst { it.tabInfo.convoId == vm.currentConvo.value!!.tabInfo.convoId }
                if(scrollIndex < 0)
                    scrollIndex = 0
                mBinding.rvTabs.scrollToPosition(scrollIndex)
            }
        }
        vm.currentConvo.observe(requireActivity()){
            binding?.let { mBinding ->
                (mBinding.rvTabs.adapter as TabAdapter?)?.setSelectedTabIndex(it.tabInfo)
            }
        }
    }

    private fun setupMessagesObserver(){
        vm.messagesLiveData.observe(requireActivity()){
            binding?.let { mBinding ->
                if(it.isEmpty()) {
                    mBinding.noMessagesView.visibility = View.VISIBLE
                    mBinding.rvMessages.visibility = View.GONE
                } else {
                    mBinding.noMessagesView.visibility = View.GONE
                    mBinding.rvMessages.visibility = View.VISIBLE
                }
                mBinding.rvMessages.adapter?.notifyDataSetChanged()
                mBinding.rvMessages.scrollToPosition(it.size - 1)
            }
        }
    }

    private fun setupRvMessages(){
        val mLinearLayoutManager = LinearLayoutManager(activity)
        mLinearLayoutManager.stackFromEnd = true
        binding!!.rvMessages.layoutManager = mLinearLayoutManager
        binding!!.rvMessages.adapter = MessagesAdapter(vm.messagesLiveData.value!!, vm.accountInfo.username)
    }

    private fun sendMessage() {
        vm.sendMessage()

        //TODO show loading message

        binding?.chatBox?.text?.clear()
    }
    private fun isMessageValidFormat(message: String): Boolean {
        return Pattern.matches(".*\\S.*", message) && message.length <= 200 && message.isNotEmpty()
    }

    private fun toggleSendMode(){
        vm.isGuessing.postValue(!vm.isGuessing.value!!)
    }

    private fun updateTheme(isGuessing: Boolean){
        if(isGuessing){
            binding!!.chatSendBox.background = ContextCompat.getDrawable(requireContext(), R.drawable.chat_guessing_input_background)
            binding!!.guessingToggleBtn.background = ContextCompat.getDrawable(requireContext(), R.drawable.ic_lightbulb_white)
            binding!!.sendButton.background = ContextCompat.getDrawable(requireContext(), R.drawable.ic_sent)
        } else{
            binding!!.chatSendBox.background = ContextCompat.getDrawable(requireContext(), R.drawable.chat_input_background)
            binding!!.guessingToggleBtn.background = ContextCompat.getDrawable(requireContext(), R.drawable.ic_lightbulb)
            binding!!.sendButton.background = ContextCompat.getDrawable(requireContext(), R.drawable.ic_baseline_send_24)
        }
    }

    private fun showErrorToast(errorMessage: String) {
        activity?.runOnUiThread {
            Toast.makeText(
                activity,
                Html.fromHtml(
                    "<font color='#e61515'><b>${errorMessage}</b></font>",
                    0
                ),
                Toast.LENGTH_SHORT
            ).show()
        }
    }

    private fun updateGuessingBtnVisibility(isGuesser: Boolean){
        if(isGuesser){
            binding!!.guessingToggleBtn.visibility = View.VISIBLE
        }
        else{
            binding!!.guessingToggleBtn.visibility = View.INVISIBLE
        }
    }

    override fun onDestroy() {
        binding = null
        super.onDestroy()
    }
}