import { useState, useEffect } from 'react'
import { api } from '../api/api'

function Letters({ user }) {
    const [letters, setLetters] = useState([])
    const [box, setBox] = useState('inbox')
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [selectedLetter, setSelectedLetter] = useState(null)
    const [form, setForm] = useState({
        content: '',
        openType: 'NOW',
        openAt: ''
    })

    const openTypes = [
        { value: 'NOW', label: '👀 Mở ngay', description: 'Người nhận có thể đọc ngay' },
        { value: 'SCHEDULED', label: '⏰ Hẹn ngày mở', description: 'Chọn ngày giờ cụ thể' },
        { value: 'BOTH_CONFIRM', label: '💑 Cả hai xác nhận', description: 'Cần cả 2 người đồng ý' }
    ]

    useEffect(() => {
        loadLetters()
    }, [box])

    const loadLetters = async () => {
        setLoading(true)
        try {
            const res = await api.get(`/api/letters?box=${box}`)
            if (res.success) {
                setLetters(res.data.letters || [])
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const payload = {
                content: form.content,
                openType: form.openType,
                openAt: form.openType === 'SCHEDULED' ? form.openAt : null
            }
            const res = await api.post('/api/letters', payload)
            if (res.success) {
                setShowModal(false)
                setForm({ content: '', openType: 'NOW', openAt: '' })
                loadLetters()
                alert('💌 Đã gửi thư thành công!')
            }
        } catch (err) {
            console.error(err)
        }
    }

    const viewLetter = async (letter) => {
        try {
            const res = await api.get(`/api/letters/${letter.id}`)
            if (res.success) {
                setSelectedLetter(res.data)
            }
        } catch (err) {
            console.error(err)
        }
    }

    const confirmOpen = async (id) => {
        try {
            const res = await api.post(`/api/letters/${id}/confirm`)
            if (res.success) {
                alert(res.message || '✅ Đã xác nhận!')
                loadLetters()
                setSelectedLetter(null)
            }
        } catch (err) {
            console.error(err)
        }
    }

    const getOpenTypeInfo = (letter) => {
        if (!letter) return null
        switch (letter.openType) {
            case 'NOW':
                return { icon: '👀', text: 'Mở ngay' }
            case 'SCHEDULED':
                const openDate = letter.openAt ? new Date(letter.openAt) : null
                return {
                    icon: '⏰',
                    text: openDate ? `Mở lúc ${openDate.toLocaleString('vi-VN')}` : 'Hẹn giờ'
                }
            case 'BOTH_CONFIRM':
                const status = []
                if (letter.senderConfirmed) status.push('✅ Người gửi')
                if (letter.receiverConfirmed) status.push('✅ Người nhận')
                return {
                    icon: '💑',
                    text: status.length > 0 ? status.join(' | ') : 'Chờ xác nhận'
                }
            default:
                return { icon: '📧', text: '' }
        }
    }

    const canViewContent = (letterData) => {
        if (!letterData) return false
        return letterData.canOpen || letterData.letter?.isOpened
    }

    if (loading) {
        return <div className="loading-screen"><div className="heart-loader">💌</div></div>
    }

    return (
        <div>
            <header className="page-header">
                <h1 className="page-title">💌 Thư bí mật</h1>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    ✍️ Viết thư
                </button>
            </header>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    className={`btn ${box === 'inbox' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setBox('inbox')}
                >
                    📥 Hộp thư đến
                </button>
                <button
                    className={`btn ${box === 'sent' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setBox('sent')}
                >
                    📤 Đã gửi
                </button>
            </div>

            {letters.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">💌</div>
                    <p>{box === 'inbox' ? 'Chưa có thư nào!' : 'Bạn chưa gửi thư nào!'}</p>
                </div>
            ) : (
                <div className="card-grid">
                    {letters.map(letter => {
                        const typeInfo = getOpenTypeInfo(letter)
                        return (
                            <div
                                className={`card letter-card ${!letter.isOpened ? 'letter-sealed' : ''}`}
                                key={letter.id}
                                onClick={() => viewLetter(letter)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                        {new Date(letter.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                    <span style={{ fontSize: '1rem' }}>{typeInfo?.icon}</span>
                                </div>
                                <p style={{ marginBottom: '0.5rem' }}>
                                    {letter.isOpened
                                        ? letter.content?.substring(0, 80) + '...'
                                        : '🔒 Thư chưa mở...'}
                                </p>
                                <p style={{ color: 'var(--accent-pink)', fontSize: '0.75rem' }}>
                                    {typeInfo?.text}
                                </p>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Compose Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">✍️ Viết thư bí mật</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Nội dung thư</label>
                                <textarea
                                    className="form-textarea"
                                    value={form.content}
                                    onChange={e => setForm({ ...form, content: e.target.value })}
                                    placeholder="Những điều muốn nói với người yêu..."
                                    required
                                    style={{ minHeight: '200px' }}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Khi nào người yêu có thể mở?</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {openTypes.map(t => (
                                        <label
                                            key={t.value}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '0.75rem',
                                                padding: '1rem',
                                                background: form.openType === t.value ? 'rgba(255,107,157,0.1)' : 'var(--bg-card)',
                                                border: form.openType === t.value ? '2px solid var(--accent-pink)' : '2px solid transparent',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                name="openType"
                                                value={t.value}
                                                checked={form.openType === t.value}
                                                onChange={e => setForm({ ...form, openType: e.target.value })}
                                                style={{ marginTop: '4px' }}
                                            />
                                            <div>
                                                <div style={{ fontWeight: '600' }}>{t.label}</div>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                                    {t.description}
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {form.openType === 'SCHEDULED' && (
                                <div className="form-group">
                                    <label className="form-label">📅 Chọn ngày giờ mở</label>
                                    <input
                                        type="datetime-local"
                                        className="form-input"
                                        value={form.openAt}
                                        onChange={e => setForm({ ...form, openAt: e.target.value })}
                                        min={new Date().toISOString().slice(0, 16)}
                                        required
                                    />
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                        Thư sẽ tự động mở khóa vào thời điểm này
                                    </p>
                                </div>
                            )}

                            {form.openType === 'BOTH_CONFIRM' && (
                                <div style={{
                                    padding: '1rem',
                                    background: 'rgba(255,107,157,0.1)',
                                    borderRadius: '8px',
                                    marginBottom: '1rem'
                                }}>
                                    <p style={{ color: 'var(--accent-pink)', fontSize: '0.875rem' }}>
                                        💡 Cả bạn và người yêu đều phải bấm "Xác nhận mở" thì thư mới mở được.
                                        Thích hợp cho những thư quan trọng cần cả hai cùng sẵn sàng!
                                    </p>
                                </div>
                            )}

                            <button type="submit" className="btn btn-primary">
                                💌 Gửi thư
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* View Letter Modal */}
            {selectedLetter && (
                <div className="modal-overlay" onClick={() => setSelectedLetter(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">💌 Thư tình</h2>
                            <button className="modal-close" onClick={() => setSelectedLetter(null)}>×</button>
                        </div>

                        {canViewContent(selectedLetter) ? (
                            <div>
                                <div style={{
                                    padding: '0.5rem 1rem',
                                    background: 'var(--bg-card)',
                                    borderRadius: '8px',
                                    marginBottom: '1rem',
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.875rem'
                                }}>
                                    {getOpenTypeInfo(selectedLetter.letter)?.icon} {getOpenTypeInfo(selectedLetter.letter)?.text}
                                </div>
                                <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
                                    {selectedLetter.letter?.content}
                                </p>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon">🔒</div>
                                <p style={{ marginBottom: '1rem' }}>Thư này chưa thể mở!</p>

                                {selectedLetter.letter?.openType === 'SCHEDULED' && selectedLetter.letter?.openAt && (
                                    <p style={{ color: 'var(--accent-pink)' }}>
                                        ⏰ Sẽ mở lúc: {new Date(selectedLetter.letter.openAt).toLocaleString('vi-VN')}
                                    </p>
                                )}

                                {selectedLetter.letter?.openType === 'BOTH_CONFIRM' && (
                                    <div>
                                        <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                                            Cần cả hai xác nhận:
                                        </p>
                                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1rem' }}>
                                            <span style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '20px',
                                                background: selectedLetter.letter.senderConfirmed ? 'rgba(0,255,0,0.2)' : 'var(--bg-card)'
                                            }}>
                                                {selectedLetter.letter.senderConfirmed ? '✅' : '⏳'} Người gửi
                                            </span>
                                            <span style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '20px',
                                                background: selectedLetter.letter.receiverConfirmed ? 'rgba(0,255,0,0.2)' : 'var(--bg-card)'
                                            }}>
                                                {selectedLetter.letter.receiverConfirmed ? '✅' : '⏳'} Người nhận
                                            </span>
                                        </div>

                                        {selectedLetter.isRecipient && !selectedLetter.letter.receiverConfirmed && (
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => confirmOpen(selectedLetter.letter.id)}
                                            >
                                                ✅ Tôi sẵn sàng mở thư
                                            </button>
                                        )}
                                        {selectedLetter.isSender && !selectedLetter.letter.senderConfirmed && (
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => confirmOpen(selectedLetter.letter.id)}
                                            >
                                                ✅ Cho phép mở thư
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Letters
