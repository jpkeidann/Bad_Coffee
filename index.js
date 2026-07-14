let canvas = document.getElementById('des')
let des = canvas.getContext('2d')
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
}

window.addEventListener('resize', () => {
    resizeCanvas()
    des.imageSmoothingEnabled = false;
    des.webkitImageSmoothingEnabled = false;
    des.mozImageSmoothingEnabled = false
})

resizeCanvas()

des.imageSmoothingEnabled = false;
des.webkitImageSmoothingEnabled = false;
des.mozImageSmoothingEnabled = false;

// ==========================================
// 2. INICIALIZAÇÃO DE ATORES E IMAGENS
// ==========================================
let player = new Player(200, 200, 64, 64, "../Img/bad_coffee.png")
let player2 = new Player(300, 200, 64, 64, "../Img/bad_coffee2.png")
player2.hitbox = { x: 4, y: 4, w: 56, h: 56 };

let teclasP2 = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

window.addEventListener('keydown', (e) => {
    if (teclasP2.hasOwnProperty(e.code)) teclasP2[e.code] = true;
});
window.addEventListener('keyup', (e) => {
    if (teclasP2.hasOwnProperty(e.code)) teclasP2[e.code] = false;
});

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

window.addEventListener('click', (e) => {
    if (estadoJogo === 'MENU') {
        botoesMenu.forEach(botao => {
            if (mouseX >= botao.x && mouseX <= botao.x + botao.w &&
                mouseY >= botao.y && mouseY <= botao.y + botao.h) {

                if (botao.id === '1P') {
                    estadoJogo = 'JOGANDO_1P';
                } else if (botao.id === '2P') {
                    estadoJogo = 'JOGANDO_2P';
                } else if (botao.id === 'SOBRE') {
                    estadoJogo = 'SOBRE';
                }
            }
        });
    } else if (estadoJogo === 'SOBRE') {
        estadoJogo = 'MENU'; // Qualquer clique na tela Sobre volta ao Menu
    }
});

player.hitbox = {
    x: 4,
    y: 4,
    w: 56,
    h: 56
};

let sistemaArmas = new GameSystem() // Inicializa o cérebro das armas e itens

let estadoJogo = 'MENU'; // Pode ser: 'MENU', 'JOGANDO_1P', 'JOGANDO_2P', 'SOBRE'

// IMAGEM DE FUNDO (Deixe vazio por enquanto. Quando tiver a imagem, coloque o caminho aqui, ex: "../img/capa.png")
let imagemFundoMenu = new Image();
imagemFundoMenu.src = "";

// Cores e tamanhos 
const configMenu = {
    corFundoPadrao: "black",
    corBotao: "#333333",
    corBotaoHover: "#666666", // Cor quando o rato (mouse) passa por cima
    corTexto: "white",
    fonteTitulo: "60px Arial",
    fonteBotao: "30px Arial"
};

// Posição do rato para sabermos se está em cima do botão
let mouseX = 0;
let mouseY = 0;

// Definição dos 3 Botões
let botoesMenu = [
    { id: '1P', texto: "Um Jogador", x: 0, y: 0, w: 400, h: 70 },
    { id: '2P', texto: "Dois Jogadores", x: 0, y: 0, w: 400, h: 70 },
    { id: 'SOBRE', texto: "Sobre nós / Como jogar", x: 0, y: 0, w: 400, h: 70 }
];

// Atualiza a posição do rato
window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Deteta o clique nos botões
window.addEventListener('click', (e) => {
    if (estadoJogo === 'MENU') {
        botoesMenu.forEach(botao => {
            if (mouseX >= botao.x && mouseX <= botao.x + botao.w &&
                mouseY >= botao.y && mouseY <= botao.y + botao.h) {

                if (botao.id === '1P') {
                    estadoJogo = 'JOGANDO_1P';
                } else if (botao.id === '2P') {
                    estadoJogo = 'JOGANDO_2P';
                } else if (botao.id === 'SOBRE') {
                    estadoJogo = 'SOBRE';
                }
            }
        });
    } else if (estadoJogo === 'SOBRE') {
        estadoJogo = 'MENU';
    }
});

// Substitua o caminho abaixo pelo local correto onde guardou a imagem da barra vazia
const imgBarraXPVazia = new Image();
imgBarraXPVazia.src = '../Img/2xp_bar_img.png'

const imgBarraInventario = new Image();
imgBarraInventario.src = "../Img/barra_item.png"; 

const imgBackground = new Image();
imgBackground.src = "../Img/Background.png"; 

const imgXicara = new Image();
imgXicara.src = "../Img/xicara.png"; 

const imgFogueteAnimado = new Image();
imgFogueteAnimado.src = "../Img/tiroGjahllahorn_SpriteSheet.png";

// ==========================================
// 3. SISTEMA DE LEVEL UP (INTERRUPÇÃO)
// ==========================================
let menuLevelUpAtivo = false;
let opcoesDeEscolha = [];
let animacaoXicaraTimer = 0;

let itemEsquerda = { x: 0, y: 0, escala: 0, alpha: 0, dados: null };
let itemDireita = { x: 0, y: 0, escala: 0, alpha: 0, dados: null };

window.ativarMenuLevelUp = function (escolhas) {
    if (escolhas.length === 0) {
        player.vidaAtual = player.vidaMaxima;
        return;
    }

    menuLevelUpAtivo = true;
    opcoesDeEscolha = escolhas;
    animacaoXicaraTimer = 0;

    let centroX = canvas.width / 2;
    let centroY = canvas.height / 2;

    let op1 = escolhas[0];
    let op2 = escolhas.length > 1 ? escolhas[1] : escolhas[0];

    let alvoXEsquerda = centroX - 100;
    let alvoXDireita = centroX + 100;

    itemEsquerda = { startX: alvoXEsquerda, x: alvoXEsquerda, y: centroY, escala: 0, alpha: 0, dados: op1 };
    itemDireita = { startX: alvoXDireita, x: alvoXDireita, y: centroY, escala: 0, alpha: 0, dados: op2 };
};

