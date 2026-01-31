const API_BASE = 'https://ourlove5504-gtr5j.ondigitalocean.app'

export const api = {
    async get(url) {
        const res = await fetch(`${API_BASE}${url}`, {
            credentials: 'include'
        })
        return res.json()
    },

    async post(url, data) {
        const res = await fetch(`${API_BASE}${url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            credentials: 'include'
        })
        return res.json()
    },

    async put(url, data) {
        const res = await fetch(`${API_BASE}${url}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            credentials: 'include'
        })
        return res.json()
    },

    async delete(url) {
        const res = await fetch(`${API_BASE}${url}`, {
            method: 'DELETE',
            credentials: 'include'
        })
        return res.json()
    },

    async upload(url, file, data = {}) {
        const formData = new FormData()
        formData.append('file', file)
        Object.keys(data).forEach(key => {
            formData.append(key, data[key])
        })

        const res = await fetch(`${API_BASE}${url}`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        })
        return res.json()
    }
}
