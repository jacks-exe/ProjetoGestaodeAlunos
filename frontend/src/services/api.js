import axios from 'axios'
import { getToken, limparSessao } from '../auth/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
})

// Injeta o JWT em todas as requisições.
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Token inválido/expirado em qualquer rota (exceto o próprio login) => volta para o login.
api.interceptors.response.use(
  (resposta) => resposta,
  async (erro) => {
    const ehLogin = erro.config?.url?.includes('/api/auth/login')
    if (erro.response?.status === 401 && !ehLogin) {
      limparSessao()
      // import dinâmico evita dependência circular (router -> views -> api -> router)
      const { default: router } = await import('../router')
      if (router.currentRoute.value.name !== 'login') {
        router.push({ name: 'login', query: { expired: '1' } })
      }
    }
    return Promise.reject(erro)
  },
)

/** Converte o erro do Axios em { mensagem, detalhes[] } para exibir na tela. */
export function extrairErro(erro) {
  if (!erro.response) {
    return { mensagem: 'Não foi possível conectar ao servidor', detalhes: [] }
  }
  const dados = erro.response.data
  return {
    mensagem: dados?.mensagem || 'Ocorreu um erro inesperado',
    detalhes: Array.isArray(dados?.detalhes) ? dados.detalhes : [],
  }
}

export default api