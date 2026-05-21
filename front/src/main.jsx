import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {Toaster} from 'react-hot-toast'
import './index.css'
import App from './App.jsx'
import './i18n/index.js'
import './styles/global.css'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App/>
        <Toaster
            position="top-right"
            gutter={10}
            containerStyle={{top: 20, right: 20}}
        />
    </StrictMode>,
)