function atualizarEdesenharMenuLevelUp(deltaTime) {
    if (!menuLevelUpAtivo) return;

    des.fillStyle = "rgba(0, 0, 0, 0.6)";
    des.fillRect(0, 0, canvas.width, canvas.height);

    let centroX = canvas.width / 2;
    let centroY = canvas.height / 2;
    let tamXicara = 140;

    let alvoY = centroY - 120;
    animacaoXicaraTimer += deltaTime / 1000;
    let t = Math.min(animacaoXicaraTimer * 3, 1);

    itemEsquerda.y = centroY + (alvoY - centroY) * t;
    itemEsquerda.escala = t;
    itemEsquerda.alpha = t;

    itemDireita.y = centroY + (alvoY - centroY) * t;
    itemDireita.escala = t;
    itemDireita.alpha = t;

    if (imgXicara.complete) {
        des.drawImage(imgXicara, itemEsquerda.startX - tamXicara / 2, centroY - tamXicara / 3, tamXicara, tamXicara);
        des.drawImage(imgXicara, itemDireita.startX - tamXicara / 2, centroY - tamXicara / 3, tamXicara, tamXicara);
    }

    desenharBotaoSelecao(itemEsquerda);
    desenharBotaoSelecao(itemDireita);
}

function desenharBotaoSelecao(item) {
    des.save();
    des.globalAlpha = item.alpha;
    des.translate(item.x, item.y);
    des.scale(item.escala, item.escala);

    if (!item.dados.imgObjeto) {
        item.dados.imgObjeto = new Image();
        item.dados.imgObjeto.src = item.dados.imgSrc;
    }
    if (item.dados.imgObjeto.complete && item.dados.imgObjeto.naturalWidth !== 0) {
        des.drawImage(item.dados.imgObjeto, -tamanhoIconeEscolha / 2, -20 - tamanhoIconeEscolha, tamanhoIconeEscolha, tamanhoIconeEscolha);
    }

    des.fillStyle = "#ffffff";
    des.font = "bold 12px Arial";
    des.textAlign = "center";
    des.fillText(item.dados.name, 0, 5);

    des.font = "10px Arial";
    des.fillStyle = "#bdc3c7";
    let txtInfo = item.dados.type === 'weapon' ? "ARMA" : "ITEM PASSIVO";
    des.fillText(txtInfo, 0, 22);

    des.fillStyle = "#f1c40f";
    des.font = "bold 11px Arial";

    if (item.dados.description) {
        des.fillText(item.dados.description, 0, 45);
    } else {
        des.fillStyle = "#e74c3c";
        des.fillText(`Dano: ${item.dados.damage}`, 0, 45);
        des.fillStyle = "#3498db";
        des.fillText(`Recarga: ${item.dados.cooldown}ms`, 0, 62);
    }

    des.restore();
}

canvas.addEventListener('click', (e) => {
    if (!menuLevelUpAtivo) return;

    let rect = canvas.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;
    let mouseY = e.clientY - rect.top;

    let largCard = 140;
    let altCard = 160;

    function clicouNoCard(item) {
        return (mouseX >= item.x - largCard / 2 && mouseX <= item.x + largCard / 2 &&
            mouseY >= item.y - altCard / 2 && mouseY <= item.y + altCard / 2);
    }

    let itemEscolhido = null;

    if (clicouNoCard(itemEsquerda)) itemEscolhido = itemEsquerda.dados;
    if (clicouNoCard(itemDireita)) itemEscolhido = itemDireita.dados;

    if (itemEscolhido) {
        sistemaArmas.buyItem(itemEscolhido);
        menuLevelUpAtivo = false;
        console.log(`Escolheu: ${itemEscolhido.name}`);
    }
});

// ==========================================
// 4. CONTROLES DE MOVIMENTO DO JOGADOR
// ==========================================
const keys = {}
let jogar = true
let fase = 1
let velocidadeCar = 1

document.addEventListener('keydown', (e) => { keys[e.key] = true })
document.addEventListener('keyup', (e) => { keys[e.key] = false })

function controlarPlayers() {
    player.dirX = 0
    player.dirY = 0

    if (keys['w']) player.dirY = -1
    if (keys['s']) player.dirY = 1
    if (keys['a']) player.dirX = -1
    if (keys['d']) player.dirX = 1

    // PLAYER 2
    player2.dirX = 0
    player2.dirY = 0

    if (keys['ArrowUp']) player2.dirY = -1
    if (keys['ArrowDown']) player2.dirY = 1
    if (keys['ArrowLeft']) player2.dirX = -1
    if (keys['ArrowRight']) player2.dirX = 1
}

// ==========================================
// 5. SISTEMA E CONTROLE DE TIROS (ARMAS)
// ==========================================
let efeitosArmas = []; 
let tirosNaTela = [];

