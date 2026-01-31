import { useState, useEffect } from 'react'
import { api } from '../api/api'

function Milestones() {
    const [milestones, setMilestones] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingMilestone, setEditingMilestone] = useState(null)
    const [viewMode, setViewMode] = useState('timeline')
    const [uploading, setUploading] = useState(false)
    const [viewingImages, setViewingImages] = useState(null) // For image gallery modal
    const [form, setForm] = useState({
        title: '',
        description: '',
        date: '',
        icon: '💕',
        images: []
    })

    const icons = ['💕', '❤️', '💍', '🏠', '✈️', '🎂', '🎓', '🎉', '👶', '🐕', '💑', '🌹', '🎁', '💒', '🌴']

    useEffect(() => {
        loadMilestones()
    }, [])

    const loadMilestones = async () => {
        try {
            const res = await api.get('/api/milestones')
            if (res.success) {
                const sorted = (res.data || []).sort((a, b) => new Date(a.date) - new Date(b.date))
                setMilestones(sorted)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files)
        if (files.length === 0) return

        setUploading(true)
        const uploadedUrls = []

        for (const file of files) {
            try {
                // Use backend API to upload to Cloudinary
                const formData = new FormData()
                formData.append('file', file)
                formData.append('album', 'milestones')

                const response = await fetch('/api/photos', {
                    method: 'POST',
                    body: formData,
                    credentials: 'include'
                })
                const data = await response.json()
                if (data.success && data.data?.url) {
                    uploadedUrls.push(data.data.url)
                }
            } catch (err) {
                console.error('Upload failed:', err)
            }
        }

        setForm(prev => ({
            ...prev,
            images: [...prev.images, ...uploadedUrls]
        }))
        setUploading(false)
    }

    const removeImage = (index) => {
        setForm(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const url = editingMilestone ? `/api/milestones/${editingMilestone.id}` : '/api/milestones'
            const method = editingMilestone ? 'put' : 'post'
            const res = await api[method](url, form)
            if (res.success) {
                loadMilestones()
                closeModal()
            }
        } catch (err) {
            console.error(err)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Xóa mốc kỷ niệm này?')) return
        try {
            await api.delete(`/api/milestones/${id}`)
            setMilestones(milestones.filter(m => m.id !== id))
        } catch (err) {
            console.error(err)
        }
    }

    const openEdit = (milestone) => {
        setEditingMilestone(milestone)
        // Parse images from comma-separated string
        const imageList = milestone.images ? milestone.images.split(',').filter(Boolean) : []
        setForm({
            title: milestone.title,
            description: milestone.description || '',
            date: milestone.date,
            icon: milestone.icon || '💕',
            images: imageList
        })
        setShowModal(true)
    }

    const closeModal = () => {
        setShowModal(false)
        setEditingMilestone(null)
        setForm({ title: '', description: '', date: '', icon: '💕', images: [] })
    }

    const getDaysFromStart = (date) => {
        if (milestones.length === 0) return 0
        const startDate = new Date(milestones[0].date)
        const currentDate = new Date(date)
        const diffTime = currentDate - startDate
        return Math.floor(diffTime / (1000 * 60 * 60 * 24))
    }

    const getDaysUntilToday = (date) => {
        const milestoneDate = new Date(date)
        const today = new Date()
        const diffTime = today - milestoneDate
        return Math.floor(diffTime / (1000 * 60 * 60 * 24))
    }

    const getGroupedByYear = () => {
        const grouped = {}
        milestones.forEach(m => {
            const year = new Date(m.date).getFullYear()
            if (!grouped[year]) grouped[year] = []
            grouped[year].push(m)
        })
        return grouped
    }

    const getStats = () => {
        if (milestones.length === 0) return null
        const firstDate = new Date(milestones[0].date)
        const today = new Date()
        const totalDays = Math.floor((today - firstDate) / (1000 * 60 * 60 * 24))
        return {
            totalMilestones: milestones.length,
            totalDays,
            firstDate: milestones[0].date,
            latestDate: milestones[milestones.length - 1]?.date
        }
    }

    const getImageList = (milestone) => {
        if (!milestone.images) return []
        return milestone.images.split(',').filter(Boolean)
    }

    const stats = getStats()
    const groupedMilestones = getGroupedByYear()

    if (loading) {
        return <div className="loading-screen"><div className="heart-loader">🎯</div></div>
    }

    return (
        <div>
            <header className="page-header">
                <h1 className="page-title">🎯 Mốc kỷ niệm</h1>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        className={`btn ${viewMode === 'timeline' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setViewMode('timeline')}
                    >
                        📅
                    </button>
                    <button
                        className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setViewMode('grid')}
                    >
                        📊
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        ➕ Thêm mốc
                    </button>
                </div>
            </header>

            {/* Stats */}
            {stats && (
                <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                    <div className="stat-card">
                        <div className="stat-value">{stats.totalMilestones}</div>
                        <div className="stat-label">🎯 Mốc kỷ niệm</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.totalDays}</div>
                        <div className="stat-label">💕 Ngày bên nhau</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{Math.floor(stats.totalDays / 30)}</div>
                        <div className="stat-label">📅 Tháng</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{(stats.totalDays / 365).toFixed(1)}</div>
                        <div className="stat-label">✨ Năm</div>
                    </div>
                </div>
            )}

            {milestones.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🎯</div>
                    <p>Chưa có mốc kỷ niệm nào. Hãy thêm ngay!</p>
                    <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowModal(true)}>
                        ➕ Thêm mốc đầu tiên
                    </button>
                </div>
            ) : viewMode === 'timeline' ? (
                <div>
                    {Object.keys(groupedMilestones).sort((a, b) => a - b).map(year => (
                        <div key={year} style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <h2 style={{
                                    background: 'var(--gradient-love)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    fontSize: '1.5rem',
                                    fontWeight: '700'
                                }}>
                                    {year}
                                </h2>
                                <div style={{ flex: 1, height: '2px', background: 'var(--gradient-love)', opacity: 0.3 }} />
                            </div>

                            <div className="timeline">
                                {groupedMilestones[year].map(milestone => {
                                    const daysFromStart = getDaysFromStart(milestone.date)
                                    const daysAgo = getDaysUntilToday(milestone.date)
                                    const images = getImageList(milestone)

                                    return (
                                        <div className="timeline-item" key={milestone.id}>
                                            <div className="timeline-icon">{milestone.icon || '💕'}</div>
                                            <div className="timeline-content">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                    <div className="timeline-date">
                                                        {new Date(milestone.date).toLocaleDateString('vi-VN', {
                                                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                                        })}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                        {daysFromStart > 0 && (
                                                            <span style={{ padding: '0.25rem 0.5rem', background: 'rgba(33,150,243,0.2)', borderRadius: '20px', fontSize: '0.75rem', color: 'var(--accent-blue)' }}>
                                                                Ngày thứ {daysFromStart}
                                                            </span>
                                                        )}
                                                        <span style={{ padding: '0.25rem 0.5rem', background: 'var(--bg-primary)', borderRadius: '20px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                            {daysAgo === 0 ? 'Hôm nay' : daysAgo < 0 ? `Còn ${-daysAgo} ngày` : `${daysAgo} ngày trước`}
                                                        </span>
                                                    </div>
                                                </div>

                                                <h3 style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>{milestone.title}</h3>

                                                {milestone.description && (
                                                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{milestone.description}</p>
                                                )}

                                                {/* Images Gallery */}
                                                {images.length > 0 && (
                                                    <div style={{ marginTop: '1rem' }}>
                                                        <div style={{
                                                            display: 'grid',
                                                            gridTemplateColumns: images.length === 1 ? '1fr' : 'repeat(auto-fill, minmax(100px, 1fr))',
                                                            gap: '0.5rem'
                                                        }}>
                                                            {images.slice(0, 4).map((url, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    style={{
                                                                        position: 'relative',
                                                                        aspectRatio: images.length === 1 ? '16/9' : '1',
                                                                        borderRadius: '8px',
                                                                        overflow: 'hidden',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                    onClick={() => setViewingImages({ images, startIndex: idx })}
                                                                >
                                                                    <img
                                                                        src={url}
                                                                        alt=""
                                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                    />
                                                                    {idx === 3 && images.length > 4 && (
                                                                        <div style={{
                                                                            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
                                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                            color: 'white', fontSize: '1.25rem', fontWeight: '600'
                                                                        }}>
                                                                            +{images.length - 4}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                                    <button className="btn btn-secondary" onClick={() => openEdit(milestone)}>✏️ Sửa</button>
                                                    <button className="btn btn-secondary" onClick={() => handleDelete(milestone.id)}>🗑️</button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Grid View */
                <div className="card-grid">
                    {milestones.map(milestone => {
                        const daysAgo = getDaysUntilToday(milestone.date)
                        const images = getImageList(milestone)
                        return (
                            <div className="card" key={milestone.id}>
                                {images.length > 0 && (
                                    <div
                                        style={{
                                            marginBottom: '1rem',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            aspectRatio: '16/9',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => setViewingImages({ images, startIndex: 0 })}
                                    >
                                        <img src={images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        {images.length > 1 && (
                                            <div style={{
                                                marginTop: '-2rem',
                                                padding: '0.25rem 0.5rem',
                                                background: 'rgba(0,0,0,0.6)',
                                                color: 'white',
                                                fontSize: '0.75rem',
                                                textAlign: 'center'
                                            }}>
                                                📷 {images.length} ảnh
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '0.5rem' }}>
                                    {milestone.icon || '💕'}
                                </div>
                                <div style={{ color: 'var(--accent-blue)', fontSize: '0.875rem', textAlign: 'center', marginBottom: '0.5rem' }}>
                                    {new Date(milestone.date).toLocaleDateString('vi-VN')}
                                </div>
                                <h3 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>{milestone.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center', marginBottom: '1rem' }}>
                                    {daysAgo === 0 ? '🎉 Hôm nay!' : daysAgo < 0 ? `⏰ Còn ${-daysAgo} ngày` : `${daysAgo} ngày trước`}
                                </p>
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                    <button className="btn btn-secondary" onClick={() => openEdit(milestone)}>✏️</button>
                                    <button className="btn btn-secondary" onClick={() => handleDelete(milestone.id)}>🗑️</button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editingMilestone ? '✏️ Sửa mốc' : '🎯 Thêm mốc kỷ niệm'}</h2>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Tiêu đề *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    placeholder="Ví dụ: Ngày hẹn hò đầu tiên..."
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Ngày *</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={form.date}
                                    onChange={e => setForm({ ...form, date: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Mô tả</label>
                                <textarea
                                    className="form-textarea"
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    placeholder="Kể thêm về kỷ niệm này..."
                                    style={{ minHeight: '80px' }}
                                />
                            </div>

                            {/* Image Upload */}
                            <div className="form-group">
                                <label className="form-label">📷 Ảnh kỷ niệm</label>

                                {/* Existing images */}
                                {form.images.length > 0 && (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                                        gap: '0.5rem',
                                        marginBottom: '1rem'
                                    }}>
                                        {form.images.map((url, idx) => (
                                            <div key={idx} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden' }}>
                                                <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(idx)}
                                                    style={{
                                                        position: 'absolute', top: '4px', right: '4px',
                                                        background: 'rgba(255,0,0,0.8)', color: 'white',
                                                        border: 'none', borderRadius: '50%',
                                                        width: '24px', height: '24px', cursor: 'pointer',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Upload button */}
                                <label style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    gap: '0.5rem', padding: '1rem',
                                    border: '2px dashed var(--accent-blue)',
                                    borderRadius: '12px', cursor: 'pointer',
                                    background: 'rgba(33,150,243,0.05)',
                                    transition: 'all 0.2s'
                                }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageUpload}
                                        style={{ display: 'none' }}
                                        disabled={uploading}
                                    />
                                    {uploading ? (
                                        <span>⏳ Đang tải lên...</span>
                                    ) : (
                                        <>
                                            <span style={{ fontSize: '1.5rem' }}>📷</span>
                                            <span>Thêm ảnh (có thể chọn nhiều)</span>
                                        </>
                                    )}
                                </label>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Biểu tượng</label>
                                <div className="mood-grid">
                                    {icons.map(icon => (
                                        <div
                                            key={icon}
                                            className={`mood-option ${form.icon === icon ? 'selected' : ''}`}
                                            onClick={() => setForm({ ...form, icon })}
                                        >
                                            <span className="mood-emoji">{icon}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={uploading}>
                                {editingMilestone ? '💾 Cập nhật' : '➕ Thêm mốc kỷ niệm'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Image Viewer Modal */}
            {viewingImages && (
                <div
                    className="modal-overlay"
                    onClick={() => setViewingImages(null)}
                    style={{ background: 'rgba(0,0,0,0.95)' }}
                >
                    <div style={{
                        position: 'relative',
                        maxWidth: '90vw',
                        maxHeight: '90vh',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                setViewingImages(prev => ({
                                    ...prev,
                                    startIndex: (prev.startIndex - 1 + prev.images.length) % prev.images.length
                                }))
                            }}
                            style={{
                                background: 'rgba(255,255,255,0.2)', border: 'none',
                                color: 'white', fontSize: '2rem', padding: '1rem',
                                borderRadius: '50%', cursor: 'pointer'
                            }}
                        >
                            ‹
                        </button>

                        <img
                            src={viewingImages.images[viewingImages.startIndex]}
                            alt=""
                            onClick={e => e.stopPropagation()}
                            style={{
                                maxWidth: '80vw',
                                maxHeight: '85vh',
                                objectFit: 'contain',
                                borderRadius: '8px'
                            }}
                        />

                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                setViewingImages(prev => ({
                                    ...prev,
                                    startIndex: (prev.startIndex + 1) % prev.images.length
                                }))
                            }}
                            style={{
                                background: 'rgba(255,255,255,0.2)', border: 'none',
                                color: 'white', fontSize: '2rem', padding: '1rem',
                                borderRadius: '50%', cursor: 'pointer'
                            }}
                        >
                            ›
                        </button>
                    </div>

                    <div style={{
                        position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
                        color: 'white', fontSize: '0.875rem'
                    }}>
                        {viewingImages.startIndex + 1} / {viewingImages.images.length}
                    </div>

                    <button
                        onClick={() => setViewingImages(null)}
                        style={{
                            position: 'absolute', top: '1rem', right: '1rem',
                            background: 'transparent', border: 'none',
                            color: 'white', fontSize: '2rem', cursor: 'pointer'
                        }}
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    )
}

export default Milestones
