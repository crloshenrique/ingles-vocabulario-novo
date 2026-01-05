// Elementos
const palavraBox = document.getElementById("palavra-box");
const progressoBox = document.getElementById("progresso-box");
const input = document.getElementById("resposta");
const mensagemDiv = document.getElementById("mensagem");
const traducaoBox = document.getElementById("traducao-box");
const acertosBox = document.getElementById("acertos-box");
const errosBox = document.getElementById("erros-box");

// Menu inicial
const menuInicial = document.getElementById("menu-inicial");
let responderEm = "ingles"; // default

// Recorde
let recorde = 0;
fetch("recorde.txt")
  .then(res => res.text())
  .then(texto => {
    recorde = parseInt(texto) || 0;
  })
  .catch(() => {
    recorde = 0;
  });

// Embaralhar palavras
const palavras = Object.keys(vocabulario).sort(() => Math.random() - 0.5);

let i = 0;
let acertos = 0;
let erros = 0;
const totalPalavras = palavras.length;

// Atualizar progresso
function atualizarProgresso() {
  progressoBox.textContent = `Acertos: ${acertos} / ${totalPalavras}`;
  acertosBox.textContent = acertos;
  errosBox.textContent = erros;
}

// Mostrar palavra atual
function mostrarPalavra() {
  if (i >= palavras.length) {
    finalizar();
    return;
  }

  const palavra = palavras[i];
  const dados = vocabulario[palavra];

  let palavraExibir = "";
  let pronuncia = "";

  if (responderEm === "ingles") {
    // Palavra principal em inglês
    palavraExibir = palavra.charAt(0).toUpperCase() + palavra.slice(1);
    pronuncia = Array.isArray(dados) ? dados[0].pronuncia : dados.pronuncia;
    palavraBox.textContent = `${palavraExibir} (${pronuncia})`;
  } else {
    // Palavra principal em português
    const significados = Array.isArray(dados) ? dados.map(d => d.significado) : [dados.significado];
    palavraExibir = significados[0]; // mostra o primeiro significado
    palavraBox.textContent = palavraExibir;
  }

  palavraBox.style.color = "white";
  input.value = "";
  input.focus();
  mensagemDiv.textContent = "";

  // Resetar retângulo de tradução
  traducaoBox.textContent = "";
  traducaoBox.style.color = "#333";

  atualizarProgresso();
}

// Responder
function responder() {
  if (i >= palavras.length) return;

  const palavra = palavras[i];
  const dados = vocabulario[palavra];
  const resposta = input.value.trim().toLowerCase();

  if (!resposta) return;

  let correto = false;
  let respostasPossiveis = [];

  if (responderEm === "ingles") {
    // Palavra principal em inglês -> resposta em português
    respostasPossiveis = Array.isArray(dados) ? dados.map(d => d.significado) : [dados.significado];
    const lower = respostasPossiveis.map(r => r.toLowerCase());
    if (lower.includes(resposta)) correto = true;
  } else {
    // Palavra principal em português -> resposta em inglês
    respostasPossiveis = [palavra.charAt(0).toUpperCase() + palavra.slice(1)];
    if (resposta === palavra.toLowerCase()) correto = true;
  }

  // Mostrar tradução correta
  if (responderEm === "ingles") {
    traducaoBox.textContent = respostasPossiveis.join(" / ");
  } else {
    traducaoBox.textContent = palavra.charAt(0).toUpperCase() + palavra.slice(1);
  }
  traducaoBox.style.color = correto ? "green" : "red";

  // Atualizar acertos e erros
  if (correto) {
    acertos++;
  } else {
    erros++;
  }

  i++;
  atualizarProgresso();

  setTimeout(mostrarPalavra, 1400);
}

// Finalizar
function finalizar() {
  palavraBox.textContent = "✅ Teste finalizado!";
  input.disabled = true;
  traducaoBox.textContent = "";
  atualizarProgresso();

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

// Enter no input envia
input.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    responder();
  }
});

// Função para iniciar o jogo após escolher a língua
function escolherLingua(lng) {
  responderEm = lng;
  menuInicial.style.display = "none";
  mostrarPalavra();
}