function controlarTiros(deltaTime, disparosFeitos = []) {
    if (disparosFeitos && disparosFeitos.length > 0) {
        disparosFeitos.forEach(disparo => {
            let centroPx = disparo.atirador.x + disparo.atirador.w / 2;
            let centroPy = disparo.atirador.y + disparo.atirador.h / 2;

            let anguloAlvo = 0;
            let dx = 1;
            let dy = 0;

            if (disparo.target) {
                let eCentroX = disparo.target.x + disparo.target.w / 2;
                let eCentroY = disparo.target.y + disparo.target.h / 2;
                anguloAlvo = Math.atan2(eCentroY - centroPy, eCentroX - centroPx);
                dx = Math.cos(anguloAlvo);
                dy = Math.sin(anguloAlvo);
            }

            let armaDoTiro = sistemaArmas.weapons.find(w => w.id === disparo.id);
            if (armaDoTiro) {
                if (!armaDoTiro.imgObjeto) {
                    armaDoTiro.imgObjeto = new Image();
                    armaDoTiro.imgObjeto.src = armaDoTiro.imgSrc;
                }
                if (!armaDoTiro.hideEffect) {
                    efeitosArmas.push({
                        img: armaDoTiro.imgObjeto,
                        angulo: anguloAlvo,
                        tempoVida: 150,
                        w: armaDoTiro.effectW || 64,
                        h: armaDoTiro.effectH || 32,
                        atirador: disparo.atirador
                    });
                }
            }

            let imgBala = null;
            if (disparo.bulletImgSrc) {
                imgBala = new Image();
                imgBala.src = disparo.bulletImgSrc;
            }

            if (disparo.shootBehavior === 'sequence') {
                tirosNaTela.push({
                    x: centroPx,
                    y: centroPy,
                    vx: dx * disparo.projectileSpeed,
                    vy: dy * disparo.projectileSpeed,
                    angulo: anguloAlvo,
                    img: imgBala,
                    type: disparo.projectileType,
                    damage: disparo.damage,
                    isCritical: disparo.isCritical,
                    tempoVida: 2000,
                    w: armaDoTiro?.projectileW || 36,
                    h: armaDoTiro?.projectileH || 36,
                    frameX: 0,
                    frameTimer: 0,
                    atirador: disparo.atirador
                });
            } else if (disparo.shootBehavior === 'cone') {
                for (let i = -1; i <= 1; i++) {
                    let spread = anguloAlvo + (i * 0.25);
                    tirosNaTela.push({
                        x: centroPx,
                        y: centroPy,
                        vx: Math.cos(spread) * disparo.projectileSpeed,
                        vy: Math.sin(spread) * disparo.projectileSpeed,
                        angulo: spread,
                        img: imgBala,
                        type: disparo.projectileType,
                        damage: disparo.damage,
                        isCritical: disparo.isCritical,
                        tempoVida: 150,
                        w: armaDoTiro?.projectileW || 16,
                        h: armaDoTiro?.projectileH || 16,
                        atirador: disparo.atirador
                    });
                }
            } else if (disparo.shootBehavior === 'boomerang') {
                let alcance = armaDoTiro?.throwRange || 250;
                let tempoTotal = armaDoTiro?.throwTime || 1200;
                let velGiro = armaDoTiro?.spinSpeed || 20;

                tirosNaTela.push({
                    x: centroPx,
                    y: centroPy,
                    startX: centroPx,
                    startY: centroPy,
                    anguloDisparo: anguloAlvo,
                    alcanceMaximo: alcance,
                    tempoVidaTotal: tempoTotal,
                    tempoVida: tempoTotal,
                    velocidadeGiro: velGiro,
                    rotacaoAtual: 0,
                    faseRetorno: false,
                    img: imgBala,
                    type: disparo.projectileType,
                    shootBehavior: 'boomerang',
                    damage: disparo.damage,
                    isCritical: disparo.isCritical,
                    w: armaDoTiro?.projectileW || 60,
                    h: armaDoTiro?.projectileH || 7,
                    inimigosAtingidosIda: [],
                    inimigosAtingidosVolta: [],
                    atirador: disparo.atirador
                });
            } else if (disparo.shootBehavior === 'orbit') {
                let raio = armaDoTiro?.orbitRadius || 60;
                let velGiro = disparo.spinSpeed || armaDoTiro?.spinSpeed || 4;
                let tempoDuracao = armaDoTiro?.orbitDuration || 3000;
                let quantidade = disparo.projectileCount || 1;
                let espacamento = (Math.PI * 2) / quantidade;

                for (let i = 0; i < quantidade; i++) {
                    tirosNaTela.push({
                        x: centroPx,
                        y: centroPy,
                        anguloOrbita: (-Math.PI / 2) + (espacamento * i),
                        distanciaBase: raio,
                        velocidadeOrbita: velGiro,
                        tempoVidaTotal: tempoDuracao,
                        tempoVida: tempoDuracao,
                        angulo: 0,
                        img: imgBala,
                        type: disparo.projectileType,
                        shootBehavior: 'orbit',
                        damage: disparo.damage,
                        isCritical: disparo.isCritical,
                        w: armaDoTiro?.projectileW || 174,
                        h: armaDoTiro?.projectileH || 102,
                        orbitando: true,
                        inimigosAtingidos: [],
                        atirador: disparo.atirador
                    });
                }
            }
        });
    }

    for (let i = tirosNaTela.length - 1; i >= 0; i--) {
        let tiro = tirosNaTela[i];

        if (tiro.shootBehavior === 'orbit') {
            let centroPx = tiro.atirador.x + tiro.atirador.w / 2;
            let centroPy = tiro.atirador.y + tiro.atirador.h / 2;

            tiro.anguloOrbita += tiro.velocidadeOrbita * (deltaTime / 1000);
            tiro.angulo = tiro.anguloOrbita;

            tiro.x = centroPx + Math.cos(tiro.anguloOrbita) * tiro.distanciaBase;
            tiro.y = centroPy + Math.sin(tiro.anguloOrbita) * tiro.distanciaBase;
        } else {
            tiro.x += tiro.vx * (deltaTime / 1000);
            tiro.y += tiro.vy * (deltaTime / 1000);
        }

        tiro.tempoVida -= deltaTime;
        
        if (tiro.type === 'big_boom') {
            tiro.frameTimer += deltaTime;
            if (tiro.frameTimer >= 100) {
                tiro.frameX = (tiro.frameX + 1) % 5;
                tiro.frameTimer = 0;
            }
        }

        if (tiro.shootBehavior === 'boomerang') {
            tiro.rotacaoAtual += tiro.velocidadeGiro * (deltaTime / 1000);
            tiro.angulo = tiro.rotacaoAtual;

            let tempoPassado = tiro.tempoVidaTotal - tiro.tempoVida;
            let metadeTempo = tiro.tempoVidaTotal / 2;
            let centroPx = tiro.atirador.x + tiro.atirador.w / 2;
            let centroPy = tiro.atirador.y + tiro.atirador.h / 2;

            if (tempoPassado < metadeTempo) {
                tiro.faseRetorno = false;
                let progressoIda = tempoPassado / metadeTempo;
                tiro.x = tiro.startX + Math.cos(tiro.anguloDisparo) * (tiro.alcanceMaximo * progressoIda);
                tiro.y = tiro.startY + Math.sin(tiro.anguloDisparo) * (tiro.alcanceMaximo * progressoIda);
            } else {
                tiro.faseRetorno = true;
                let progressoVolta = (tempoPassado - metadeTempo) / metadeTempo;

                let pontoMaximoX = tiro.startX + Math.cos(tiro.anguloDisparo) * tiro.alcanceMaximo;
                let pontoMaximoY = tiro.startY + Math.sin(tiro.anguloDisparo) * tiro.alcanceMaximo;

                tiro.x = pontoMaximoX + (centroPx - pontoMaximoX) * progressoVolta;
                tiro.y = pontoMaximoY + (centroPy - pontoMaximoY) * progressoVolta;
            }
        }
    }

    tirosNaTela = tirosNaTela.filter(t => t.tempoVida > 0);
}

