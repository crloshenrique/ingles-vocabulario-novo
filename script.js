const palavraBox = document.getElementById("palavra-box");
const opcoesContainer = document.getElementById("opcoes-container");
const acertosBox = document.getElementById("acertos-box");
const errosBox = document.getElementById("erros-box");
const contadorContainer = document.getElementById("contador-container");
const resultadosLista = document.getElementById("resultados-lista");
const btnReiniciar = document.getElementById("btn-reiniciar");

//Apenas para testar se o Github atualizou:
//document.getElementById("menu-principal").insertAdjacentHTML('beforeend', '<p style="color:#999; font-size:0.9rem;">Git 013</p>');

const menuPrincipal = document.getElementById("menu-principal");
const menuNiveis = document.getElementById("menu-niveis");
const menuIntervalos = document.getElementById("menu-intervalos");

let vocabulario = {};
let ordemArquivo = [];
let palavrasParaOJogo = [];

let i = 0;
let acertos = 0;
let erros = 0;
let palavrasAcertadas = [];
let palavrasErradas = [];

// CARREGAR DADOS
fetch("vocabulario.txt")
  .then(res => res.text())
  .then(texto => {
    texto.split("\n").forEach(linha => {
      linha = linha.trim();
      if (!linha || !linha.includes("=")) return;

      const [esquerda, direita] = linha.split("=");
      const chave = esquerda.replace(/\(.*?\)/, "").trim().toLowerCase();
      const traducoes = direita.split("/").map(t => t.trim());

      vocabulario[chave] = { exibir: esquerda.trim(), traducoes: traducoes };
      ordemArquivo.push(chave);
    });

    // Libera o menu após carregar
    document.getElementById("status-load").style.display = "none";
    document.getElementById("btn-niveis").style.display = "block";
    document.getElementById("btn-intervalos").style.display = "block";
  })
  .catch(err => {
    document.getElementById("status-load").textContent = "Erro ao carregar vocabulario.txt";
  });

function abrirMenuNiveis() {
  menuPrincipal.style.display = "none";
  menuNiveis.style.display = "flex";
}

function abrirMenuIntervalos() {
  menuPrincipal.style.display = "none";
  menuIntervalos.style.display = "flex";
}

function iniciarNivel(qtd) {
  palavrasParaOJogo = ordemArquivo.slice(0, qtd);
  iniciarJogo();
}

function iniciarIntervalo(inicio, fim) {
  palavrasParaOJogo = ordemArquivo.slice(inicio, fim);
  iniciarJogo();
}

function iniciarJogo() {
  menuNiveis.style.display = "none";
  menuIntervalos.style.display = "none";
  
  palavraBox.style.display = "flex";
  opcoesContainer.style.display = "flex";
  contadorContainer.style.display = "flex";

  palavrasParaOJogo.sort(() => Math.random() - 0.5);
  i = 0; acertos = 0; erros = 0;
  palavrasAcertadas = []; palavrasErradas = [];
  
  mostrarPalavra();
}

function mostrarPalavra() {
  if (i >= palavrasParaOJogo.length) {
    finalizarTeste();
    return;
  }

  const chave = palavrasParaOJogo[i];
  palavraBox.textContent = vocabulario[chave].exibir;
  opcoesContainer.innerHTML = "";
  
  criarOpcoes(chave);
  acertosBox.textContent = acertos;
  errosBox.textContent = erros;
}

function criarOpcoes(palavraAtual) {
  const corretaLista = vocabulario[palavraAtual].traducoes;
  const correta = corretaLista[Math.floor(Math.random() * corretaLista.length)];
  let opcoes = [correta];

  while (opcoes.length < 4) {
    const pAleatoria = ordemArquivo[Math.floor(Math.random() * ordemArquivo.length)];
    const errada = vocabulario[pAleatoria].traducoes[0];
    if (!opcoes.includes(errada)) opcoes.push(errada);
  }

  opcoes.sort(() => Math.random() - 0.5);

  opcoes.forEach(opcao => {
    const btn = document.createElement("button");
    btn.className = "opcao-btn";
    btn.textContent = opcao;
    btn.onclick = () => {
      const todos = document.querySelectorAll(".opcao-btn");
      todos.forEach(b => b.disabled = true);

      if (opcao === correta) {
        btn.classList.add("correta");
        acertos++;
        palavrasAcertadas.push(`${vocabulario[palavraAtual].exibir} = ${correta}`);
      } else {
        btn.classList.add("errada");
        erros++;
        palavrasErradas.push(`${vocabulario[palavraAtual].exibir} = ${correta}`);
        todos.forEach(b => { if (b.textContent === correta) b.classList.add("correta"); });
      }

      i++;
      setTimeout(mostrarPalavra, 1000);
    };
    opcoesContainer.appendChild(btn);
  });
}

function finalizarTeste() {
  palavraBox.textContent = "Teste finalizado!";
  opcoesContainer.style.display = "none";
  
  palavrasAcertadas.forEach(p => criarCard(p, "#4CAF50"));
  palavrasErradas.forEach(p => criarCard(p, "#f44336"));
  btnReiniciar.style.display = "block";
}

function criarCard(texto, cor) {
  const box = document.createElement("div");
  box.textContent = texto;
  box.style.cssText = `background:${cor}; color:white; padding:12px; border-radius:10px; font-weight:bold;`;
  resultadosLista.appendChild(box);
}
