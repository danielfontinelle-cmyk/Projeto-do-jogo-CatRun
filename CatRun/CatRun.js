const tela = document.getElementById('telagamer');
const gato = document.getElementById('gato');
const calcada = document.getElementById('calcada');
const faixas = document.getElementById('faixas');
const spanPeixes = document.getElementById('peixe');
const spanTempo = document.getElementById('tempo');
const telaInicio = document.getElementById('telaInicio');
const telaGameOver = document.getElementById('telaGameOver');
const msgFim = document.getElementById('msgFim');
const placarFinal = document.getElementById('placarFinal');
const btnIniciar = document.getElementById('btnIniciar');
const btnReiniciar = document.getElementById('btnReiniciar');

let jogando = false;
let tempo = 60;
let pontos = 0;
let velocidade = 7;
let gatoY = 0;
let gatoVel = 0;
let distancia = 0;
let proximo = 500;
let deslocamento = 0;

let obstaculos = [];
let peixes = [];
let cenario = [];


function criarCenario() {
    const itens = document.querySelectorAll('.cenario');
    for (let i = 0; i < itens.length; i++) {
        cenario.push({ el: itens[i], x: 100 + i * 350, fator: Number(itens[i].dataset.fator) });
    }

    for (let i = 0; i < 3; i++) {
        const nuvem = document.createElement('div');
        nuvem.className = 'nuvem';
        nuvem.style.width = '150px';
        nuvem.style.top = (90 + i * 40) + 'px';
        tela.appendChild(nuvem);
        cenario.push({ el: nuvem, x: 100 + i * 500, fator: 0.08 });
    }
}

function moverCenario() {
    for (let i = 0; i < cenario.length; i++) {
        const item = cenario[i];
        item.x -= velocidade * item.fator;
        if (item.x + item.el.offsetWidth < 0) {
            item.x = tela.clientWidth + Math.random() * 300;
        }
        item.el.style.left = item.x + 'px';
    }

    deslocamento += velocidade;
    calcada.style.backgroundPosition = -deslocamento + 'px 0';
    faixas.style.backgroundPosition = -deslocamento + 'px 0';
}


function criarImagem(src, largura, x, y) {
    const img = document.createElement('img');
    img.src = src;
    img.className = 'entidade';
    img.style.width = largura + 'px';
    img.style.left = x + 'px';
    img.style.bottom = 'calc(250px + ' + y + 'px)';
    tela.appendChild(img);
    return { el: img, x: x, y: y, largura: largura };
}

function criarPeixe(x, y) {
    peixes.push(criarImagem('peixe.png', 80, x, y));
}

function criarObstaculo() {
    const x = tela.clientWidth + 50;
    let obstaculo;

    if (Math.random() < 0.5) {
        obstaculo = criarImagem('Lixeira.png', 70, x, 0);
    } else {
        obstaculo = criarImagem('Banco.png', 120, x, 0);
    }
    obstaculos.push(obstaculo);

    if (Math.random() < 0.5) {
        const centro = x + obstaculo.largura / 2;
        criarPeixe(centro - 115, 115);
        criarPeixe(centro - 40, 140);
        criarPeixe(centro + 35, 115);
    }
}

function criarFilaDePeixes() {
    const x = tela.clientWidth + 50;
    let y = 8;
    if (Math.random() < 0.5) {
        y = 125;
    }
    for (let i = 0; i < 3; i++) {
        criarPeixe(x + i * 75, y);
    }
}

function criarObjetos() {
    distancia += velocidade;
    if (distancia < proximo) {
        return;
    }

    distancia = 0;
    proximo = velocidade * 44 + 250 + Math.random() * 300;

    if (Math.random() < 0.6) {
        criarObstaculo();
    } else {
        criarFilaDePeixes();
    }
}

function moverLista(lista) {
    for (let i = lista.length - 1; i >= 0; i--) {
        const objeto = lista[i];
        objeto.x -= velocidade;
        objeto.el.style.left = objeto.x + 'px';

        if (objeto.x < -200) {
            objeto.el.remove();
            lista.splice(i, 1);
        }
    }
}


function pular() {
    if (jogando && gatoY === 0) {
        gatoVel = 22;
    }
}

function moverGato() {
    if (gatoY > 0 || gatoVel > 0) {
        gatoY += gatoVel;
        gatoVel -= 1;
        if (gatoY <= 0) {
            gatoY = 0;
            gatoVel = 0;
        }
    }
    gato.style.bottom = 'calc(250px + ' + gatoY + 'px)';
}


function pegarCaixa(el, esq, dir, cima, baixo) {
    const r = el.getBoundingClientRect();
    return {
        left: r.left + esq,
        right: r.right - dir,
        top: r.top + cima,
        bottom: r.bottom - baixo
    };
}

function colidiu(a, b) {
    return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function verificarColisoes() {
    const caixaGato = pegarCaixa(gato, 48, 35, 32, 5);

    for (let i = 0; i < obstaculos.length; i++) {
        const caixaObstaculo = pegarCaixa(obstaculos[i].el, 10, 10, 8, 0);
        if (colidiu(caixaGato, caixaObstaculo)) {
            fimDeJogo('colisao');
            return;
        }
    }

    for (let i = peixes.length - 1; i >= 0; i--) {
        const caixaPeixe = pegarCaixa(peixes[i].el, 20, 20, 8, 8);
        if (colidiu(caixaGato, caixaPeixe)) {
            peixes[i].el.remove();
            peixes.splice(i, 1);
            pontos++;
            spanPeixes.textContent = pontos;
        }
    }
}


function resetar() {
    for (let i = 0; i < obstaculos.length; i++) {
        obstaculos[i].el.remove();
    }
    for (let i = 0; i < peixes.length; i++) {
        peixes[i].el.remove();
    }
    obstaculos = [];
    peixes = [];

    tempo = 60;
    pontos = 0;
    velocidade = 7;
    gatoY = 0;
    gatoVel = 0;
    distancia = 0;
    proximo = 500;

    spanPeixes.textContent = pontos;
    spanTempo.textContent = tempo;
    gato.style.bottom = '250px';
}

function iniciar() {
    resetar();
    telaInicio.classList.add('oculto');
    telaGameOver.classList.add('oculto');
    jogando = true;
}

function fimDeJogo(motivo) {
    jogando = false;

    if (motivo === 'tempo') {
        msgFim.textContent = 'O tempo acabou!';
    } else {
        msgFim.textContent = 'Você bateu em um obstáculo!';
    }
    placarFinal.textContent = 'Peixes coletados: ' + pontos;
    telaGameOver.classList.remove('oculto');
}

function atualizarJogo() {
    if (!jogando) {
        return;
    }
    moverGato();
    moverLista(obstaculos);
    moverLista(peixes);
    moverCenario();
    criarObjetos();
    verificarColisoes();
}

function atualizarTempo() {
    if (!jogando) {
        return;
    }
    tempo--;
    velocidade += 0.08;
    spanTempo.textContent = tempo;

    if (tempo <= 0) {
        fimDeJogo('tempo');
    }
}


document.addEventListener('keydown', function (e) {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        pular();
    }
});

tela.addEventListener('click', function (e) {
    if (e.target.tagName !== 'BUTTON') {
        pular();
    }
});

btnIniciar.addEventListener('click', iniciar);
btnReiniciar.addEventListener('click', iniciar);

criarCenario();
resetar();
setInterval(atualizarJogo, 20);
setInterval(atualizarTempo, 1000);
