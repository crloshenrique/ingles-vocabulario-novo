// Elementos
const palavraBox = document.getElementById("palavra-box");
const progressoBox = document.getElementById("progresso-box");
const input = document.getElementById("resposta");
const mensagemDiv = document.getElementById("mensagem");
const traducaoBox = document.getElementById("traducao-box");
const acertosBox = document.getElementById("acertos-box");
const errosBox = document.getElementById("erros-box");

// Menu de escolha
let inglesNoTopo = true; // true = palavra em inglês no topo, false = palavra em português
let menuSelecionado = false;

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

// Função para iniciar o jogo após escolha
function iniciarJogo(escolha) {
  inglesNoTopo = escolha === "ingles";
  menuSelecionado = true;

  // Ocultar menu
  document.getElementById("menu-lingua").style.display = "none";

  // Mostrar elementos do jogo
  document.getElementById("resposta").style.display = "block";
  document.getElementById("traducao-box").style.display = "flex";
  document.querySelector("button").style.display = "block";
  document.getElementById("contador-container").style.display = "flex";

  mostrarPalavra();
}

// Atualizar progresso
function atualizarProgresso() {
  progressoBox.textContent = `Acertos: ${acertos} / ${totalPalavras}`;
  acertosBox.textContent = acertos;
  errosBox.textContent = erros;
}

// Mostrar palavra atual
function mostrarPalavra() {
  if (!menuSelecionado) return; // só mostra após escolha

  if (i >= palavras.length) {
    finalizar();
    return;
  }

  const palavra = palavras[i];
  const dados = vocabulario[palavra];

  let palavraTopo = "";
  let traducao = "";

  if (Array.isArray(dados)) {
    traducao = dados.map(d => d.significado).join(" / ");
  } else {
    traducao = dados.significado;
  }

  if (inglesNoTopo) {
    const pronuncia = Array.isArray(dados) ? dados[0].pronuncia : dados.pronuncia;
    const palavraExibir = palavra.charAt(0).toUpperCase() + palavra.slice(1);
    palavraBox.textContent = `${palavraExibir} (${pronuncia})`;
  } else {
    const palavraExibir = traducao.charAt(0).toUpperCase() + traducao.slice(1);
    palavraBox.textContent = `${palavraExibir}`;
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
  if (!menuSelecionado || i >= palavras.length) return;

  const palavra = palavras[i];
  const dados = vocabulario[palavra];
  const resposta = input.value.trim().toLowerCase();

  if (!resposta) return;

  let correto = false;
  let significadosArray = [];

  if (Array.isArray(dados)) {
    significadosArray = dados.map(d => d.significado);
    const significadosLower = significadosArray.map(d => d.toLowerCase());
    if (inglesNoTopo) {
      // Resposta em português
      if (significadosLower.includes(resposta)) correto = true;
    } else {
      // Resposta em inglês
      const palavrasLower = [palavra.toLowerCase()];
      if (palavrasLower.includes(resposta)) correto = true;
    }
  } else {
    significadosArray = [dados.significado];
    if (inglesNoTopo) {
      if (resposta === dados.significado.toLowerCase()) correto = true;
    } else {
      if (resposta === palavra.toLowerCase()) correto = true;
    }
  }

  // Mostrar tradução correta com cor
  if (inglesNoTopo) {
    traducaoBox.textContent = significadosArray.join(" / ");
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

  // Delay para ver a tradução
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
