import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Home from './pages/Home'
import Photos from './pages/Photos'
import Posts from './pages/Posts'
import Letters from './pages/Letters'
import Milestones from './pages/Milestones'

import Layout from './components/Layout'

function App() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check localStorage for saved user data
        const savedUser = localStorage.getItem('ourlove_user')
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser))
            } catch (e) {
                localStorage.removeItem('ourlove_user')
            }
        }
        setLoading(false)
    }, [])

    const handleLogin = (userData) => {
        // Save user to localStorage
        localStorage.setItem('ourlove_user', JSON.stringify(userData))
        setUser(userData)
    }

    const handleLogout = () => {
        localStorage.removeItem('ourlove_user')
        setUser(null)
    }

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="heart-loader">💕</div>
                <p>Đang tải...</p>
            </div>
        )
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={
                    user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />
                } />
                <Route path="/" element={
                    user ? <Layout user={user} onLogout={handleLogout} /> : <Navigate to="/login" />
                }>
                    <Route index element={<Home user={user} />} />
                    <Route path="photos" element={<Photos user={user} />} />
                    <Route path="posts" element={<Posts user={user} />} />
                    <Route path="letters" element={<Letters user={user} />} />
                    <Route path="milestones" element={<Milestones />} />

                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App
