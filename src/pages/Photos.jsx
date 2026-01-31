import { useState, useEffect } from 'react'
import { api } from '../api/api'

function Photos({ user }) {
    const [photos, setPhotos] = useState([])
    const [albums, setAlbums] = useState([])
    const [selectedAlbum, setSelectedAlbum] = useState('')
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [showAlbumModal, setShowAlbumModal] = useState(false)
    const [viewingPhoto, setViewingPhoto] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [file, setFile] = useState(null)
    const [caption, setCaption] = useState('')
    const [album, setAlbum] = useState('')
    const [newAlbum, setNewAlbum] = useState('')

    useEffect(() => {
        loadPhotos()
        loadAlbums()
    }, [selectedAlbum])

    const loadPhotos = async () => {
        try {
            const url = selectedAlbum ? `/api/photos?album=${encodeURIComponent(selectedAlbum)}` : '/api/photos'
            const res = await api.get(url)
            if (res.success) {
                setPhotos(res.data.photos || res.data.content || res.data || [])
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const loadAlbums = async () => {
        try {
            const res = await api.get('/api/photos/albums')
            if (res.success) {
                setAlbums(res.data || [])
            }
        } catch (err) {
            console.error(err)
        }
    }

    const handleUpload = async (e) => {
        e.preventDefault()
        if (!file) return

        setUploading(true)
        try {
            const finalAlbum = newAlbum || album
            const res = await api.upload('/api/photos', file, {
                caption,
                album: finalAlbum,
                newAlbum: newAlbum
            })
            if (res.success) {
                loadPhotos()
                loadAlbums() // Reload albums in case new one was created
                setShowModal(false)
                resetForm()
            }
        } catch (err) {
            console.error(err)
        } finally {
            setUploading(false)
        }
    }

    const handleCreateAlbum = () => {
        if (!newAlbum.trim()) return
        // Album will be created when first photo is added
        setShowAlbumModal(false)
        setAlbum(newAlbum)
        setNewAlbum('')
        setShowModal(true) // Open upload modal with new album selected
    }

    const resetForm = () => {
        setFile(null)
        setCaption('')
        setAlbum('')
        setNewAlbum('')
    }

    const handleDelete = async (id) => {
        if (!confirm('Xóa ảnh này?')) return
        try {
            await api.delete(`/api/photos/${id}`)
            setPhotos(photos.filter(p => p.id !== id))
            setViewingPhoto(null)
        } catch (err) {
            console.error(err)
        }
    }

    // user prop structure: { user: {...}, partner: {...} }
    const currentUser = user?.user
    const partnerUser = user?.partner

    const getUploaderName = (uploaderId) => {
        const id = String(uploaderId)

        // Check by current user
        if (currentUser?.id && id === String(currentUser.id)) {
            return currentUser.name || 'Bạn'
        }
        // Check by partner
        if (partnerUser?.id && id === String(partnerUser.id)) {
            return partnerUser.name || 'Người yêu'
        }
        // Hardcoded fallback
        if (id === '1') return 'Thúi 💙'
        if (id === '2') return 'Dịu 💗'
        return `Unknown (${id})`
    }

    if (loading) {
        return <div className="loading-screen"><div className="heart-loader">📸</div></div>
    }

    return (
        <div>
            <header className="page-header">
                <h1 className="page-title">📸 Ảnh kỷ niệm</h1>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary" onClick={() => setShowAlbumModal(true)}>
                        📁 Tạo album
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        ➕ Thêm ảnh
                    </button>
                </div>
            </header>

            {/* Album Filter */}
            {albums.length > 0 && (
                <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                        className={`btn ${selectedAlbum === '' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setSelectedAlbum('')}
                        style={{ padding: '0.5rem 1rem' }}
                    >
                        📷 Tất cả
                    </button>
                    {albums.map(a => (
                        <button
                            key={a}
                            className={`btn ${selectedAlbum === a ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setSelectedAlbum(a)}
                            style={{ padding: '0.5rem 1rem' }}
                        >
                            📁 {a}
                        </button>
                    ))}
                </div>
            )}

            {/* Stats */}
            <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="stat-card">
                    <div className="stat-value">{photos.length}</div>
                    <div className="stat-label">📷 Ảnh</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{albums.length}</div>
                    <div className="stat-label">📁 Album</div>
                </div>
            </div>

            {photos.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📷</div>
                    <p>{selectedAlbum ? `Chưa có ảnh trong album "${selectedAlbum}"` : 'Chưa có ảnh nào. Hãy thêm kỷ niệm đầu tiên!'}</p>
                    <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowModal(true)}>
                        ➕ Thêm ảnh đầu tiên
                    </button>
                </div>
            ) : (
                <div className="photo-grid">
                    {photos.map(photo => (
                        <div
                            className="photo-card"
                            key={photo.id}
                            onClick={() => setViewingPhoto(photo)}
                            style={{ cursor: 'pointer' }}
                        >
                            <img src={photo.url} alt={photo.caption} />
                            <div className="photo-overlay">
                                <p style={{ fontWeight: '600' }}>{photo.caption || 'Không có mô tả'}</p>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginTop: '0.5rem',
                                    fontSize: '0.75rem'
                                }}>
                                    <span>📷 {getUploaderName(photo.uploaderId)}</span>
                                    {photo.album && <span>📁 {photo.album}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* View Photo Modal */}
            {viewingPhoto && (
                <div
                    className="modal-overlay"
                    onClick={() => setViewingPhoto(null)}
                    style={{ background: 'rgba(0,0,0,0.95)' }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '90vw', maxHeight: '90vh' }}>
                        <img
                            src={viewingPhoto.url}
                            alt={viewingPhoto.caption}
                            onClick={e => e.stopPropagation()}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '70vh',
                                objectFit: 'contain',
                                borderRadius: '8px'
                            }}
                        />
                        <div
                            onClick={e => e.stopPropagation()}
                            style={{
                                background: 'var(--bg-secondary)',
                                padding: '1rem 1.5rem',
                                borderRadius: '12px',
                                marginTop: '1rem',
                                textAlign: 'center',
                                minWidth: '300px'
                            }}
                        >
                            <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                                {viewingPhoto.caption || 'Không có mô tả'}
                            </p>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '1rem',
                                fontSize: '0.875rem',
                                color: 'var(--text-secondary)',
                                marginBottom: '1rem'
                            }}>
                                <span>📷 Tải bởi: <strong style={{ color: 'var(--accent-blue)' }}>{getUploaderName(viewingPhoto.uploaderId)}</strong></span>
                                {viewingPhoto.album && <span>📁 {viewingPhoto.album}</span>}
                            </div>
                            <div style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-secondary)',
                                marginBottom: '1rem'
                            }}>
                                {viewingPhoto.takenAt && new Date(viewingPhoto.takenAt).toLocaleDateString('vi-VN', {
                                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                })}
                            </div>
                            <button
                                className="btn btn-secondary"
                                onClick={() => handleDelete(viewingPhoto.id)}
                            >
                                🗑️ Xóa ảnh
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={() => setViewingPhoto(null)}
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

            {/* Create Album Modal */}
            {showAlbumModal && (
                <div className="modal-overlay" onClick={() => setShowAlbumModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">📁 Tạo album mới</h2>
                            <button className="modal-close" onClick={() => setShowAlbumModal(false)}>×</button>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Tên album</label>
                            <input
                                type="text"
                                className="form-input"
                                value={newAlbum}
                                onChange={e => setNewAlbum(e.target.value)}
                                placeholder="Ví dụ: Kỷ niệm 2024, Du lịch..."
                                autoFocus
                            />
                        </div>

                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                            💡 Album sẽ được tạo khi bạn thêm ảnh đầu tiên vào đó.
                        </p>

                        <button
                            className="btn btn-primary"
                            onClick={handleCreateAlbum}
                            disabled={!newAlbum.trim()}
                        >
                            ➕ Tạo và thêm ảnh
                        </button>
                    </div>
                </div>
            )}

            {/* Upload Photo Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">📸 Thêm ảnh mới</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>

                        <form onSubmit={handleUpload}>
                            <div className="form-group">
                                <label className="form-label">Chọn ảnh *</label>
                                <label style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    gap: '0.5rem', padding: '2rem',
                                    border: '2px dashed var(--accent-blue)',
                                    borderRadius: '12px', cursor: 'pointer',
                                    background: file ? 'rgba(33,150,243,0.1)' : 'transparent'
                                }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={e => setFile(e.target.files[0])}
                                    />
                                    {file ? (
                                        <span>✅ {file.name}</span>
                                    ) : (
                                        <>
                                            <span style={{ fontSize: '2rem' }}>📷</span>
                                            <span>Click để chọn ảnh</span>
                                        </>
                                    )}
                                </label>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Mô tả</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={caption}
                                    onChange={e => setCaption(e.target.value)}
                                    placeholder="Khoảnh khắc đáng nhớ..."
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Album</label>
                                <select
                                    className="form-select"
                                    value={album}
                                    onChange={e => setAlbum(e.target.value)}
                                >
                                    <option value="">-- Không có album --</option>
                                    {albums.map(a => (
                                        <option key={a} value={a}>{a}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Hoặc tạo album mới</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newAlbum}
                                    onChange={e => setNewAlbum(e.target.value)}
                                    placeholder="Tên album mới..."
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={uploading || !file}>
                                {uploading ? '⏳ Đang tải...' : '📤 Tải lên'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Photos