function desenharTiros() {
    tirosNaTela.forEach(tiro => {
        if (tiro.img && tiro.img.complete && tiro.img.naturalWidth !== 0) {
            des.save();
            des.translate(tiro.x, tiro.y);
            des.rotate(tiro.angulo);

            // --- Se for o FOGUETE, usa o sistema de SpriteSheet Animada ---
            if (tiro.type === 'big_boom' && typeof imgFogueteAnimado !== 'undefined' && imgFogueteAnimado.complete) {
                let larguraQuadro = imgFogueteAnimado.width / 5;
                let alturaQuadro = imgFogueteAnimado.height;
                des.drawImage(
                    imgFogueteAnimado,
                    tiro.frameX * larguraQuadro, 0, larguraQuadro, alturaQuadro,
                    -tiro.w / 2, -tiro.h / 2, tiro.w, tiro.h // Tamanho vem de projectileW/H (armas.js)
                );
            } else {
                des.drawImage(tiro.img, -tiro.w / 2, -tiro.h / 2, tiro.w, tiro.h);
            }
            des.restore();
        } else {
            des.beginPath();
            des.fillStyle = tiro.isCritical ? "purple" : "yellow";
            des.arc(tiro.x, tiro.y, 6, 0, Math.PI * 2);
            des.fill();
        }
    });
}

function verificarColisaoTiros() {
    for (let i = tirosNaTela.length - 1; i >= 0; i--) {
        let tiro = tirosNaTela[i];
        let tiroColidiu = false;

        for (let j = inimigos.length - 1; j >= 0; j--) {
            let inimigo = inimigos[j];

            let centroInimigoX = inimigo.x + inimigo.w / 2;
            let centroInimigoY = inimigo.y + inimigo.h / 2;
            let dx = tiro.x - centroInimigoX;
            let dy = tiro.y - centroInimigoY;
            let distancia = Math.sqrt(dx * dx + dy * dy);

            if (distancia < 25) {
                if (tiro.type === 'force' || tiro.shootBehavior === 'boomerang' || tiro.shootBehavior === 'orbit') {
                    let listaAtingidos;
                    if (tiro.shootBehavior === 'boomerang') {
                        listaAtingidos = tiro.faseRetorno ? tiro.inimigosAtingidosVolta : tiro.inimigosAtingidosIda;
                    } else {
                        if (!tiro.inimigosAtingidos) tiro.inimigosAtingidos = [];
                        listaAtingidos = tiro.inimigosAtingidos;
                    }
                    if (listaAtingidos.includes(inimigo)) continue;
                    listaAtingidos.push(inimigo);
                }
                tiroColidiu = true;

                if (tiro.type === 'big_boom') {
                    let raioExplosao = 120;
                    for (let k = inimigos.length - 1; k >= 0; k--) {
                        let vitimaArea = inimigos[k];
                        let cVitimaX = vitimaArea.x + vitimaArea.w / 2;
                        let cVitimaY = vitimaArea.y + vitimaArea.h / 2;
                        let ex = tiro.x - cVitimaX;
                        let ey = tiro.y - cVitimaY;
                        let distExplosao = Math.sqrt(ex * ex + ey * ey);

                        if (distExplosao <= raioExplosao) {
                            vitimaArea.tomarDano(tiro.damage);
                        }
                    }
                } else {
                    inimigo.tomarDano(tiro.damage);
                }
                break; 
            }
        }

        if (tiroColidiu) {
            if (tiro.type !== 'force' && tiro.shootBehavior !== 'orbit' && tiro.shootBehavior !== 'boomerang') {
                tirosNaTela.splice(i, 1);
            }
        }
    }
}

function atualizarEfeitosArmas(deltaTime) {
    for (let i = efeitosArmas.length - 1; i >= 0; i--) {
        efeitosArmas[i].tempoVida -= deltaTime;
        if (efeitosArmas[i].tempoVida <= 0) {
            efeitosArmas.splice(i, 1);
        }
    }
}

