import { useState, useEffect } from 'react'
import { api } from '../api/api'

function Home({ user }) {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    // user prop structure: { user: {...}, partner: {...} }
    const currentUser = user?.user
    const partner = user?.partner

    useEffect(() => {
        loadDashboard()
    }, [])

    const loadDashboard = async () => {
        try {
            const res = await api.get('/api/home/dashboard')
            if (res.success) {
                setData(res.data)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="loading-screen"><div className="heart-loader">💕</div></div>
    }

    // Calculate days in love from 24/12/2024
    const loveStartDate = new Date(2025, 11, 24) // Month is 0-indexed, so 11 = December
    const today = new Date()
    const daysInLove = Math.floor((today - loveStartDate) / (1000 * 60 * 60 * 24))

    return (
        <div>
            <header className="page-header">
                <h1 className="page-title">Xin chào, {currentUser?.name || 'Yêu'} 💕</h1>
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">{daysInLove}</div>
                    <div className="stat-label">💕 Ngày yêu nhau</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{data?.photoCount || 0}</div>
                    <div className="stat-label">📸 Ảnh kỷ niệm</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{data?.postCount || 0}</div>
                    <div className="stat-label">📝 Bài viết</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{data?.milestoneCount || 0}</div>
                    <div className="stat-label">🎯 Mốc kỷ niệm</div>
                </div>
            </div>

            {data?.todayMemories?.length > 0 && (
                <section style={{ marginTop: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>🎉 Ngày này năm trước</h2>
                    <div className="card-grid">
                        {data.todayMemories.map((memory, idx) => (
                            <div className="card" key={idx}>
                                <p>{memory.title || memory.content}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {data?.quickMessage && (
                <section style={{ marginTop: '2rem' }}>
                    <div className="card" style={{ background: 'var(--gradient-card)', textAlign: 'center' }}>
                        <h3>💬 Tin nhắn nhanh</h3>
                        <p style={{ fontSize: '1.25rem', marginTop: '0.5rem' }}>{data.quickMessage.content}</p>
                    </div>
                </section>
            )}

            {/* Welcome message for partner */}
            {partner && (
                <section style={{ marginTop: '2rem' }}>
                    <div className="card" style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '2rem' }}>💑</span>
                        <h3 style={{ marginTop: '0.5rem' }}>{currentUser?.name} ❤️ {partner?.name}</h3>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            Luôn bên nhau mỗi ngày!
                        </p>
                    </div>
                </section>
            )}
        </div>
    )
}

export default Home
