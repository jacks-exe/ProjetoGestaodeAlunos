/**
 * Animações da interface, feitas só com recursos nativos do navegador:
 * Web Animations API (Element.animate) e requestAnimationFrame. Sem bibliotecas.
 *
 * Toda animação respeita prefers-reduced-motion: com a preferência ativa nada é
 * animado e o conteúdo aparece direto, no estado final.
 *
 * Tempos em milissegundos.
 */

// Curvas equivalentes às que usávamos antes (power2.out e power3.out do GSAP).
const EASING = {
  suave: 'cubic-bezier(0.215, 0.61, 0.355, 1)', // ease-out cúbica
  forte: 'cubic-bezier(0.165, 0.84, 0.44, 1)', // ease-out quártica
}

const CONSULTA_MOVIMENTO_REDUZIDO = '(prefers-reduced-motion: reduce)'

/** true quando o usuário pediu menos movimento (ou quando não há navegador para animar). */
export function movimentoReduzido() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return true
  return window.matchMedia(CONSULTA_MOVIMENTO_REDUZIDO).matches
}

function emLista(alvos) {
  if (!alvos) return []
  if (typeof alvos.animate === 'function') return [alvos]
  return Array.from(alvos).filter((el) => el && typeof el.animate === 'function')
}

const nada = () => {}

/**
 * soft-blur-in: o texto surge saindo de um desfoque leve e sobe poucos pixels.
 * Toca uma única vez por chamada (sem loop). Ao terminar, o elemento volta ao
 * estilo natural, sem deixar valores inline.
 *
 * @param alvos elemento ou lista de elementos
 * @returns função que cancela a animação; chame em onBeforeUnmount
 */
export function softBlurIn(
  alvos,
  { atraso = 0, duracao = 700, desfoque = 8, deslocamento = 8, escalonamento = 80 } = {},
) {
  if (movimentoReduzido()) return nada

  const animacoes = emLista(alvos).map((el, indice) =>
    el.animate(
      [
        { opacity: 0, transform: `translateY(${deslocamento}px)`, filter: `blur(${desfoque}px)` },
        { opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' },
      ],
      {
        duration: duracao,
        delay: atraso + indice * escalonamento,
        easing: EASING.suave,
        fill: 'backwards', // mantém o estado inicial durante o atraso
      },
    ),
  )

  return () => animacoes.forEach((animacao) => animacao.cancel())
}

/**
 * Contagem de números. A WAAPI não anima texto, então o valor é calculado quadro
 * a quadro e entregue em `aoAtualizar` (a tela guarda o número num estado reativo,
 * o que evita mexer no DOM que o Vue controla). Curva ease-out quártica.
 *
 * @returns função que cancela a contagem
 */
export function contar({ de = 0, para, duracao = 1100, atraso = 0, aoAtualizar }) {
  if (movimentoReduzido() || de === para) {
    aoAtualizar(para)
    return nada
  }

  let quadro = 0
  let cancelada = false
  let inicio = null

  const passo = (agora) => {
    if (cancelada) return
    if (inicio === null) inicio = agora

    const progresso = Math.min(Math.max((agora - inicio - atraso) / duracao, 0), 1)
    const suavizado = 1 - (1 - progresso) ** 4
    aoAtualizar(progresso >= 1 ? para : Math.round(de + (para - de) * suavizado))

    if (progresso < 1) quadro = requestAnimationFrame(passo)
  }

  quadro = requestAnimationFrame(passo)

  return () => {
    cancelada = true
    cancelAnimationFrame(quadro)
  }
}

/**
 * Anima a largura de um elemento (em %) de um valor a outro. Ao terminar, vale a
 * largura que a folha de estilo já define, então o estado final nunca fica preso.
 */
export function animarLargura(el, dePct, paraPct, { duracao = 1100, atraso = 0 } = {}) {
  if (movimentoReduzido() || !el || typeof el.animate !== 'function' || dePct === paraPct) {
    return nada
  }

  const animacao = el.animate([{ width: `${dePct}%` }, { width: `${paraPct}%` }], {
    duration: duracao,
    delay: atraso,
    easing: EASING.forte,
    fill: 'backwards',
  })

  return () => animacao.cancel()
}

/**
 * crossfade: depois que o conteúdo de um elemento muda, o novo conteúdo aparece
 * com uma transição curta de opacidade em vez de trocar de uma vez.
 * Chame depois que o DOM atualizar (watch com flush: 'post').
 */
export function crossfade(el, { duracao = 180 } = {}) {
  if (movimentoReduzido() || !el || typeof el.animate !== 'function') return nada

  const animacao = el.animate([{ opacity: 0.2 }, { opacity: 1 }], {
    duration: duracao,
    easing: 'ease-in-out',
  })

  return () => animacao.cancel()
}