<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { salvarSessao } from '../auth/auth'
import { login } from '../services/authService'
import { extrairErro } from '../services/api'

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
</script>

<template>
  <main class="container container-estreito">
    <h1>Sistema de Gestão de Alunos</h1>

    <form class="card" @submit.prevent="entrar">
      <h2>Entrar</h2>

      <p v-if="erro" class="alerta alerta-erro" role="alert">{{ erro }}</p>

      <label for="username">Usuário</label>
      <input id="username" v-model="username" type="text" autocomplete="username" required autofocus />

      <label for="password">Senha</label>
      <input id="password" v-model="password" type="password" autocomplete="current-password" required />

      <button type="submit" class="btn btn-primario" :disabled="carregando">
        {{ carregando ? 'Entrando...' : 'Entrar' }}
      </button>
    </form>
  </main>
</template>