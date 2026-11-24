// ============================================================
// JOGO: NO COIN — Pensamento Computacional (Lógica nos Trilhos)
// ============================================================

// Elementos principais da tela
const telaInicio = document.getElementById("tela-inicio");
const telaJogo = document.getElementById("tela-jogo");
const telaFim = document.getElementById("tela-fim");

const textoRodada = document.getElementById("texto-rodada");
const textoPontos = document.getElementById("texto-pontos");
const textoTempo = document.getElementById("texto-tempo");
const textoRegra = document.getElementById("texto-regra");

const jogador = document.getElementById("jogador");
const estadoJogador = document.getElementById("estado-jogador");
const camadaObjetos = document.getElementById("camada-objetos");
const barraProgresso = document.getElementById("barra-progresso");
const feedbackRapido = document.getElementById("feedback-rapido");

const tituloFim = document.getElementById("titulo-fim");
const motivoFim = document.getElementById("motivo-fim");
const finalRodadas = document.getElementById("final-rodadas");
const finalPontos = document.getElementById("final-pontos");
const finalTempo = document.getElementById("final-tempo");

const btnComecar = document.getElementById("btn-comecar");
const btnReiniciar = document.getElementById("btn-reiniciar");
const btnInfinito = document.getElementById("btn-infinito");
const btnTema = document.getElementById("btn-tema");

// Botões de controle na tela
const btnEsquerda = document.getElementById("btn-esquerda");
const btnDireita = document.getElementById("btn-direita");
const btnPular = document.getElementById("btn-pular");
const btnDeslizar = document.getElementById("btn-deslizar");

// Configurações da partida
const TOTAL_RODADAS_OFICIAL = 10;
const PONTOS_POR_ACERTO = 100;

// Estado atual do jogo
let rodadaAtual = 1;
let pontos = 0;
let modoInfinito = false;
let jogoAtivo = false;
let aguardandoProximaRodada = false;

// Posição e ação do personagem (0 = Esquerda, 1 = Centro, 2 = Direita)
let trilhoAtual = 1;
let acaoAtual = "correndo"; // "correndo", "pulando" ou "deslizando"

// Controle de tempo
let tempoInicioPartida = 0;
let cronometroIntervalo = null;
let animacaoRodadaId = null;
let inicioRodadaAtual = 0;
let duracaoRodadaMs = 4500;

// Desafio atual da rodada
let desafioAtual = null;

