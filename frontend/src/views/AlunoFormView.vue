<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { atualizar, buscarPorId, criar } from '../services/alunoService'
import { extrairErro } from '../services/api'
import { definirFlash } from '../utils/flash'

const route = useRoute()
const router = useRouter()

const id = route.params.id
const editando = computed(() => Boolean(id))

const form = reactive({
  nome: '',
  email: '',
  cpf: '',
  curso: '',
  idade: null,
  ativo: true,
})

const erro = ref('')
const detalhes = ref([])
const carregando = ref(false)
const salvando = ref(false)

function mascararCpf(valor) {
  const digitos = valor.replace(/\D/g, '').slice(0, 11)
  return digitos
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2')
}

function mostrarErro(e) {
  const { mensagem, detalhes: lista } = extrairErro(e)
  erro.value = mensagem
  detalhes.value = lista
}

async function carregarAluno() {
  carregando.value = true
  try {
    const aluno = await buscarPorId(id)
    Object.assign(form, {
      nome: aluno.nome,
      email: aluno.email,
      cpf: aluno.cpf,
      curso: aluno.curso,
      idade: aluno.idade,
      ativo: aluno.ativo,
    })
  } catch (e) {
    mostrarErro(e)
  } finally {
    carregando.value = false
  }
}

async function salvar() {
  erro.value = ''
  detalhes.value = []
  salvando.value = true
  try {
    const dados = { ...form, idade: Number(form.idade) }
    if (editando.value) {
      await atualizar(id, dados)
      definirFlash('Aluno atualizado com sucesso')
    } else {
      await criar(dados)
      definirFlash('Aluno cadastrado com sucesso')
    }
    router.push({ name: 'alunos' })
  } catch (e) {
    mostrarErro(e)
  } finally {
    salvando.value = false
  }
}

onMounted(() => {
  if (editando.value) carregarAluno()
})
</script>

<template>
  <main class="container container-medio">
    <h1>{{ editando ? 'Editar aluno' : 'Cadastrar aluno' }}</h1>

    <p v-if="carregando">Carregando...</p>

    <form v-else class="card" @submit.prevent="salvar">
      <div v-if="erro" class="alerta alerta-erro" role="alert">
        <p>{{ erro }}</p>
        <ul v-if="detalhes.length">
          <li v-for="detalhe in detalhes" :key="detalhe">{{ detalhe }}</li>
        </ul>
      </div>

      <label for="nome">Nome</label>
      <input id="nome" v-model="form.nome" type="text" maxlength="100" required />

      <label for="email">E-mail</label>
      <input id="email" v-model="form.email" type="email" maxlength="150" required />

      <label for="cpf">CPF</label>
      <input
        id="cpf"
        :value="form.cpf"
        type="text"
        maxlength="14"
        placeholder="000.000.000-00"
        required
        @input="form.cpf = mascararCpf($event.target.value)"
      />

      <label for="curso">Curso</label>
      <input id="curso" v-model="form.curso" type="text" maxlength="100" required />

      <label for="idade">Idade</label>
      <input id="idade" v-model="form.idade" type="number" min="16" max="100" required />

      <label class="checkbox">
        <input v-model="form.ativo" type="checkbox" />
        Aluno ativo
      </label>

      <div class="form-acoes">
        <button type="submit" class="btn btn-primario" :disabled="salvando">
          {{ salvando ? 'Salvando...' : 'Salvar' }}
        </button>
        <RouterLink :to="{ name: 'alunos' }" class="btn">Cancelar</RouterLink>
      </div>
    </form>
  </main>
</template>