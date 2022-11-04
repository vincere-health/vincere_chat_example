import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'
import { ChatStateProvider } from './vincereChatProvider'

const root = ReactDOM.createRoot(document.getElementById('root'))
const rootEndpoint = 'https://apidev.vincerehealth.org'
const getUserJWTMock = async () => {
  return 'eyJraWQiOiJTR0hhQnJPRm9oakpSWFBaZFJmQ3dZeWJSZnRwTkY1UW56MGltaE9RZGhFPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJlNTZkMmRjYy0yMTQwLTRjODgtODMxNS0xYmYzNWQ3NzRiYWEiLCJhdWQiOiI2a2lpNmpkOWc2M2t2Y2dpY2JiaTA4cmhzMCIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTY2NzUzOTg5MSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tXC91cy1lYXN0LTFfUEJ2aUliSVdkIiwiY29nbml0bzp1c2VybmFtZSI6ImJpbGFsdGVzdHVzZXJAZ21haWwuY29tIiwiZXhwIjoxNjY3NTQzNDkxLCJpYXQiOjE2Njc1Mzk4OTEsImVtYWlsIjoiYmlsYWx0ZXN0dXNlckBnbWFpbC5jb20ifQ.bwVsQkIRU6mAWETfNGkX9lbB28XJayTEkPvIQObcv8fRQk-ENwlAZtpF2dtbj59G_ueNg__y3MCGasT5ndMufa6nrbG7B1E8M4RN73_PrI94bPUKR15_Zjgup2Ye_VOcHnTi3iAWWWduF5Gj6rHuHLyLN3Dj79bZAV95Xbk5bENZCT1z1zcAgToV4efjKo051yhp7mbReVyF_2vG7hDl5Q9jR1A65AwQMR8Blzq_nK_zpAdvIHGbMuhHZLyTUkjhG38TTP27r35UMh5yrA-GyGJiPXY1q0wY8ly1Wc0eeaNp4djjk6N6Q8Ie70Jhy20FmmV2gb2Jx0P6co2nuUh40w'
}


root.render(
  <React.StrictMode>
    <ChatStateProvider
      ROOT_ENDPOINT={rootEndpoint}
      getJWTToken={getUserJWTMock}
    >
      <App />
    </ChatStateProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
