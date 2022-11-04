## Getting Started with Vincere Chat Application

This is an example project for working with Vincere Chat Application connected with Health Coach/Clinician facing dashboard. Example in this project is participant facing application, either web or for mobile


## Usage
Cope/paste or import file **src/vincereChatProvider.js** into your codebase

VincereChatStateProvider is dependent on following npm modules. Make sure they are installed in your codebase
- socket.io-client
- lodash
- axios

To run the example project, do npm install and npm start. It should be up and running with Vincere Development Dashboard environment. Make sure to update the JWT token in the index.js file

### Using in React Component
Use the chat state provider in your main component or the component in the project where user is already authenticated, since the ChatProvider is dependent on the Vincere JWT Token
```js
import React from 'react'
import App from './App'
import { ChatStateProvider } from './vincereChatProvider'

const root = ReactDOM.createRoot(document.getElementById('root'))
const rootEndpoint = 'https://apidev.vincerehealth.org'
const getUserJWTMock = async () => {
  return '<jwt_token>'
}

root.render(
  <ChatStateProvider
    ROOT_ENDPOINT={rootEndpoint} // root endpoint of Vincere Server
    getJWTToken={getUserJWTMock} // Async function that can fetch JWT as string
  >
    <App />
  </ChatStateProvider>
)
```
| Prop      | Description |
| ----------- | ----------- |
| ROOT_ENDPOINT      | Root Endpoint of Vincere Chat Server       |
| getJWTToken   | async function that can fetch upto date JWT token as string. Output should be plain string. JWT will be refreshed by the provider periodically        |


### Using the Chat Methods
```js
  const {
    messages, // all the messages. this will be updated in real-time using socket connection
    loadMoreMessages, // for pagination. on page scroll load more messages
    loadingChatMessages, // boolean to display loader when messages are being fetched
    sendMessage, // function to send message
    chatIsConnected, // indicator if the socket connection is establshed and if you are connected to chat
  } = useChatState()
```
| Prop      | Description | Type |
| ----------- | ----------- | ----------- |
| messages      | all the messages. this will be updated in real-time using socket connection     | array
| loadMoreMessages   | for pagination. on page scroll load more messages   | function
| loadingChatMessages   | boolean to display loader when messages are being fetched   | boolean
| sendMessage   | function to send message   | function
| chatIsConnected   | indicator if the socket connection is establshed and if you are connected to chat   | boolean

### A note on react native

For React Native we recommend using [Gifted Chat](https://github.com/FaridSafi/react-native-gifted-chat). You can use [Snack example here](https://snack.expo.dev/@xcarpentier/giftedchat-playground)

We recommend using following configuration for Gifted Chat
```js
const {
  messages,
  loadMoreMessages,
  loadingChatMessages,
  sendMessage,
  chatIsConnected,
} = useChatState()
<GiftedChat
    messages={messages}
    onSend={messages => {
      sendMessage(messages[0])
    }}
    user={{ _id: 1 }}
    renderUsernameOnMessage={true}
    listViewProps={{
      scrollEventThrottle: 400,
      onScroll: async ({ nativeEvent }) => {
        if (isCloseToTop(nativeEvent)) {
          loadMoreMessages()
        }
      }
    }}
    scrollToBottom
    scrollToBottomComponent={props => {
      return (
        <View style={styles.scrollToBottomContainer}>
          <Icon name={'chevron-down-outline'} size={32} />
        </View>
      )
    }}
    renderBubble={props => {
      return (
        <Bubble
          {...props}
          textStyle={{
            right: styles.bubbleRight,
          }}
          wrapperStyle={{ right: styles.bubbleBackGround, }}
        />
      )
    }}
    renderSend={props => { return (<Send {...props} textStyle={styles.sendColor} />) }}
    renderMessageImage={renderMessageImage}
    renderActions={renderActions}
    keyboardShouldPersistTaps={'never'}
  />
```