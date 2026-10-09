<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { limparSessao, usuarioLogado } from './auth/auth'

const route = useRoute()
const router = useRouter()

// A barra só aparece fora do login. `route.name` fica vazio até a primeira
// navegação terminar, então a barra também não pisca durante o carregamento.
const mostrarBarra = computed(() => Boolean(route.name) && route.name !== 'login')

function sair() {
  limparSessao()
  router.push({ name: 'login' })
}
</script>

<template>
  <header v-if="mostrarBarra" class="app-barra">
    <div class="app-barra-conteudo">
      <RouterLink :to="{ name: 'alunos' }" class="app-marca">Gestão de Alunos</RouterLink>

      <div class="app-barra-acoes">
        <span class="app-usuario">Olá, {{ usuarioLogado }}</span>
        <button type="button" class="btn btn-fantasma btn-pequeno" @click="sair">Sair</button>
      </div>
    </div>
  </header>

  <RouterView />
</template>