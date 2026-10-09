import api from './api'

export const listar = () => api.get('/api/alunos').then((r) => r.data)

export const buscarPorId = (id) => api.get(`/api/alunos/${id}`).then((r) => r.data)

export const criar = (dados) => api.post('/api/alunos', dados).then((r) => r.data)

export const atualizar = (id, dados) => api.put(`/api/alunos/${id}`, dados).then((r) => r.data)

export const excluir = (id) => api.delete(`/api/alunos/${id}`)