function desenharEfeitosArmas() {
    efeitosArmas.forEach(ef => {
        
        // 1. RESOLUÇÃO: Descobre de quem é a arma. 
        // Ele tenta pegar o atirador/jogador do efeito. Se por acaso não achar, usa o player 1 de segurança.
        let donoDaArma = ef.atirador || ef.jogador || player;

        // 2. Calcula o centro baseado no dono correto (Jogador 1 ou Jogador 2)
        let centroPx = donoDaArma.x + donoDaArma.w / 2;
        let centroPy = donoDaArma.y + donoDaArma.h / 2;

        if (ef.img && ef.img.complete && ef.img.naturalWidth !== 0) {
            des.save();
            // Move o eixo para o centro do jogador correto
            des.translate(centroPx, centroPy);
            des.rotate(ef.angulo);

            let atirandoParaEsquerda = (ef.angulo > Math.PI / 2 && ef.angulo < 3 * Math.PI / 2) || (ef.angulo < -Math.PI / 2);
            if (atirandoParaEsquerda) {
                des.scale(1, -1);
            }

            des.drawImage(ef.img, 15, -(ef.h / 2), ef.w * 2, ef.h * 2);
            des.restore();
        }
    });
}

// ==========================================
// 6. GERENCIADOR DE INIMIGOS E LOGICA DE WAVES
// ==========================================
let inimigos = [];
let waveAtual = 1;         
let inimigosParaSpawnar = 0; 
let inimigosVivos = 0;       
let frameTimer = 0;          
let descansoAtivo = false;   
let bossAtual = null;      
let jogoVencido = false;     // Flag para travar o loop de jogo e mostrar vitória

let textoMensagemWave = "WAVE 1 - PREPARE-SE!";
let timerMensagemWave = 3500; 

// OBJETO CENTRAL DO ESTADO DO JOGO
const contextoDoJogo = {
    jogadores: [player],     
    temDoisJogadores: false, 
    barraXP: {
        adicionarXP: (qtd) => {
            if (typeof sistemaArmas !== "undefined" && sistemaArmas.gainXp) {
                sistemaArmas.gainXp(qtd); 
            }
        }
    },
    removerInimigo: function (inimigoMorto) {
        if (inimigoMorto === bossAtual) {
            bossAtual = null;
        }
        inimigos = inimigos.filter(ini => ini !== inimigoMorto);
        inimigosVivos--;
        verificarFimDaWave();
    },
    
    spawnarLarvas: function (origemX, origemY, quantidade) {
        let configLarva = TIPOS_INIMIGOS.larva || { largura: 35, altura: 20, img: "../Img/larva.png" };
        let raioDeSpawn = 90; 
        
        for (let i = 0; i < quantidade; i++) {
            let angulo = (Math.PI * 2 / quantidade) * i;
            let spawnX = origemX + Math.cos(angulo) * raioDeSpawn;
            let spawnY = origemY + Math.sin(angulo) * raioDeSpawn;

            let novaLarva = new Inimigo(
                spawnX, spawnY, 
                configLarva.largura, configLarva.altura,
                configLarva.img, configLarva, contextoDoJogo
            );
            
            novaLarva.velKnockbackX = Math.cos(angulo) * 3;
            novaLarva.velKnockbackY = Math.sin(angulo) * 3;

            inimigos.push(novaLarva);
            inimigosVivos++; 
        }
    },
    spawnarNinfas: function (origemX, origemY, quantidade) {
        let configNinfa = TIPOS_INIMIGOS.ninfa || TIPOS_INIMIGOS.larva || { largura: 75, altura: 50, img: "../Img/ninfa.png" };
        let raioDeSpawn = 90;

        for (let i = 0; i < quantidade; i++) {
            let angulo = (Math.PI * 2 / quantidade) * i;
            let spawnX = origemX + Math.cos(angulo) * raioDeSpawn;
            let spawnY = origemY + Math.sin(angulo) * raioDeSpawn;

            let novaNinfa = new Inimigo(
                spawnX, spawnY, 
                configNinfa.largura, configNinfa.altura,
                configNinfa.img, configNinfa, contextoDoJogo
            );
            
            novaNinfa.velKnockbackX = Math.cos(angulo) * 3;
            novaNinfa.velKnockbackY = Math.sin(angulo) * 3;

            inimigos.push(novaNinfa);
            inimigosVivos++; 
        }
    }
};

function iniciarWave() {
    console.log(`=== INICIANDO WAVE ${waveAtual} ===`);
    descansoAtivo = false;

    // A Wave 5 é o limite absoluto e spawnará o Quesada Gigas
    if (waveAtual === 5) {
        textoMensagemWave = "ALERTA DE BOSS: QUESADA GIGAS!";
        timerMensagemWave = 4000; 
        inimigosParaSpawnar = 0; 
        inimigosVivos = 1;       
        spawnarBoss();           
    } else {
        textoMensagemWave = `WAVE ${waveAtual}`;
        timerMensagemWave = 3500;
        let quantidadeNestaWave = 5 * waveAtual;
        inimigosParaSpawnar = quantidadeNestaWave;
        inimigosVivos = quantidadeNestaWave;
    }
}

function verificarFimDaWave() {
    if (inimigosVivos <= 0 && inimigosParaSpawnar <= 0) {
        // Se a Wave 5 for derrotada, o jogo acaba em Vitória!
        if (waveAtual === 5) {
            jogoVencido = true;
            textoMensagemWave = "PARABÉNS! QUESADA GIGAS FOI DERROTADO!";
            timerMensagemWave = 999999;
            return;
        }

        textoMensagemWave = "WAVE CONCLUÍDA!";
        timerMensagemWave = 2000;
        waveAtual++;
        descansoAtivo = true;
        setTimeout(iniciarWave, 3000);
    }
}

