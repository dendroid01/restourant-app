import { Outlet, useLocation } from 'react-router-dom'
import Header from '../Header/Header'
import Footer from '../Footer/Footer'

export default function Layout() {
    const { pathname } = useLocation()

    return (
        <>
            <Header currentPath={pathname} />
            <Outlet />
            <Footer />
        </>
    )
}