// Banco de desafios de Lógica Condicional ("Se... então...")
// Cada desafio define a regra, os obstáculos nos 3 trilhos e a resposta certa!
const desafiosLogicos = [
  {
    regra: "SE houver VAGÃO no trilho do meio, ENTÃO vá para a ESQUERDA.",
    objetos: [
      { trilho: 0, tipo: "dado-certo", texto: "💎 DADO" },
      { trilho: 1, tipo: "vagao", texto: "🚃 VAGÃO" },
      { trilho: 2, tipo: "no-coin", texto: "🚫 NO COIN" }
    ],
    trilhoEsperado: 0,
    acaoEsperada: "correndo",
    explicacaoAcerto: "Boa! A condição era verdadeira, então você desviou para o trilho da esquerda.",
    explicacaoErro: "Como havia um vagão no meio, a regra mandava ir para o trilho da ESQUERDA."
  },
  {
    regra: "SE a barreira no seu trilho for BAIXA, ENTÃO PULE por cima dela.",
    objetos: [
      { trilho: 0, tipo: "vagao", texto: "🚃 VAGÃO" },
      { trilho: 1, tipo: "barreira-baixa", texto: "🚧 BAIXA" },
      { trilho: 2, tipo: "vagao", texto: "🚃 VAGÃO" }
    ],
    trilhoEsperado: 1,
    acaoEsperada: "pulando",
    explicacaoAcerto: "Perfeito! Pular é o comando certo para superar obstáculos baixos.",
    explicacaoErro: "Para passar por uma barreira BAIXA no trilho do meio, você precisava PULAR."
  },
  {
    regra: "SE a viga no trilho do meio for ALTA, ENTÃO DESLIZE por baixo.",
    objetos: [
      { trilho: 0, tipo: "no-coin", texto: "🚫 NO COIN" },
      { trilho: 1, tipo: "viga-alta", texto: "🏗️ VIGA ALTA" },
      { trilho: 2, tipo: "no-coin", texto: "🚫 NO COIN" }
    ],
    trilhoEsperado: 1,
    acaoEsperada: "deslizando",
    explicacaoAcerto: "Mandou bem! Deslizar evita bater na viga alta sem sair do trilho.",
    explicacaoErro: "A viga era ALTA: você deveria ficar no meio e DESLIZAR por baixo dela."
  },
  {
    regra: "SE o número 8 for PAR, ENTÃO vá para o trilho da DIREITA.",
    objetos: [
      { trilho: 0, tipo: "no-coin", texto: "🚫 NO COIN" },
      { trilho: 1, tipo: "vagao", texto: "🚃 VAGÃO" },
      { trilho: 2, tipo: "dado-certo", texto: "💎 PAR (8)" }
    ],
    trilhoEsperado: 2,
    acaoEsperada: "correndo",
    explicacaoAcerto: "Isso aí! 8 é um número par, então a condição levou você para a direita.",
    explicacaoErro: "8 é um número PAR! Por isso a regra mandava ir para a DIREITA."
  },
  {
    regra: "NUNCA pegue a moeda armadilha! SE aparecer NO COIN no meio, PULE por cima.",
    objetos: [
      { trilho: 0, tipo: "vagao", texto: "🚃 VAGÃO" },
      { trilho: 1, tipo: "no-coin", texto: "🪙 NO COIN!" },
      { trilho: 2, tipo: "vagao", texto: "🚃 VAGÃO" }
    ],
    trilhoEsperado: 1,
    acaoEsperada: "pulando",
    explicacaoAcerto: "Escapou da armadilha! Você pulou a moeda falsa e seguiu na corrida.",
    explicacaoErro: "Você encostou na moeda armadilha (NO COIN)! Era preciso PULAR por cima dela."
  },
  {
    regra: "SE 5 + 3 for igual a 9, vá para a ESQUERDA; SENÃO, vá para a DIREITA.",
    objetos: [
      { trilho: 0, tipo: "no-coin", texto: "🚫 FALSO" },
      { trilho: 1, tipo: "vagao", texto: "🚃 VAGÃO" },
      { trilho: 2, tipo: "dado-certo", texto: "💎 SENÃO" }
    ],
    trilhoEsperado: 2,
    acaoEsperada: "correndo",
    explicacaoAcerto: "Excelente! 5 + 3 é 8 (falso), então o programa executou o bloco SENÃO (Direita).",
    explicacaoErro: "5 + 3 = 8, não 9! Quando o SE é falso, o computador executa o SENÃO (DIREITA)."
  },
  {
    regra: "SE estiver no trilho da DIREITA E houver viga alta, DESLIZE.",
    objetos: [
      { trilho: 0, tipo: "vagao", texto: "🚃 VAGÃO" },
      { trilho: 1, tipo: "vagao", texto: "🚃 VAGÃO" },
      { trilho: 2, tipo: "viga-alta", texto: "🏗️ VIGA ALTA" }
    ],
    trilhoEsperado: 2,
    acaoEsperada: "deslizando",
    explicacaoAcerto: "Lógica afiada! Você foi para a direita e deslizou por baixo da viga.",
    explicacaoErro: "O único caminho livre era o trilho da DIREITA deslizando por baixo da viga alta."
  },
  {
    regra: "SE NÃO houver vagão na ESQUERDA, vá para lá; SENÃO, fique no MEIO.",
    objetos: [
      { trilho: 0, tipo: "vagao", texto: "🚃 VAGÃO" },
      { trilho: 1, tipo: "dado-certo", texto: "💎 LIVRE" },
      { trilho: 2, tipo: "no-coin", texto: "🚫 NO COIN" }
    ],
    trilhoEsperado: 1,
    acaoEsperada: "correndo",
    explicacaoAcerto: "Muito bem! Como havia vagão na esquerda, você seguiu o SENÃO e ficou no meio.",
    explicacaoErro: "Havia um vagão na esquerda! A negação (NÃO) ficou falsa, então você devia ficar no MEIO."
  },
  {
    regra: "SE 10 > 4 E 2 < 1, vá para a DIREITA; SENÃO, PULE no trilho do MEIO.",
    objetos: [
      { trilho: 0, tipo: "vagao", texto: "🚃 VAGÃO" },
      { trilho: 1, tipo: "barreira-baixa", texto: "🚧 BAIXA" },
      { trilho: 2, tipo: "no-coin", texto: "🚫 NO COIN" }
    ],
    trilhoEsperado: 1,
    acaoEsperada: "pulando",
    explicacaoAcerto: "Show! No operador E, as duas partes precisam ser verdadeiras. Como 2 < 1 é falso, você pulou no meio!",
    explicacaoErro: "No operador lógico E, tudo precisa ser verdadeiro. Como 2 < 1 é falso, valia o SENÃO (PULAR no meio)."
  },
  {
    regra: "DESAFIO FINAL: Vá para a ESQUERDA e DESLIZE por baixo do túnel!",
    objetos: [
      { trilho: 0, tipo: "viga-alta", texto: "🚇 TÚNEL ALTO" },
      { trilho: 1, tipo: "vagao", texto: "🚃 VAGÃO" },
      { trilho: 2, tipo: "no-coin", texto: "🚫 NO COIN" }
    ],
    trilhoEsperado: 0,
    acaoEsperada: "deslizando",
    explicacaoAcerto: "Incrível! Você combinou dois comandos seguidos (Esquerda + Deslizar) como um verdadeiro algoritmo!",
    explicacaoErro: "Você precisava executar dois passos: ir para a ESQUERDA e DESLIZAR por baixo do túnel."
  }
];