function spawnarInimigo() {
    let spawnX, spawnY;
    if (Math.random() < 0.5) {
        spawnX = Math.random() * canvas.width;
        spawnY = Math.random() < 0.5 ? -50 : canvas.height + 50;
    } else {
        spawnX = Math.random() < 0.5 ? -50 : canvas.width + 50;
        spawnY = Math.random() * canvas.height;
    }

    const pragasDisponiveis = ["acaro", "broca", "bichoMineiro"];
    const pragaSorteada = pragasDisponiveis[Math.floor(Math.random() * pragasDisponiveis.length)];
    const configInimigo = TIPOS_INIMIGOS[pragaSorteada];

    let largura = configInimigo.largura || 45;
    let altura = configInimigo.altura || 45;

    let novoInimigo = new Inimigo(
        spawnX, spawnY, largura, altura, 
        configInimigo.img, configInimigo, contextoDoJogo
    );

    inimigos.push(novoInimigo);
}

function spawnarBoss() {
    const configBoss = TIPOS_INIMIGOS.cigarraBoss;
    let larguraBoss = configBoss.largura || 160;
    let alturaBoss = configBoss.altura || 160;

    // Spawn centralizado
    let spawnX = (canvas.width / 2) - (larguraBoss / 2); 
    let spawnY = (canvas.height / 2) - (alturaBoss / 2); 

    let novoBoss = new Inimigo(
        spawnX, spawnY, larguraBoss, alturaBoss, 
        configBoss.img, configBoss, contextoDoJogo
    );

    novoBoss.estado = "surgindo";
    novoBoss.timerSurgimento = 0;
    novoBoss.tempoSurgimentoTotal = 3000; 
    novoBoss.particulas = [];

    bossAtual = novoBoss;
    inimigos.push(novoBoss);
}

// ==========================================
// 7. INTERFACE GRÁFICA DO USUÁRIO (HUD)
// ==========================================
function desenharBarraBoss(ctx) {
    if (bossAtual && bossAtual.vidaAtual > 0 && inimigos.includes(bossAtual)) {
        let larguraBarra = canvas.width * 0.6;
        let alturaBarra = 24;
        let x = (canvas.width - larguraBarra) / 2;
        let y = 70; 

        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(x, y, larguraBarra, alturaBarra);

        let porcentagemVida = Math.max(0, bossAtual.vidaAtual / bossAtual.vidaMaxima);
        ctx.fillStyle = "#b30000";
        ctx.fillRect(x, y, larguraBarra * porcentagemVida, alturaBarra);

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, larguraBarra, alturaBarra);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
            `${bossAtual.nome.toUpperCase()} (${Math.ceil(bossAtual.vidaAtual)}/${bossAtual.vidaMaxima})`, 
            canvas.width / 2, y + 17
        );
        ctx.textAlign = "left"; 
    } else {
        bossAtual = null; 
    }
}

function desenharHUDWave(contexto) {
    contexto.save();

    let largCaixa = 220;
    let altCaixa = 40;
    let xCaixa = (canvas.width / 2) - (largCaixa / 2);
    let yCaixa = 15;

    contexto.fillStyle = "rgba(0, 0, 0, 0.7)";
    contexto.fillRect(xCaixa, yCaixa, largCaixa, altCaixa);

    contexto.strokeStyle = "#f1c40f";
    contexto.lineWidth = 2;
    contexto.strokeRect(xCaixa, yCaixa, largCaixa, altCaixa);

    contexto.fillStyle = "#ffffff";
    contexto.font = "bold 16px Arial";
    contexto.textAlign = "center";
    contexto.textBaseline = "middle";
    
    let totalRestante = inimigosVivos + inimigosParaSpawnar;
    let textoTop = `WAVE ${waveAtual}   |   Resta ${totalRestante}`;
    contexto.fillText(textoTop, canvas.width / 2, yCaixa + (altCaixa / 2));

    if (timerMensagemWave > 0) {
        let alpha = Math.min(timerMensagemWave / 1000, 1);
        contexto.globalAlpha = alpha;

        contexto.fillStyle = "rgba(0, 0, 0, 0.5)";
        contexto.font = "bold 46px Arial";
        contexto.fillText(textoMensagemWave, (canvas.width / 2) + 3, (canvas.height / 3) + 3);

        contexto.fillStyle = waveAtual === 5 ? "#e74c3c" : "#f1c40f"; 
        contexto.fillText(textoMensagemWave, canvas.width / 2, canvas.height / 3);
    }

    contexto.restore();
}

function desenharInventarioVisual() {
    let largBarra = 320;
    let altBarra = 64;
    let posX = (canvas.width - largBarra) / 2;
    let posY = canvas.height - 75;

    if (imgBarraInventario.complete) {
        des.drawImage(imgBarraInventario, posX, posY, largBarra, altBarra);
    }

    des.fillStyle = "#ffffff";
    des.font = "bold 10px Arial";
    des.textAlign = "center";

    let tamanhoIcone = 64;
    let espacamentoSlot = 53;
    let margemEsquerdaArmas = posX + 8; 

    for (let i = 0; i < sistemaArmas.maxWeaponSlots; i++) {
        let slotX = margemEsquerdaArmas + (i * espacamentoSlot);

        if (sistemaArmas.weapons[i]) {
            let arma = sistemaArmas.weapons[i];

            if (!arma.imgObjeto) {
                arma.imgObjeto = new Image();
                arma.imgObjeto.src = arma.imgSrc;
            }
            if (arma.imgObjeto.complete && arma.imgObjeto.naturalWidth !== 0) {
                des.drawImage(arma.imgObjeto, slotX + 4, posY + 8, tamanhoIcone, tamanhoIcone);
            } else {
                des.fillStyle = "#f1c40f";
                des.fillText(arma.id.substring(0, 3).toUpperCase(), slotX + 20, posY + 28);
            }
            des.fillStyle = "#ffffff";
            des.fillText(`Lvl ${arma.level}`, slotX + 20, posY + 52);
        }
    }

    let margemEsquerdaItens = posX + 202;

    for (let i = 0; i < sistemaArmas.maxItemSlots; i++) {
        let slotX = margemEsquerdaItens + (i * espacamentoSlot);

        if (sistemaArmas.items[i]) {
            let item = sistemaArmas.items[i];

            if (!item.imgObjeto) {
                item.imgObjeto = new Image();
                item.imgObjeto.src = item.imgSrc;
            }
            if (item.imgObjeto.complete && item.imgObjeto.naturalWidth !== 0) {
                des.drawImage(item.imgObjeto, slotX + 4, posY + 8, tamanhoIcone, tamanhoIcone);
            } else {
                des.fillStyle = "#2ecc71";
                des.fillText(item.id.substring(0, 3).toUpperCase(), slotX + 20, posY + 28);
            }
            des.fillStyle = "#ffffff";
            des.fillText(`Lvl ${item.level}`, slotX + 20, posY + 52);
        }
    }
    des.textAlign = "left"; 
}

