import React, { useContext, useEffect, useRef, useState, Component } from 'react'
import axios from 'axios'
import io from 'socket.io-client'
import get from 'lodash/get'

const eventTypes = {
  CONNECT: 'connection',
  RECONNECT: 'reconnect',
  DISCONNECT: 'disconnect',
  SHARED_CONVERSATION_SEND_MESSAGE: 'sharedConversationMessage',
  NEW_SHARED_CONVERSATION_MESSAGE: 'newSharedConversationMessage',
  SUBSCRIBE_TO_PARTICIPANT_SHARED_CONVERSATION: 'subscribeToParticipantSharedConversation',
}

Object.freeze(eventTypes)

const ONE_MINUTE_IN_MS = 1000 * 10

const useSocketTimeout = (authenticateCallback) => {
  const timeoutInterval = useRef(null)
  useEffect(() => {
    timeoutInterval.current = setInterval(authenticateCallback, ONE_MINUTE_IN_MS)
    return () => {
      clearInterval(timeoutInterval.current)
    }
  }, [authenticateCallback])
}

const ChatStateContext = React.createContext(null)
let socketInstance = null

function useChatState() {
  const state = useContext(ChatStateContext)
  if (!state) {
    throw new Error('useChatState must be used within ChatStateContext')
  }
  return state
}
// this chatSocket will be used at every instance
function ChatStateProvider({
  children,
  ROOT_ENDPOINT = 'http://localhost:9000',
  getJWTToken = () => '',
  profile = {},
  participantUUID = 'e56d2dcc-2140-4c88-8315-1bf35d774baa'
}) {
  const userType = 'participant'
  const { firstName, lastName } = profile
  const [chatIsConnected, setChatIsConnected] = useState(false)
  const [loadingChatMessages, setLoadingChatMessages] = useState(false)
  const [messages, setCurrentMessages] = useState([])
  const [currentMessagePage, setCurrentMessagePage] = useState(1)
  const [totalMessagePage, setTotalMessagePage] = useState(1)

  const getCustomSocket = () => {
    if (getCustomSocket.socket) {
      return getCustomSocket.socket
    }
    getCustomSocket.socket = io(ROOT_ENDPOINT, {
      path: '/api/chat/socket',
      secure: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      'transports': ['websocket'],
    })
    getCustomSocket.socket.customOn = (event, callback) => {
      getCustomSocket.socket.off(event) // clear all existing listeners
      getCustomSocket.socket.on(event, callback)
    }
    return getCustomSocket.socket
  }

  const getSharedConversationMessages = async (page = 1, limit = 10) => {
    const token = await getJWTToken()
    return axios({
      method: 'get',
      url: `${ROOT_ENDPOINT}/api/chat/v2/sharedConversation/participant/messages?page=${page}&limit=${limit}`,
      headers: {
        Authorization: token,
      }
    })
  }

  if (!socketInstance) {
    socketInstance = io(ROOT_ENDPOINT, {
      path: '/api/chat/socket',
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    })
  }

  const socketProxy = socketInstance // TODO: potentially do more stuff with tihs
  socketProxy.customOn = (event, callback) => {
    socketProxy.off(event) // clear all existing listeners
    socketProxy.on(event, callback)
  }

  const authenticateUser = async () => {
    const jwtToken = await getJWTToken()
    socketProxy.emit('authenticate', {
      jwtToken,
      userType,
      firstName,
      lastName
    })
    subscribeParticipantToSharedConversation()
  }

  const listenForConnect = (callback) => {
    socketProxy.customOn(eventTypes.CONNECT, callback)
    socketProxy.customOn(eventTypes.RECONNECT, callback)
  }

  const listenForDisconnect = (callback) => {
    socketProxy.customOn(eventTypes.DISCONNECT, callback)
  }

  const sendSharedConversationMessage = (participantUUID, ackId, channel, body, fileURLs = []) => {
    socketProxy.emit(eventTypes.SHARED_CONVERSATION_SEND_MESSAGE, {
      participantUUID,
      body,
      ackId,
      fileURLs,
      channel,
    })
  }

  const subscribeParticipantToSharedConversation = () => {
    socketProxy.emit(eventTypes.SUBSCRIBE_TO_PARTICIPANT_SHARED_CONVERSATION, participantUUID)
  }

  const listenForNewSharedMessages = (callback) => {
    socketProxy.customOn(eventTypes.NEW_SHARED_CONVERSATION_MESSAGE, callback)
  }

  const closeSocket = () => {
    socketProxy.close()
    getCustomSocket.socket = null
  }

  const moveToNextMessagePage = () => {
    setCurrentMessagePage(previous => previous + 1)
  }

  useEffect(() => {
    setCurrentMessages([])
    setCurrentMessagePage(1)
    setTotalMessagePage(1)

    authenticateUser()
    listenForConnect(() => {
      authenticateUser()
      setChatIsConnected(true)
    })

    listenForDisconnect(() => {
      setChatIsConnected(false)
    })

    listenForNewSharedMessages((message) => {
      console.log('new shared message received ', message)
      setCurrentMessages((previousMessages) => [
        ...previousMessages,
        message,
      ])
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    authenticateUser()
    setChatIsConnected(socketProxy.connected)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketProxy.connected])

  useSocketTimeout(authenticateUser)

  useEffect(() => {
    getConversationMessages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMessagePage])

  const getConversationMessages = async () => {
    if (currentMessagePage <= totalMessagePage) {
      setLoadingChatMessages(true)
      try {
        const result = await getSharedConversationMessages(
          currentMessagePage,
        )
        const data = get(result, 'data.data', {})
        setCurrentMessages(data.messages)
        setTotalMessagePage(data.pages)
        setLoadingChatMessages(false)
      } catch (e) {
        console.log('Error while fetching messages ', e)
      }
    }
  }

  const sendMessage = (body, imageUrl = null) => {
    const ackId = Date.now()
    imageUrl
      ? sendSharedConversationMessage(
        participantUUID,
        body,
        ackId,
        'app',
        [imageUrl],
      )
      : sendSharedConversationMessage(
        participantUUID,
        body,
        ackId,
        'app',
      )
    setCurrentMessages((previousMessages) => [
      ...previousMessages,
      {
        body: body,
        contentType: 'text',
        createdAt: new Date().toString(),
        senderName: `${firstName} ${lastName}`,
        senderType: 'user',
        senderInitials: `${get(firstName, '0')}${get(lastName, '0')}`,
        id: ackId,
        messageId: ackId,
        status: 'pending',
        imageUrl: null,
        channel: 'app',
        newlySent: true,
      },
    ])
  }


  const providerValue = {
    authenticateUser,
    loadingChatMessages,
    closeSocket,
    socketProxy,
    sendMessage,
    listenForNewSharedMessages,
    chatIsConnected,
    getConversationMessages,
    moveToNextMessagePage,
    messages,
  }

  return (
    <ChatStateContext.Provider value={providerValue}>
      {children}
    </ChatStateContext.Provider>
  )
}

export { useChatState, ChatStateProvider }
