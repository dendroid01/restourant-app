import {useState} from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Home from './pages/Home/Home'
import About from './pages/About/About'
import Menu from './pages/Menu/Menu'
import News from './pages/News/News'
import NewsDetail from './pages/NewsDetail/NewsDetail'
import Events from './pages/Events/Events'
import Contacts from './pages/Contacts/Contacts'
import Booking from './pages/Booking/Booking'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout/>}>
                    <Route index element={<Home/>}/>
                    <Route path="about" element={<About/>}/>
                    <Route path="menu" element={<Menu/>}/>
                    <Route path="news" element={<News/>}/>
                    <Route path="news/:id" element={<NewsDetail/>}/>
                    <Route path="events" element={<Events/>}/>
                    <Route path="contacts" element={<Contacts/>}/>
                    <Route path="booking" element={<Booking/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App