// ============================================================
// CONTRATO COM O PORTAL DA ESCOLA (postMessage)
// ============================================================

function notificarPortal(mensagem) {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage(mensagem, "*");
  }
}

function avisarAlturaDocumento() {
  const altura = document.documentElement.scrollHeight;
  notificarPortal({ type: "vrgame:resize", height: altura });
}

function aplicarTema(tema) {
  const temaValido = tema === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", temaValido);
  avisarAlturaDocumento();
}

// Escuta mensagens vindas do portal (tema e tela cheia)
window.addEventListener("message", (evento) => {
  const dados = evento.data;
  if (!dados || typeof dados !== "object") return;

  if (dados.type === "vrgame:theme") {
    aplicarTema(dados.theme || dados.tema);
  }

  if (dados.type === "vrgame:fullscreen") {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    setTimeout(avisarAlturaDocumento, 150);
  }
});

// ============================================================
// CONTROLES DO JOGADOR (Teclado + Botões na tela)
// ============================================================

function atualizarVisualJogador() {
  jogador.setAttribute("data-trilho", String(trilhoAtual));
  jogador.setAttribute("data-acao", acaoAtual);

  const nomesTrilho = ["esquerda", "meio", "direita"];
  jogador.setAttribute("aria-label", `Personagem no trilho ${nomesTrilho[trilhoAtual]}, ${acaoAtual}`);

  if (acaoAtual === "pulando") {
    estadoJogador.textContent = "PULANDO";
  } else if (acaoAtual === "deslizando") {
    estadoJogador.textContent = "DESLIZANDO";
  } else {
    estadoJogador.textContent = "CORRENDO";
  }
}

function moverEsquerda() {
  if (!jogoAtivo || aguardandoProximaRodada) return;
  if (trilhoAtual > 0) {
    trilhoAtual -= 1;
    atualizarVisualJogador();
  }
}

