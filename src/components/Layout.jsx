import { NavLink, Outlet } from 'react-router-dom'
import { api } from '../api/api'

function Layout({ user, onLogout }) {
    const handleLogout = async () => {
        await api.post('/api/auth/logout')
        onLogout()
    }

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <span style={{ fontSize: '2rem' }}>💕</span>
                    <h1>OurLove</h1>
                </div>

                <div className="user-info">
                    <div className="user-avatar">
                        {user?.user?.name?.charAt(0) || '❤️'}
                    </div>
                    <span className="user-name">{user?.user?.name || 'Yêu'}</span>
                </div>

                <nav className="nav-links">
                    <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <span>🏠</span> Trang chủ
                    </NavLink>
                    <NavLink to="/photos" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <span>📸</span> Ảnh
                    </NavLink>
                    <NavLink to="/posts" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <span>📝</span> Nhật ký
                    </NavLink>
                    <NavLink to="/letters" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <span>💌</span> Thư bí mật
                    </NavLink>
                    <NavLink to="/milestones" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <span>🎯</span> Mốc kỷ niệm
                    </NavLink>

                </nav>

                <button className="btn logout-btn" onClick={handleLogout}>
                    <span>🚪</span> Đăng xuất
                </button>
            </aside>

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    )
}

export default Layout
