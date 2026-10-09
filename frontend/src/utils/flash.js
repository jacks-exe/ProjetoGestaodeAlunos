import { ref } from 'vue'

/** Mensagem de sucesso que sobrevive à navegação entre telas (exibida uma única vez). */
const mensagem = ref('')

export function definirFlash(texto) {
  mensagem.value = texto
}

export function consumirFlash() {
  const texto = mensagem.value
  mensagem.value = ''
  return texto
}