function moverDireita() {
  if (!jogoAtivo || aguardandoProximaRodada) return;
  if (trilhoAtual < 2) {
    trilhoAtual += 1;
    atualizarVisualJogador();
  }
}

function pular() {
  if (!jogoAtivo || aguardandoProximaRodada) return;
  acaoAtual = "pulando";
  atualizarVisualJogador();
}

function deslizar() {
  if (!jogoAtivo || aguardandoProximaRodada) return;
  acaoAtual = "deslizando";
  atualizarVisualJogador();
}

// Eventos dos botões da tela (celular e mouse)
btnEsquerda.addEventListener("click", moverEsquerda);
btnDireita.addEventListener("click", moverDireita);
btnPular.addEventListener("click", pular);
btnDeslizar.addEventListener("click", deslizar);

// Eventos do teclado (Setas ou W, A, S, D)
window.addEventListener("keydown", (evento) => {
  if (!jogoAtivo || aguardandoProximaRodada) return;

  const tecla = evento.key.toLowerCase();

  if (tecla === "arrowleft" || tecla === "a") {
    evento.preventDefault();
    moverEsquerda();
  } else if (tecla === "arrowright" || tecla === "d") {
    evento.preventDefault();
    moverDireita();
  } else if (tecla === "arrowup" || tecla === "w") {
    evento.preventDefault();
    pular();
  } else if (tecla === "arrowdown" || tecla === "s") {
    evento.preventDefault();
    deslizar();
  }
});

// ============================================================
// LÓGICA DAS RODADAS E DA CORRIDA
// ============================================================

function iniciarPartida(continuarInfinito = false) {
  if (!continuarInfinito) {
    rodadaAtual = 1;
    pontos = 0;
    modoInfinito = false;
    tempoInicioPartida = Date.now();
  } else {
    modoInfinito = true;
    rodadaAtual += 1;
  }

  jogoAtivo = true;
  aguardandoProximaRodada = false;

  telaInicio.classList.add("escondido");
  telaFim.classList.add("escondido");
  telaJogo.classList.remove("escondido");
  feedbackRapido.classList.add("escondido");

  clearInterval(cronometroIntervalo);
  cronometroIntervalo = setInterval(atualizarCronometro, 250);

  atualizarPlacar();
  prepararRodada();
  avisarAlturaDocumento();
}

function atualizarCronometro() {
  if (!jogoAtivo) return;
  const segundos = Math.floor((Date.now() - tempoInicioPartida) / 1000);
  textoTempo.textContent = `${segundos}s`;
}

function atualizarPlacar() {
  if (modoInfinito) {
    textoRodada.textContent = `${rodadaAtual} (Infinito)`;
  } else {
    textoRodada.textContent = `${rodadaAtual} / ${TOTAL_RODADAS_OFICIAL}`;
  }
  textoPontos.textContent = String(pontos);
}

function escolherDesafioDaRodada() {
  // Nas 10 primeiras rodadas segue a ordem crescente de dificuldade
  if (rodadaAtual <= desafiosLogicos.length) {
    return desafiosLogicos[rodadaAtual - 1];
  }
  // No modo infinito sorteia qualquer desafio
  const indiceAleatorio = Math.floor(Math.random() * desafiosLogicos.length);
  return desafiosLogicos[indiceAleatorio];
}

function desenharObjetosNaPista(listaObjetos, porcentagemDescida) {
  camadaObjetos.innerHTML = "";
  const posicoesX = ["16.66%", "50%", "83.33%"];

  listaObjetos.forEach((item) => {
    const elemento = document.createElement("div");
    elemento.className = `objeto-pista objeto-${item.tipo}`;
    elemento.textContent = item.texto;
    elemento.style.left = posicoesX[item.trilho];
    // Vai do topo (4%) até perto do jogador (74%)
    const topoAtual = 4 + porcentagemDescida * 70;
    elemento.style.top = `${topoAtual}%`;
    camadaObjetos.appendChild(elemento);
  });
}

function prepararRodada() {
  aguardandoProximaRodada = false;