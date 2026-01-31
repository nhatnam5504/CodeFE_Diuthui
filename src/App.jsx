import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Home from './pages/Home'
import Photos from './pages/Photos'
import Posts from './pages/Posts'
import Letters from './pages/Letters'
import Milestones from './pages/Milestones'

import Layout from './components/Layout'
import { api } from './api/api'

function App() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            const res = await api.get('/api/auth/me')
            if (res.success) {
                setUser(res.data)
            }
        } catch (e) {
            console.log('Not authenticated')
        } finally {
            setLoading(false)
        }
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
                    user ? <Navigate to="/" /> : <Login onLogin={setUser} />
                } />
                <Route path="/" element={
                    user ? <Layout user={user} onLogout={() => setUser(null)} /> : <Navigate to="/login" />
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
