import { createRouter, createWebHistory } from 'vue-router'
import { limparSessao, sessaoValida } from '../auth/auth'
import LoginView from '../views/LoginView.vue'
import AlunosListView from '../views/AlunosListView.vue'
import AlunoFormView from '../views/AlunoFormView.vue'

const routes = [
  { path: '/', redirect: { name: 'alunos' } },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/alunos', name: 'alunos', component: AlunosListView, meta: { requiresAuth: true } },
  { path: '/alunos/novo', name: 'aluno-novo', component: AlunoFormView, meta: { requiresAuth: true } },
  { path: '/alunos/:id/editar', name: 'aluno-editar', component: AlunoFormView, meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', redirect: { name: 'alunos' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Route Guard: rotas protegidas exigem token válido.
router.beforeEach((to) => {
  const logado = sessaoValida()

  if (to.meta.requiresAuth && !logado) {
    limparSessao()
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'login' && logado) {
    return { name: 'alunos' }
  }
})

export default router