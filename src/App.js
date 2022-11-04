import React, { useRef, useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import moment from 'moment'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Divider from '@material-ui/core/Divider'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Fab from '@material-ui/core/Fab'
import SendIcon from '@material-ui/icons/Send'
import Box from '@material-ui/core/Box'
import CircularProgress from '@material-ui/core/CircularProgress'

import { useChatState } from './vincereChatProvider'

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  chatSection: {
    width: '100%',
    height: '80vh'
  },
  headBG: {
    backgroundColor: '#e0e0e0'
  },
  borderRight500: {
    borderRight: '1px solid #e0e0e0'
  },
  messageArea: {
    height: '70vh',
    overflowY: 'scroll'
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '1rem',
  },
})

const Message = ({ message }) => {
  return (
    <ListItem key={message.uuid}>
      <Grid container>
        <Grid item xs={12}>
          <ListItemText align={message.sentFromParticipant ? 'right' : 'left'} primary={message.message}></ListItemText>
        </Grid>
        <Grid item xs={12}>
          <ListItemText align={message.sentFromParticipant ? 'right' : 'left'} secondary={moment(message.createdAt).format('MMM DD - hh:mm A')}></ListItemText>
        </Grid>
      </Grid>
    </ListItem>
  )
}

const getScrollHeight = (ref) => ref.scrollHeight - ref.clientHeight

const Chat = () => {
  const classes = useStyles()
  const ps = useRef()
  const {
    messages,
    loadMoreMessages,
    loadingChatMessages,
    sendMessage,
    chatIsConnected,
  } = useChatState()
  const [typedMessage, setCurrentTypedMessage] = useState('')
  const [prevClientHeight, setPrevClientHeight] = useState(0)


  const scrollToBottom = () => {
    const curr = ps.current
    if (curr) {
      curr.scrollTop = getScrollHeight(curr) - prevClientHeight
    }
  }

  const bindScrollEvent = () => {
    ps.current.addEventListener('scroll', () => {
      if (!ps.current) return
      if (ps.current.scrollTop < 10 && !loadingChatMessages) {
        setPrevClientHeight(getScrollHeight(ps.current))
        loadMoreMessages()
      }
    })
  }

  useEffect(() => {
    bindScrollEvent()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    scrollToBottom()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages])

  return (
    <div>
      <Grid container>
        <Grid item xs={12} >
          <Typography variant="h5" className="header-message">
            Chat {chatIsConnected ? '(Available)' : '(Connecting)'}
          </Typography>
        </Grid>
      </Grid>
      <Grid container component={Paper} className={classes.chatSection}>
        <Grid item xs={9}>
          <List ref={ps} className={classes.messageArea}>
            {loadingChatMessages && (
              <Box className={classes.loadingContainer}>
                <CircularProgress />
              </Box>
            )}
            {messages
            .map((m) => (
              <Message message={m}/>
            ))}
          </List>
          <Divider />
          <Grid container style={{ padding: '20px' }}>
            <Grid item xs={11}>
              <TextField 
                value={typedMessage}
                onChange={(e) => console.log('event ', setCurrentTypedMessage(e.target.value))}
              id="outlined-basic-email" label="Type Something" fullWidth />
            </Grid>
            <Grid xs={1} align="right">
              <Fab 
                onClick={() => {
                  sendMessage(typedMessage)
                  setCurrentTypedMessage('')
                }}
                color="primary"
                aria-label="add"
              >
                <SendIcon />
              </Fab>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  )
}

export default Chat