function desenharBarraXP() {
    let alturaBarra = 98; 
    let larguraTotal = 768;

    if (imgBarraXPVazia.complete) {
        des.drawImage(imgBarraXPVazia, 550, 0, larguraTotal, alturaBarra);
    } else {
        des.fillStyle = "#111116";
        des.fillRect(0, 0, larguraTotal, alturaBarra);
    }

    let proporcaoXp = sistemaArmas.currentXp / sistemaArmas.xpNeeded;
    if (proporcaoXp > 1) proporcaoXp = 1; 

    let larguraPreenchimento = (larguraTotal - 4) * proporcaoXp;

    if (larguraPreenchimento > 0) {
        des.fillStyle = "#2ecc71"; 
        des.fillRect(562, 12, larguraPreenchimento, alturaBarra - 24);
    }

    des.fillStyle = "#ffffff";
    des.font = "bold 13px Arial";
    des.textAlign = "right";

    let textoXP = `LV. ${sistemaArmas.level}  |  ${sistemaArmas.currentXp} / ${sistemaArmas.xpNeeded} XP`;

    des.strokeStyle = "#000000";
    des.lineWidth = 3;
    des.strokeText(textoXP, canvas.width - 20, alturaBarra + 20);
    des.fillText(textoXP, canvas.width - 20, alturaBarra + 20);
    des.textAlign = "left"; 
}

// ============================ MAIN ===================================


function desenharMenu() {
    if (imagemFundoMenu.src && imagemFundoMenu.complete && imagemFundoMenu.naturalWidth !== 0) {
        des.drawImage(imagemFundoMenu, 0, 0, canvas.width, canvas.height);
    } else {
        des.fillStyle = configMenu.corFundoPadrao;
        des.fillRect(0, 0, canvas.width, canvas.height);
    }

    des.fillStyle = configMenu.corTexto;
    des.font = configMenu.fonteTitulo;
    des.textAlign = "center";
    des.fillText("Bad coffee", canvas.width / 2, 150); // Pode mudar o nome aqui!

    let startY = canvas.height / 2 - 50;
    botoesMenu.forEach((botao, index) => {
        botao.x = canvas.width / 2 - botao.w / 2;
        botao.y = startY + (index * (botao.h + 30));

        let hover = mouseX >= botao.x && mouseX <= botao.x + botao.w &&
            mouseY >= botao.y && mouseY <= botao.y + botao.h;

        des.fillStyle = hover ? configMenu.corBotaoHover : configMenu.corBotao;
        des.fillRect(botao.x, botao.y, botao.w, botao.h);

        des.fillStyle = configMenu.corTexto;
        des.font = configMenu.fonteBotao;
        des.textBaseline = "middle";
        des.fillText(botao.texto, botao.x + botao.w / 2, botao.y + botao.h / 2);
    });
    des.textAlign = "left"; // Reseta o texto
    des.textBaseline = "alphabetic";
}

function desenharSobre() {
    des.fillStyle = "black";
    des.fillRect(0, 0, canvas.width, canvas.height);

    des.fillStyle = "white";
    des.textAlign = "center";

    des.font = "50px Arial";
    des.fillText("Sobre Nós / Como Jogar", canvas.width / 2, 100);

    des.font = "30px Arial";
    des.fillText("Desenvolvedores: João, Abel e Davi", canvas.width / 2, 250);
    des.fillText("Jogador 1: WASD para andar.", canvas.width / 2, 330);
    des.fillText("Jogador 2: Setas do Teclado para andar.", canvas.width / 2, 380);
    des.fillText("Sobreviva à horda e recolha melhorias!", canvas.width / 2, 400);

    des.font = "20px Arial";
    des.fillText("(Clique em qualquer lugar para voltar)", canvas.width / 2, canvas.height - 100);
    des.textAlign = "left";
    des.textBaseline = "alphabetic";
}


