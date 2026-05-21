import { Outlet } from 'react-router-dom'
import AdminSidebar from '../AdminSidebar/AdminSidebar'
import AdminTopbar from '../AdminTopbar/AdminTopbar'
import '../../styles/admin.css'

export default function AdminLayout() {
    return (
        <div className="admin-root">
            <div className="admin-wrapper">
                <AdminSidebar />
                <div className="admin-main">
                    <AdminTopbar />
                    <div className="admin-content">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    )
}