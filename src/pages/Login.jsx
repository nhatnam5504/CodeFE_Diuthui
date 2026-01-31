import { useState } from 'react'
import { api } from '../api/api'

function Login({ onLogin }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await api.post('/api/auth/login', { username, password })
            if (res.success) {
                onLogin(res.data)
            } else {
                setError(res.message || 'Tên đăng nhập hoặc mật khẩu không đúng!')
            }
        } catch (err) {
            setError('Có lỗi xảy ra, thử lại sau!')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-container">
            <form className="login-card" onSubmit={handleSubmit}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>💑</div>
                <h1 style={{ background: 'var(--gradient-love)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Thúi & Dịu
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Đăng nhập để vào không gian của chúng mình
                </p>

                {error && <div className="error-message">{error}</div>}

                <div className="form-group" style={{ marginBottom: '1rem', textAlign: 'left' }}>
                    <label className="form-label">Tên đăng nhập</label>
                    <input
                        type="text"
                        className="form-input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Nhập tên đăng nhập..."
                        autoFocus
                        required
                    />
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                    <label className="form-label">Mật khẩu</label>
                    <input
                        type="password"
                        className="form-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••"
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                    {loading ? '⏳ Đang vào...' : '❤️ Vào nhà'}
                </button>

                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-primary)', borderRadius: '12px', fontSize: '0.8rem' }}>
                    <p style={{ color: 'var(--accent-blue)', marginBottom: '0.5rem' }}>💙 Thúi: nhatnam</p>
                    <p style={{ color: 'var(--accent-pink)' }}>💗 Dịu: diuhien</p>
                </div>
            </form>
        </div>
    )
}

export default Login
