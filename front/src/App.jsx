import {BrowserRouter, Routes, Route} from 'react-router-dom'
import {AuthProvider} from './admin/context/AuthContext'
import PrivateRoute from './admin/components/PrivateRoute/PrivateRoute'
import AdminLayout from './admin/components/AdminLayout/AdminLayout'
import {MenuProvider} from './shared/context/MenuContext'

import Layout from './components/Layout/Layout'
import Home from './pages/Home/Home'
import About from './pages/About/About'
import Menu from './pages/Menu/Menu'
import News from './pages/News/News'
import NewsDetail from './pages/NewsDetail/NewsDetail'
import Events from './pages/Events/Events'
import Contacts from './pages/Contacts/Contacts'
import Booking from './pages/Booking/Booking'

import Login from './admin/pages/Login/Login'
import Dashboard from './admin/pages/Dashboard/Dashboard'
import AdminNews from './admin/pages/News/AdminNews'
import AdminRestaurants from './admin/pages/Restaurants/AdminRestaurants'
import AdminMenu from './admin/pages/MenuAdmin/AdminMenu'
import AdminReviews from './admin/pages/Reviews/AdminReviews'
import AdminOrders from './admin/pages/Orders/AdminOrders'
import AdminPages from './admin/pages/Pages/AdminPages'
import AdminManagers from './admin/pages/Managers/AdminManagers'
import AdminContacts from './admin/pages/Contacts/AdminContacts'

function App() {
    return (
        <AuthProvider>
            <MenuProvider>
                <BrowserRouter>
                    <Routes>
                        {/* Публичные маршруты */}
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

                        {/* Логин */}
                        <Route path="/admin/login" element={<Login/>}/>

                        {/* Защищённые маршруты админки */}
                        <Route path="/admin" element={
                            <PrivateRoute>
                                <AdminLayout/>
                            </PrivateRoute>
                        }>
                            <Route index element={<Dashboard/>}/>

                            <Route path="news" element={
                                <PrivateRoute requiredPermission="news">
                                    <AdminNews/>
                                </PrivateRoute>
                            }/>

                            <Route path="restaurants" element={
                                <PrivateRoute requiredPermission="restaurants">
                                    <AdminRestaurants/>
                                </PrivateRoute>
                            }/>

                            <Route path="menu" element={
                                <PrivateRoute requiredPermission="menu">
                                    <AdminMenu/>
                                </PrivateRoute>
                            }/>

                            <Route path="reviews" element={
                                <PrivateRoute requiredPermission="reviews">
                                    <AdminReviews/>
                                </PrivateRoute>
                            }/>

                            <Route path="orders" element={
                                <PrivateRoute requiredPermission="orders">
                                    <AdminOrders/>
                                </PrivateRoute>
                            }/>

                            <Route path="pages" element={
                                <PrivateRoute requiredPermission="pages">
                                    <AdminPages/>
                                </PrivateRoute>
                            }/>

                            <Route path="managers" element={
                                <PrivateRoute requiredPermission="managers">
                                    <AdminManagers/>
                                </PrivateRoute>
                            }/>

                            <Route path="contacts" element={
                                <PrivateRoute requiredPermission="managers">
                                    <AdminContacts />
                                </PrivateRoute>
                            } />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </MenuProvider>
        </AuthProvider>
    )
}

export default App