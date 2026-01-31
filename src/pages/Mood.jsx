import { useState, useEffect } from 'react'
import { api } from '../api/api'

function Mood({ user }) {
    const [todayMoods, setTodayMoods] = useState([])
    const [myMood, setMyMood] = useState(null)
    const [history, setHistory] = useState([])
    const [showHistory, setShowHistory] = useState(false)
    const [loading, setLoading] = useState(true)
    const [selectedMood, setSelectedMood] = useState(null)
    const [note, setNote] = useState('')

    const moods = [
        { value: 'HAPPY', emoji: '😊', label: 'Vui vẻ' },
        { value: 'LOVE', emoji: '😍', label: 'Yêu' },
        { value: 'SAD', emoji: '😢', label: 'Buồn' },
        { value: 'ANGRY', emoji: '😠', label: 'Tức' },
        { value: 'TIRED', emoji: '😫', label: 'Mệt' },
        { value: 'EXCITED', emoji: '🤩', label: 'Hào hứng' },
        { value: 'PEACEFUL', emoji: '😌', label: 'Bình yên' },
        { value: 'WORRIED', emoji: '😟', label: 'Lo lắng' }
    ]

    useEffect(() => {
        loadTodayMoods()
    }, [])

    const loadTodayMoods = async () => {
        try {
            const res = await api.get('/api/mood/today')
            if (res.success) {
                setTodayMoods(res.data.todayMoods || [])
                setMyMood(res.data.myMood)
                if (res.data.myMood) {
                    setSelectedMood(res.data.myMood.mood)
                    setNote(res.data.myMood.note || '')
                }
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const loadHistory = async () => {
        try {
            const res = await api.get('/api/mood/history')
            if (res.success) {
                setHistory(res.data || [])
                setShowHistory(true)
            }
        } catch (err) {
            console.error(err)
        }
    }

    const saveMood = async () => {
        if (!selectedMood) return
        try {
            const res = await api.post('/api/mood', { mood: selectedMood, note })
            if (res.success) {
                setMyMood(res.data)
                loadTodayMoods()
            }
        } catch (err) {
            console.error(err)
        }
    }

    const getMoodEmoji = (moodValue) => {
        return moods.find(m => m.value === moodValue)?.emoji || '😊'
    }

    if (loading) {
        return <div className="loading-screen"><div className="heart-loader">😊</div></div>
    }

    return (
        <div>
            <header className="page-header">
                <h1 className="page-title">😊 Cảm xúc hôm nay</h1>
                <button className="btn btn-secondary" onClick={loadHistory}>
                    📅 Lịch sử
                </button>
            </header>

            {/* Today's Moods */}
            {todayMoods.length > 0 && (
                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>💑 Cảm xúc của chúng mình</h2>
                    <div className="stats-grid">
                        {todayMoods.map((mood, idx) => (
                            <div className="stat-card" key={idx}>
                                <div className="stat-value">{getMoodEmoji(mood.mood)}</div>
                                <div className="stat-label">{mood.note || 'Không có ghi chú'}</div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Set Mood */}
            <section>
                <div className="card">
                    <h2 style={{ marginBottom: '1.5rem' }}>Bạn đang cảm thấy thế nào?</h2>

                    <div className="mood-grid" style={{ marginBottom: '1.5rem' }}>
                        {moods.map(mood => (
                            <div
                                key={mood.value}
                                className={`mood-option ${selectedMood === mood.value ? 'selected' : ''}`}
                                onClick={() => setSelectedMood(mood.value)}
                            >
                                <span className="mood-emoji">{mood.emoji}</span>
                                <span className="mood-label">{mood.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Ghi chú (tùy chọn)</label>
                        <input
                            type="text"
                            className="form-input"
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder="Hôm nay bạn có gì muốn chia sẻ?"
                        />
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={saveMood}
                        disabled={!selectedMood}
                    >
                        💾 Lưu cảm xúc
                    </button>
                </div>
            </section>

            {/* History Modal */}
            {showHistory && (
                <div className="modal-overlay" onClick={() => setShowHistory(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">📅 Lịch sử cảm xúc</h2>
                            <button className="modal-close" onClick={() => setShowHistory(false)}>×</button>
                        </div>

                        {history.length === 0 ? (
                            <div className="empty-state">
                                <p>Chưa có dữ liệu cảm xúc</p>
                            </div>
                        ) : (
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {history.map((item, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            padding: '1rem',
                                            borderBottom: '1px solid rgba(255,255,255,0.1)'
                                        }}
                                    >
                                        <span style={{ fontSize: '2rem' }}>{getMoodEmoji(item.mood)}</span>
                                        <div>
                                            <div style={{ fontWeight: '600' }}>
                                                {new Date(item.date).toLocaleDateString('vi-VN')}
                                            </div>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                                {item.note || 'Không có ghi chú'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Mood
