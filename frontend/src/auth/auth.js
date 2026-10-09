import { computed, reactive } from 'vue'

const CHAVE_TOKEN = 'token'
const CHAVE_USUARIO = 'username'

const estado = reactive({
  token: localStorage.getItem(CHAVE_TOKEN),
  username: localStorage.getItem(CHAVE_USUARIO),
})

export const usuarioLogado = computed(() => estado.username)

export function getToken() {
  return estado.token
}

export function salvarSessao({ token, username }) {
  estado.token = token
  estado.username = username
  localStorage.setItem(CHAVE_TOKEN, token)
  localStorage.setItem(CHAVE_USUARIO, username)
}

export function limparSessao() {
  estado.token = null
  estado.username = null
  localStorage.removeItem(CHAVE_TOKEN)
  localStorage.removeItem(CHAVE_USUARIO)
}

/** Existe token e ele ainda não expirou (checagem local; o backend é quem decide de fato). */
export function sessaoValida() {
  if (!estado.token) return false
  try {
    const payload = JSON.parse(atob(estado.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload.exp * 1000 > Date.now()
  } catch {
    return false
  }
}