import './App.scss'
import React from 'react'
import Router from './Router'

import { Provider } from 'react-redux'
import store from './store'

import { ThemeProvider } from '@mui/material/styles'
import theme from './theme'
import GlobalStyles from '@mui/material/GlobalStyles'
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  React.useEffect(() => {
    document.title = 'KPI Platform'
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles
        styles={{
          body: { backgroundColor: '#FFFCFA' },
        }}
      />
      <Provider store={store}>
        <Router />
      </Provider>
    </ThemeProvider>
  )
}

export default App
