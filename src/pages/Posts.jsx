import { useState, useEffect } from 'react'
import { api } from '../api/api'

function Posts({ user }) {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingPost, setEditingPost] = useState(null)
    const [viewingPost, setViewingPost] = useState(null)
    const [form, setForm] = useState({
        title: '',
        content: '',
        mood: 'HAPPY',
        visibility: 'BOTH'
    })

    const moods = ['HAPPY', 'LOVE', 'SAD', 'ANGRY', 'EXCITED', 'PEACEFUL']

    useEffect(() => {
        loadPosts()
    }, [])

    const loadPosts = async () => {
        try {
            const res = await api.get('/api/posts')
            if (res.success) {
                setPosts(res.data.posts || res.data.content || res.data || [])
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
            const url = editingPost ? `/api/posts/${editingPost.id}` : '/api/posts'
            const method = editingPost ? 'put' : 'post'
            const res = await api[method](url, form)
            if (res.success) {
                loadPosts()
                closeModal()
            }
        } catch (err) {
            console.error(err)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Xóa bài viết này?')) return
        try {
            await api.delete(`/api/posts/${id}`)
            setPosts(posts.filter(p => p.id !== id))
            setViewingPost(null)
        } catch (err) {
            console.error(err)
        }
    }

    const openEdit = (post) => {
        setEditingPost(post)
        setForm({
            title: post.title,
            content: post.content,
            mood: post.mood,
            visibility: post.visibility
        })
        setViewingPost(null)
        setShowModal(true)
    }

    const closeModal = () => {
        setShowModal(false)
        setEditingPost(null)
        setForm({ title: '', content: '', mood: 'HAPPY', visibility: 'BOTH' })
    }

    const getMoodEmoji = (mood) => {
        const emojis = { HAPPY: '😊', LOVE: '❤️', SAD: '😢', ANGRY: '😠', EXCITED: '🎉', PEACEFUL: '😌' }
        return emojis[mood] || '😊'
    }

    const getMoodLabel = (mood) => {
        const labels = { HAPPY: 'Vui vẻ', LOVE: 'Yêu thương', SAD: 'Buồn', ANGRY: 'Tức giận', EXCITED: 'Phấn khích', PEACEFUL: 'Bình yên' }
        return labels[mood] || mood
    }

    const getVisibilityLabel = (visibility) => {
        const labels = { BOTH: '💑 Cả hai', ONLY_ME: '🔒 Chỉ mình tôi', ONLY_PARTNER: '💝 Chỉ người yêu' }
        return labels[visibility] || visibility
    }

    // user prop structure: { user: {...}, partner: {...} }
    const currentUser = user?.user
    const partner = user?.partner

    const getAuthorName = (authorId) => {
        const id = String(authorId)

        // Check by current user
        if (currentUser?.id && id === String(currentUser.id)) {
            return currentUser.name || 'Bạn'
        }
        // Check by partner
        if (partner?.id && id === String(partner.id)) {
            return partner.name || 'Người yêu'
        }
        // Hardcoded fallback
        if (id === '1') return 'Thúi 💙'
        if (id === '2') return 'Dịu 💗'
        return `Unknown (${id})`
    }

    const countMyPosts = () => currentUser?.id ? posts.filter(p => String(p.ownerId) === String(currentUser.id)).length : 0
    const countPartnerPosts = () => partner?.id ? posts.filter(p => String(p.ownerId) === String(partner.id)).length : 0

    if (loading) {
        return <div className="loading-screen"><div className="heart-loader">📝</div></div>
    }

    return (
        <div>
            <header className="page-header">
                <h1 className="page-title">📝 Nhật ký tình yêu</h1>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    ✏️ Viết mới
                </button>
            </header>

            {/* Stats */}
            <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="stat-card">
                    <div className="stat-value">{posts.length}</div>
                    <div className="stat-label">📝 Bài viết</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{countMyPosts()}</div>
                    <div className="stat-label">✍️ {currentUser?.name || 'Bạn'} viết</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{countPartnerPosts()}</div>
                    <div className="stat-label">💕 {partner?.name || 'Người yêu'} viết</div>
                </div>
            </div>

            {posts.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📝</div>
                    <p>Chưa có bài viết nào. Hãy ghi lại kỷ niệm!</p>
                    <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowModal(true)}>
                        ✏️ Viết bài đầu tiên
                    </button>
                </div>
            ) : (
                <div className="card-grid">
                    {posts.map(post => (
                        <div
                            className="card"
                            key={post.id}
                            onClick={() => setViewingPost(post)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>{getMoodEmoji(post.mood)}</span>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--accent-pink)',
                                        background: 'rgba(255,107,157,0.1)',
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '10px'
                                    }}>
                                        ✍️ {getAuthorName(post.ownerId)}
                                    </span>
                                </div>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                                    {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                            <h3 style={{ marginBottom: '0.5rem' }}>{post.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.6', fontSize: '0.875rem' }}>
                                {post.content?.substring(0, 100)}{post.content?.length > 100 ? '...' : ''}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.7rem', color: 'var(--accent-blue)' }}>
                                    {getVisibilityLabel(post.visibility)}
                                </span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                    Nhấn để đọc →
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* View Post Modal */}
            {viewingPost && (
                <div className="modal-overlay" onClick={() => setViewingPost(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                        <div className="modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ fontSize: '2rem' }}>{getMoodEmoji(viewingPost.mood)}</span>
                                <div>
                                    <h2 className="modal-title" style={{ marginBottom: '0.25rem' }}>{viewingPost.title}</h2>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                        {new Date(viewingPost.createdAt).toLocaleDateString('vi-VN', {
                                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                        })}
                                    </div>
                                </div>
                            </div>
                            <button className="modal-close" onClick={() => setViewingPost(null)}>×</button>
                        </div>

                        <div style={{
                            display: 'flex', gap: '0.75rem',
                            marginBottom: '1.5rem', flexWrap: 'wrap'
                        }}>
                            <span style={{
                                padding: '0.25rem 0.75rem',
                                background: 'rgba(255,107,157,0.1)',
                                borderRadius: '20px',
                                fontSize: '0.875rem',
                                color: 'var(--accent-pink)'
                            }}>
                                ✍️ Viết bởi: <strong>{getAuthorName(viewingPost.ownerId)}</strong>
                            </span>
                            <span style={{
                                padding: '0.25rem 0.75rem',
                                background: 'rgba(33,150,243,0.1)',
                                borderRadius: '20px',
                                fontSize: '0.875rem',
                                color: 'var(--accent-blue)'
                            }}>
                                {getMoodEmoji(viewingPost.mood)} {getMoodLabel(viewingPost.mood)}
                            </span>
                            <span style={{
                                padding: '0.25rem 0.75rem',
                                background: 'var(--bg-primary)',
                                borderRadius: '20px',
                                fontSize: '0.875rem',
                                color: 'var(--text-secondary)'
                            }}>
                                {getVisibilityLabel(viewingPost.visibility)}
                            </span>
                        </div>

                        <div style={{
                            background: 'var(--bg-primary)',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            marginBottom: '1.5rem',
                            maxHeight: '400px',
                            overflowY: 'auto'
                        }}>
                            <p style={{
                                whiteSpace: 'pre-wrap',
                                lineHeight: '1.8',
                                color: 'var(--text-primary)'
                            }}>
                                {viewingPost.content}
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-primary" onClick={() => openEdit(viewingPost)}>
                                ✏️ Sửa
                            </button>
                            <button className="btn btn-secondary" onClick={() => handleDelete(viewingPost.id)}>
                                🗑️ Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Post Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editingPost ? '✏️ Sửa bài viết' : '📝 Bài viết mới'}</h2>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Tiêu đề</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    placeholder="Hôm nay có gì vui?"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Nội dung</label>
                                <textarea
                                    className="form-textarea"
                                    value={form.content}
                                    onChange={e => setForm({ ...form, content: e.target.value })}
                                    placeholder="Kể về ngày hôm nay..."
                                    required
                                    style={{ minHeight: '200px' }}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Tâm trạng</label>
                                <div className="mood-grid">
                                    {moods.map(mood => (
                                        <div
                                            key={mood}
                                            className={`mood-option ${form.mood === mood ? 'selected' : ''}`}
                                            onClick={() => setForm({ ...form, mood })}
                                        >
                                            <span className="mood-emoji">{getMoodEmoji(mood)}</span>
                                            <span className="mood-label">{getMoodLabel(mood)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Ai xem được?</label>
                                <select
                                    className="form-select"
                                    value={form.visibility}
                                    onChange={e => setForm({ ...form, visibility: e.target.value })}
                                >
                                    <option value="BOTH">💑 Cả hai</option>
                                    <option value="ONLY_ME">🔒 Chỉ mình tôi</option>
                                    <option value="ONLY_PARTNER">💝 Chỉ người yêu</option>
                                </select>
                            </div>

                            <button type="submit" className="btn btn-primary">
                                💾 Lưu
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Posts
