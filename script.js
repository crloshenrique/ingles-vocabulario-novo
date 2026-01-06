// ===============================
// ELEMENTOS
// ===============================
const palavraBox = document.getElementById("palavra-box");
const progressoBox = document.getElementById("progresso-box");
const mensagemDiv = document.getElementById("mensagem");
const opcoesContainer = document.getElementById("opcoes-container");
const acertosBox = document.getElementById("acertos-box");
const errosBox = document.getElementById("erros-box");

// ===============================
// RECORDE
// ===============================
let recorde = 0;

fetch("recorde.txt")
  .then(res => res.text())
  .then(texto => {
    recorde = parseInt(texto) || 0;
  })
  .catch(() => recorde = 0);

// ===============================
// VOCABULÁRIO
// ===============================
let vocabulario = {};
let palavras = [];

fetch("vocabulario.txt")
  .then(res => res.text())
  .then(texto => {
    const linhas = texto.split("\n");

    linhas.forEach(linha => {
      linha = linha.trim();
      if (!linha || !linha.includes("=")) return;

      const [esquerda, direita] = linha.split("=");

      const match = esquerda.match(/^(.+?)(?:\s*\((.+?)\))?$/);
      if (!match) return;

      const palavra = match[1].trim().toLowerCase();
      const pronuncia = match[2] ? match[2].trim() : "";

      const significados = direita
        .split("/")
        .map(s => s.trim());

      vocabulario[palavra] = significados.map(sig => ({
        significado: sig,
        pronuncia
      }));
    });

    iniciarJogo();
  });

// ===============================
// VARIÁVEIS DO JOGO
// ===============================
let i = 0;
let acertos = 0;
let erros = 0;

// ===============================
// FUNÇÕES
// ===============================
function iniciarJogo() {
  palavras = Object.keys(vocabulario).sort(() => Math.random() - 0.5);
  mostrarPalavra();
}

function atualizarProgresso() {
  progressoBox.textContent = `Acertos: ${acertos} / ${palavras.length}`;
  acertosBox.textContent = acertos;
  errosBox.textContent = erros;
}

function mostrarPalavra() {
  if (i >= palavras.length) {
    finalizar();
    return;
  }

  const palavra = palavras[i];
  const dados = vocabulario[palavra];
  const pronuncia = dados[0].pronuncia;

  const palavraExibir =
    palavra.charAt(0).toUpperCase() + palavra.slice(1);

  palavraBox.textContent = pronuncia
    ? `${palavraExibir} (${pronuncia})`
    : palavraExibir;

  mensagemDiv.textContent = "";
  opcoesContainer.innerHTML = "";

  criarOpcoes(palavra);

  atualizarProgresso();
}

function criarOpcoes(palavraAtual) {
  const dados = vocabulario[palavraAtual];

  // escolhe UMA tradução correta aleatória
  const corretaObj =
    dados[Math.floor(Math.random() * dados.length)];
  const correta = corretaObj.significado;

  let opcoes = [correta];

  // pega traduções erradas de outras palavras
  while (opcoes.length < 3) {
    const palavraAleatoria =
      palavras[Math.floor(Math.random() * palavras.length)];

    if (palavraAleatoria === palavraAtual) continue;

    const traducoes = vocabulario[palavraAleatoria];
    const traducaoErrada =
      traducoes[Math.floor(Math.random() * traducoes.length)].significado;

    if (!opcoes.includes(traducaoErrada)) {
      opcoes.push(traducaoErrada);
    }
  }

  // embaralha
  opcoes.sort(() => Math.random() - 0.5);

  // cria botões
  opcoes.forEach(opcao => {
    const btn = document.createElement("button");
    btn.textContent = opcao;
    btn.className = "opcao-btn";

    btn.onclick = () => {
      if (opcao === correta) {
        acertos++;
        mensagemDiv.textContent = "✅ Correto!";
      } else {
        erros++;
        mensagemDiv.textContent = `❌ Errado!`;
      }

      i++;
      atualizarProgresso();

      setTimeout(mostrarPalavra, 800);
    };

    opcoesContainer.appendChild(btn);
  });
}

function finalizar() {
  palavraBox.textContent = "✅ Teste finalizado!";
  opcoesContainer.innerHTML = "";

  if (acertos > recorde) {
    recorde = acertos;
    fetch("recorde.txt", {
      method: "POST",
      body: String(acertos)
    });
    mensagemDiv.innerHTML = `<br>🏆 Novo recorde! Acertos: ${acertos}`;
  } else {
    mensagemDiv.innerHTML = `<br>Você acertou ${acertos} palavras. Seu recorde: ${recorde}`;
  }
}