function desenha() {
    if (imgBackground.complete) {
        des.drawImage(imgBackground, 0, 0, canvas.width, canvas.height);
    } else {
        des.fillStyle = "#2c3e50";
        des.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    player.des_player();
    player.desenharBarraVida(des);
    desenharEfeitosArmas();
    desenharTiros();


    if (estadoJogo === 'JOGANDO_2P' && player2.vidaAtual > 0) {


        player2.des_player(); // Desenha o jogador 2
        player2.desenharBarraVida(des);
        desenharEfeitosArmas();
        desenharTiros();
    }
    // Desenha todos os inimigos vivos na tela ---
    inimigos.forEach(inimigo => {
        inimigo.desenhar(des);
    });

    desenharBarraXP();
    desenharInventarioVisual();
    desenharHUDWave(des);
    desenharBarraBoss(des);

    if (menuLevelUpAtivo) {
        atualizarEdesenharMenuLevelUp(16);
    }

    // Tela Gráfica de Vitória ao Passar da Wave 5 e Matar o Boss
    if (jogoVencido) {
        des.fillStyle = "rgba(0, 0, 0, 0.85)";
        des.fillRect(0, 0, canvas.width, canvas.height);
        
        des.fillStyle = "#f1c40f";
        des.font = "bold 52px Arial";
        des.textAlign = "center";
        des.fillText("VITÓRIA!", canvas.width / 2, canvas.height / 2 - 40);
        
        des.fillStyle = "#ffffff";
        des.font = "bold 20px Arial";
        des.fillText("Você derrotou Quesada Gigas e salvou o cafezal!", canvas.width / 2, canvas.height / 2 + 20);
        
        des.font = "16px Arial";
        des.fillStyle = "#bdc3c7";
        des.fillText("Recarregue a página para jogar novamente.", canvas.width / 2, canvas.height / 2 + 65);
        des.textAlign = "left"; 
    }
}

function atualiza(deltaTime,disparosFeitos = []) {
    if (jogoVencido) return; // Trava o progresso do jogo se tiver vencido
    if (menuLevelUpAtivo) return;

    let limiteCima = 0;
    let limiteBaixo = canvas.height;
    let limiteEsq = 0;
    let limiteDir = canvas.width;
    
    player.mov_player(limiteCima, limiteBaixo, limiteEsq, limiteDir);
    controlarPlayers();

    controlarTiros(deltaTime, disparosFeitos);
    atualizarEfeitosArmas(deltaTime);
    if (estadoJogo === 'JOGANDO_2P' && player2.vidaAtual > 0) {
        if (teclasP2.ArrowUp) player2.y -= player2.speed;
        if (teclasP2.ArrowDown) player2.y += player2.speed;
        if (teclasP2.ArrowLeft) player2.x -= player2.speed;
        if (teclasP2.ArrowRight) player2.x += player2.speed;
    }
    //davi
    // Atualiza a inteligência e movimento dos inimigos 

    verificarColisaoTiros();

    if (timerMensagemWave > 0) {
        timerMensagemWave -= deltaTime;
    }

    inimigos.forEach(inimigo => {
        inimigo.atualizarI(inimigos, [], deltaTime);
    });

    if (!descansoAtivo && inimigosParaSpawnar > 0) {
        frameTimer += deltaTime;
        if (frameTimer >= 500) {
            spawnarInimigo();
            inimigosParaSpawnar--;
            frameTimer = 0;
        }
    }
}

let ultimoTempo = 0;

function main(tempoAtual) {

    if (estadoJogo === 'MENU') {
        desenharMenu();
        requestAnimationFrame(main);
        return; // Impede que os monstros comecem a andar atrás de nós!
    } else if (estadoJogo === 'SOBRE') {
        desenharSobre();
        requestAnimationFrame(main);
        return;
    }
    // Calcula quantos milissegundos se passaram entre o frame anterior e o atual
    let deltaTime = tempoAtual - ultimoTempo;
    if (!ultimoTempo) deltaTime = 0;
    ultimoTempo = tempoAtual;

    if (deltaTime > 100) deltaTime = 16;

    des.clearRect(0, 0, canvas.width, canvas.height);

    let jogadoresAtivos = [player];

    // Se clicou em 2 Jogadores E o Jogador 2 estiver vivo, processa ele!
    if (estadoJogo === 'JOGANDO_2P' && player2.vidaAtual > 0) {
        jogadoresAtivos.push(player2);

        // CORREÇÃO: Só move se o menu de level up NÃO estiver ativo (deixa ele travado)
        if (!menuLevelUpAtivo.ativo) {
            // CORREÇÃO VELOCIDADE: Multiplicado por (deltaTime / 1000) para não ficar super rápido
            if (teclasP2.ArrowUp) player2.y -= player2.speed * (deltaTime / 1000);
            if (teclasP2.ArrowDown) player2.y += player2.speed * (deltaTime / 1000);
            if (teclasP2.ArrowLeft) player2.x -= player2.speed * (deltaTime / 1000);
            if (teclasP2.ArrowRight) player2.x += player2.speed * (deltaTime / 1000);
        }

        // Limites de tela para o Jogador 2
        if (player2.x < 0) player2.x = 0;
        if (player2.y < 0) player2.y = 0;
        if (player2.x + player2.w > canvas.width) player2.x = canvas.width - player2.w;
        if (player2.y + player2.h > canvas.height) player2.y = canvas.height - player2.h;



    }

    //. Roda as armas passando a LISTA INTEIRA de uma só vez (resolve o erro!)
    let disparosFeitos = [];
    if (!menuLevelUpAtivo.ativo) {
        disparosFeitos = sistemaArmas.updateWeapons(deltaTime, jogadoresAtivos, inimigos) || [];
    }

    // 3. Desenha os efeitos da arma EM CADA jogador corretamente
    jogadoresAtivos.forEach(jog => {
        sistemaArmas.weapons.forEach(weapon => {
            let imgArma = new Image();
            imgArma.src = weapon.imgSrc;
            des.drawImage(imgArma, jog.x + 10, jog.y + 20, weapon.effectW, weapon.effectH);
        });
    });


    desenha()
    atualiza(menuLevelUpAtivo.ativo ? 0 : deltaTime, disparosFeitos) // Envia o tempo rodado para atualizar as armas corretamente

    requestAnimationFrame(main);
}

iniciarWave();

// Inicializa o primeiro frame passando o tempo de partida
requestAnimationFrame((tempo) => main(tempo));