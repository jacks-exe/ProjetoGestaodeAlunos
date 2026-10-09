<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { limparSessao, usuarioLogado } from '../auth/auth'
import { excluir, listar } from '../services/alunoService'
import { extrairErro } from '../services/api'
import { consumirFlash } from '../utils/flash'

const router = useRouter()

const alunos = ref([])
const carregando = ref(true)
const erro = ref('')
const sucesso = ref(consumirFlash())

async function carregar() {
  carregando.value = true
  try {
    alunos.value = await listar()
  } catch (e) {
    erro.value = extrairErro(e).mensagem
  } finally {
    carregando.value = false
  }
}

async function remover(aluno) {
  if (!confirm(`Deseja excluir o aluno "${aluno.nome}"?`)) return

  erro.value = ''
  sucesso.value = ''
  try {
    await excluir(aluno.id)
    sucesso.value = 'Aluno excluído com sucesso'
  } catch (e) {
    erro.value = extrairErro(e).mensagem
  }
  await carregar()
}

function sair() {
  limparSessao()
  router.push({ name: 'login' })
}

const formatarData = (iso) => (iso ? new Date(iso).toLocaleString('pt-BR') : '-')

onMounted(carregar)
</script>

<template>
  <main class="container">
    <header class="topo">
      <h1>Alunos</h1>
      <div class="topo-acoes">
        <span class="usuario">Olá, {{ usuarioLogado }}</span>
        <RouterLink :to="{ name: 'aluno-novo' }" class="btn btn-primario">Cadastrar aluno</RouterLink>
        <button type="button" class="btn" @click="sair">Sair</button>
      </div>
    </header>

    <p v-if="sucesso" class="alerta alerta-sucesso" role="status">{{ sucesso }}</p>
    <p v-if="erro" class="alerta alerta-erro" role="alert">{{ erro }}</p>

    <p v-if="carregando">Carregando...</p>
    <p v-else-if="alunos.length === 0 && !erro">Nenhum aluno cadastrado.</p>

    <div v-else-if="alunos.length" class="tabela-wrapper">
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>CPF</th>
            <th>Curso</th>
            <th>Idade</th>
            <th>Status</th>
            <th>Cadastro</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="aluno in alunos" :key="aluno.id">
            <td>{{ aluno.nome }}</td>
            <td>{{ aluno.email }}</td>
            <td>{{ aluno.cpf }}</td>
            <td>{{ aluno.curso }}</td>
            <td>{{ aluno.idade }}</td>
            <td>
              <span class="selo" :class="aluno.ativo ? 'selo-ativo' : 'selo-inativo'">
                {{ aluno.ativo ? 'Ativo' : 'Inativo' }}
              </span>
            </td>
            <td>{{ formatarData(aluno.dataCadastro) }}</td>
            <td class="acoes">
              <RouterLink :to="{ name: 'aluno-editar', params: { id: aluno.id } }" class="btn btn-pequeno">
                Editar
              </RouterLink>
              <button type="button" class="btn btn-pequeno btn-perigo" @click="remover(aluno)">
                Excluir
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>