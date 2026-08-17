import apiClient from './config.js'

const tasksApi = {
  getAll() {
    return apiClient.get('/tasks')
  },

  create(payload) {
    const request = payload
    if (payload.imgAttachmentKey != null) {
      request.img_attachment_key = payload.imgAttachmentKey
    }
    if (payload.location != null) {
      request.location = payload.location
    }
    return apiClient.post('/tasks', request)
  },

  update(id, data) {
    return apiClient.patch(`/tasks/${id}`, data)
  },

  remove(id) {
    return apiClient.delete(`/tasks/${id}`)
  },

  uploadImage(file, description = '') {
    const formData = new FormData()
    formData.append('file', file)
    if (description) formData.append('description', description)
    return apiClient.post('/uploads/images/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export default tasksApi