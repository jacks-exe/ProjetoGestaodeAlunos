<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { salvarSessao } from '../auth/auth'
import { login } from '../services/authService'
import { extrairErro } from '../services/api'
import { softBlurIn } from '../utils/motion'

const route = useRoute()
const router = useRouter()

const username = ref('')
const password = ref('')
const erro = ref(route.query.expired ? 'Sua sessão expirou. Faça login novamente.' : '')
const carregando = ref(false)

async function entrar() {
  erro.value = ''
  carregando.value = true
  try {
    const dados = await login(username.value.trim(), password.value)
    salvarSessao(dados)
    router.push(route.query.redirect || { name: 'alunos' })
  } catch (e) {
    erro.value = extrairErro(e).mensagem
  } finally {
    carregando.value = false
  }
}

// Entrada do título (soft-blur-in): toca uma vez ao abrir a tela e respeita
// prefers-reduced-motion (ver utils/motion.js).
const titulo = ref(null)
let cancelarAnimacao = null

onMounted(() => {
  cancelarAnimacao = softBlurIn(titulo.value)
})

onBeforeUnmount(() => {
  cancelarAnimacao?.()
})
</script>

<template>
  <main class="container container-estreito pagina-centrada">
    <header class="cabecalho-pagina">
      <div>
        <h1 ref="titulo">Sistema de Gestão de Alunos</h1>
        <p class="texto-apoio">Entre para cadastrar e consultar alunos.</p>
      </div>
    </header>

    <form class="card" @submit.prevent="entrar">
      <p v-if="erro" class="alerta alerta-erro" role="alert">{{ erro }}</p>

      <div class="campo">
        <label for="username">Usuário</label>
        <input
          id="username"
          v-model="username"
          class="input"
          type="text"
          autocomplete="username"
          autocapitalize="none"
          spellcheck="false"
          required
          autofocus
        />
      </div>

      <div class="campo">
        <label for="password">Senha</label>
        <input
          id="password"
          v-model="password"
          class="input"
          type="password"
          autocomplete="current-password"
          required
        />
      </div>

      <div class="card-rodape">
        <button
          type="submit"
          class="btn btn-primario btn-grande btn-bloco"
          :disabled="carregando"
          :aria-busy="carregando"
        >
          {{ carregando ? 'Entrando...' : 'Entrar' }}
        </button>
      </div>
    </form>
  </main>
</template>