let canvas = document.getElementById('des')
let des = canvas.getContext('2d')
const ctx = canvas.getContext("2d")


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
// 1. INICIALIZAÇÃO DE ATORES E IMAGENS
// ==========================================

let player = new Player(930, 540, 64, 64, "../Img/bad_coffee.png")
let player2 = new Player(990, 540, 64, 64, "../Img/bad_coffee2.png")
player2.hitbox = { x: 4, y: 4, w: 56, h: 56 };

let teclasP2 = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

window.addEventListener('keydown', (e) => {
    if (teclasP2.hasOwnProperty(e.code)) teclasP2[e.code] = true;
});
window.addEventListener('keyup', (e) => {
    if (teclasP2.hasOwnProperty(e.code)) teclasP2[e.code] = false;
});

player.hitbox = {
    x: 4,
    y: 4,
    w: 56,
    h: 56
};

let sistemaArmas = new GameSystem() // Inicializa o cérebro das armas e itens

const imgBarraXPVazia = new Image();
imgBarraXPVazia.src = '../Img/2xp_bar_img.png'

const imgBarraInventario = new Image();
imgBarraInventario.src = "../Img/barra_item.png";

// Um background por FASE. Índice 0 = Fase 1, 1 = Fase 2, 2 = Fase 3.
const imgBackground = new Image();
imgBackground.src = "../Img/Background.png";

const imgBackground2 = new Image();
imgBackground2.src = "../Img/Background2.png";

const imgBackground3 = new Image();
imgBackground3.src = "../Img/Background3.png";

const imagensFundoPorFase = [imgBackground, imgBackground2, imgBackground3];

// Controla qual background é desenhado. Só é atualizada junto com o início do fade
// (tela já coberta pelo overlay), pra esconder a troca em vez de mostrar na cara.
let faseVisual = 1;

const imgXicara = new Image();
imgXicara.src = "../Img/xicara.png";

const imgFogueteAnimado = new Image();
imgFogueteAnimado.src = "../Img/tiroGjahllahorn_SpriteSheet.png";

const imgKaboom = new Image();
imgKaboom.src = "../Img/kaboom.png";

// Spritesheet da transição de fade
const imgFade = new Image();
imgFade.src = "../Img/fade.png";

// Spritesheet da animação de carregamento (mostrada no canto inferior direito
// enquanto os arquivos do jogo são baixados)
const imgCarregando = new Image();
imgCarregando.src = "../Img/bad-coffee-carregamento.png";

// ==========================================
// 2. SISTEMA DE LEVEL UP (INTERRUPÇÃO)
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

    let alvoXEsquerda = centroX - 300;
    let alvoXDireita = centroX + 300;

    itemEsquerda = { startX: alvoXEsquerda, x: alvoXEsquerda, y: centroY, escala: 0, alpha: 0, dados: op1 };
    itemDireita = { startX: alvoXDireita, x: alvoXDireita, y: centroY, escala: 0, alpha: 0, dados: op2 };
};

function atualizarEdesenharMenuLevelUp(deltaTime) {
    if (!menuLevelUpAtivo) return;

    des.fillStyle = "rgba(0, 0, 0, 0.6)";
    des.fillRect(0, 0, canvas.width, canvas.height);

    let centroX = canvas.width / 2;
    let centroY = canvas.height / 2;
    let tamXicara = 280; // 2x do tamanho original (era 140)

    // Antes a posição Y usava "- tamXicara / 3", o que fazia a xícara subir sozinha
    // conforme ela crescia (quanto maior tamXicara, mais negativo o termo). Com o
    // dobro do tamanho, isso empurraria ela pra cima em cima do texto dos cards.
    // Por isso agora é um deslocamento fixo, mais pra baixo do que a posição antiga.
    let deslocamentoYXicara = 90;

    let alvoY = centroY - 120;
    animacaoXicaraTimer += deltaTime / 1000;
    let t = Math.min(animacaoXicaraTimer * 2, 1);

    itemEsquerda.y = centroY + (alvoY - centroY) * t;
    itemEsquerda.escala = t;
    itemEsquerda.alpha = t;

    itemDireita.y = centroY + (alvoY - centroY) * t;
    itemDireita.escala = t;
    itemDireita.alpha = t;

    if (imgXicara.complete) {
        des.drawImage(imgXicara, itemEsquerda.startX - tamXicara / 2, centroY + deslocamentoYXicara, tamXicara, tamXicara);
        des.drawImage(imgXicara, itemDireita.startX - tamXicara / 2, centroY + deslocamentoYXicara, tamXicara, tamXicara);
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
        desenharIconeContido(item.dados.imgObjeto, -tamanhoIconeEscolha / 2, -20 - tamanhoIconeEscolha, tamanhoIconeEscolha);
    }

    des.fillStyle = "#ffffff";
    des.font = "bold 21px VCROSDMono, Arial";
    des.textAlign = "center";
    des.fillText(item.dados.name, 0, 9);

    des.font = "18px VCROSDMono, Arial";
    des.fillStyle = "#bdc3c7";
    let txtInfo = item.dados.type === 'weapon' ? "ARMA" : "ITEM PASSIVO";
    des.fillText(txtInfo, 0, 39);

    des.font = "bold 19px VCROSDMono, Arial";

    let yText = 79;
    const comparativo = item.dados.comparativo;

    if (comparativo && comparativo.tipo === 'novaArma') {
        des.fillStyle = "#f1c40f";
        des.fillText("NOVA ARMA", 0, yText);
        yText += 26;
        comparativo.atributos.forEach(attr => {
            des.fillStyle = "#e74c3c";
            des.fillText(`${attr.label}: ${attr.valor}`, 0, yText);
            yText += 25;
        });
    } else if (comparativo && comparativo.tipo === 'upgradeArma') {
        des.fillStyle = "#2ecc71";
        des.fillText(`MELHORIA (Nv. ${comparativo.nivelAtual} -> ${comparativo.nivelAtual + 1})`, 0, yText);
        yText += 26;
        comparativo.mudancas.forEach(m => {
            des.fillStyle = "#2ecc71";
            let sinal = m.delta > 0 ? "+" : "";
            des.fillText(`${m.label}: ${sinal}${m.delta}`, 0, yText);
            yText += 25;
        });
    } else if (comparativo && comparativo.tipo === 'passivo') {
        if (item.dados.description) {
            des.fillStyle = "#f1c40f";
            des.fillText(item.dados.description, 0, yText);
            yText += 26;
        }
        des.fillStyle = "#3498db";
        des.fillText(`${comparativo.label}: ${comparativo.antes} -> ${comparativo.depois}`, 0, yText);
    } else if (item.dados.description) {
        des.fillStyle = "#f1c40f";
        des.fillText(item.dados.description, 0, yText);
    } else {
        des.fillStyle = "#e74c3c";
        des.fillText(`Dano: ${item.dados.damage}`, 0, yText);
        des.fillStyle = "#3498db";
        des.fillText(`Recarga: ${item.dados.cooldown}ms`, 0, yText + 30);
    }

    des.restore();
}

canvas.addEventListener('click', (e) => {
    if (!menuLevelUpAtivo) return;

    let rect = canvas.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;
    let mouseY = e.clientY - rect.top;

    let largCard = 245;
    let altCard = 280;

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
// 3. CONTROLES DE MOVIMENTO DO JOGADOR
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
// 4. MÚSICA DE FUNDO (Fases 1/2 e Boss)
// ==========================================

let volumeMusica = 0.15;          // Volume da música de fundo (0 a 1). 
const DURACAO_FADE_MUSICA = 2500; // ms que o fade out da música leva até silenciar de vez.

const musicaFundo = new Audio();
musicaFundo.loop = true;

let fadeMusicaInterval = null; // Controla o fade out em andamento, se houver

// Troca (ou começa) a música de fundo tocando em loop no volume de "volumeMusica".
function tocarMusicaFase(caminho) {
    if (fadeMusicaInterval) {
        clearInterval(fadeMusicaInterval);
        fadeMusicaInterval = null;
    }
    musicaFundo.src = caminho;
    musicaFundo.volume = volumeMusica;
    musicaFundo.currentTime = 0;
    musicaFundo.play().catch(() => { });
}

// Abaixa o volume aos poucos até 0 e então pausa. "aoTerminar" (opcional) roda depois,
// útil pra emendar a próxima música assim que o fade out acabar.
function pararMusicaComFade(aoTerminar) {
    if (fadeMusicaInterval) clearInterval(fadeMusicaInterval);

    const passos = 25;
    const intervaloMs = DURACAO_FADE_MUSICA / passos;
    const volumeInicial = musicaFundo.volume;
    let passoAtual = 0;

    fadeMusicaInterval = setInterval(() => {
        passoAtual++;
        musicaFundo.volume = Math.max(0, volumeInicial * (1 - passoAtual / passos));

        if (passoAtual >= passos) {
            clearInterval(fadeMusicaInterval);
            fadeMusicaInterval = null;
            musicaFundo.pause();
            if (typeof aoTerminar === 'function') aoTerminar();
        }
    }, intervaloMs);
}

// Para a música na hora, sem fade (usado no Game Over e na Vitória).
function pararMusicaImediatamente() {
    if (fadeMusicaInterval) {
        clearInterval(fadeMusicaInterval);
        fadeMusicaInterval = null;
    }
    musicaFundo.pause();
}

// ==========================================
// 5. SISTEMA E CONTROLE DE TIROS (ARMAS)
// ==========================================

let efeitosArmas = [];
let explosoes = []; // Animações de explosão
let tirosNaTela = [];

// Toca um efeito sonoro sem travar o jogo se o navegador bloquear o autoplay.
// Cada chamada cria uma instância nova de Audio para permitir sons sobrepostos.
function tocarSom(caminho) {
    if (!caminho) return;
    const audio = new Audio(caminho);
    audio.play().catch(() => { });
}

// Mantém as lâminas da Adaga sempre girando, sem depender de disparo/cooldown.
// Cada jogador vivo tem seu próprio conjunto de lâminas por arma 'orbit' que possua,
// e o tamanho desse conjunto é sempre igual a weapon.projectileCount (1 por nível de upgrade).
// Toda vez que esse conjunto muda de tamanho (comprou/upou a adaga), TODAS as lâminas desse
// jogador são reespaçadas em ângulos iguais entre si (igual ao desenho: sempre uma formação
// simétrica em volta do jogador, começando "pra cima"). Se o tamanho não mudou, não faz nada,
// então as lâminas continuam girando sem interrupção entre um frame e outro.
function sincronizarAdagas() {
    let jogadoresAtivos = [player];
    if (estadoJogo === 'JOGANDO_2P') jogadoresAtivos.push(player2);
    jogadoresAtivos = jogadoresAtivos.filter(p => p.vidaAtual > 0);

    sistemaArmas.weapons.forEach(weapon => {
        if (weapon.shootBehavior !== 'orbit') return;

        if (!weapon.imgObjeto) {
            weapon.imgObjeto = new Image();
            weapon.imgObjeto.src = weapon.bulletImgSrc;
        }

        jogadoresAtivos.forEach(atirador => {
            let ladasAtuais = tirosNaTela.filter(t => t.permanente && t.weaponId === weapon.id && t.atirador === atirador);

            if (ladasAtuais.length === weapon.projectileCount) return; // nada mudou, mantém como está

            // Cria as lâminas que faltam (posição/ângulo exatos não importam aqui,
            // porque todo mundo é reespaçado igual embaixo, na mesma sincronização)
            for (let i = ladasAtuais.length; i < weapon.projectileCount; i++) {
                let novaAdaga = {
                    atirador: atirador,
                    weaponId: weapon.id,
                    shootBehavior: 'orbit',
                    type: weapon.projectileType,
                    img: weapon.imgObjeto,
                    anguloOrbita: 0,
                    angulo: 0,
                    x: atirador.x,
                    y: atirador.y,
                    w: weapon.projectileW || 87,
                    h: weapon.projectileH || 51,
                    hitboxW: larguraHitboxDaArma(weapon, 87),
                    hitboxH: alturaHitboxDaArma(weapon, 51),
                    permanente: true,
                    ultimosHits: new Map() // inimigo -> ms restantes até poder acertar esse mesmo inimigo de novo
                };
                tirosNaTela.push(novaAdaga);
                ladasAtuais.push(novaAdaga);
            }

            // Reespaça TODAS as lâminas (as antigas e as novas) em ângulos iguais entre si
            let espacamento = (Math.PI * 2) / weapon.projectileCount;
            ladasAtuais.forEach((lada, i) => {
                lada.anguloOrbita = (-Math.PI / 2) + (espacamento * i);
            });
        });
    });
}

// Tamanho da área de acerto de uma bala, lido do catálogo da arma (armas.js).
// Se a arma não definir hitboxW/hitboxH, usa o tamanho do sprite do projétil.
function larguraHitboxDaArma(arma, padrao) {
    return arma?.hitboxW || arma?.projectileW || padrao;
}

function alturaHitboxDaArma(arma, padrao) {
    return arma?.hitboxH || arma?.projectileH || padrao;
}

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

                // Som do disparo, tocado uma única vez por tiro (não por pellet/projétil da cone).
                // O Gjallahorn ainda soma o som do foguete em pleno voo, disparado junto do tiro
                // já que não há outro gatilho de "meio do trajeto" no fluxo atual.
                tocarSom(armaDoTiro.somDisparo);
                if (armaDoTiro.somMidair) tocarSom(armaDoTiro.somMidair);
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
                    hitboxW: larguraHitboxDaArma(armaDoTiro, 36),
                    hitboxH: alturaHitboxDaArma(armaDoTiro, 36),
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
                        hitboxW: larguraHitboxDaArma(armaDoTiro, 16),
                        hitboxH: alturaHitboxDaArma(armaDoTiro, 16),
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
                    hitboxW: larguraHitboxDaArma(armaDoTiro, 60),
                    hitboxH: alturaHitboxDaArma(armaDoTiro, 60),
                    inimigosAtingidosIda: [],
                    inimigosAtingidosVolta: [],
                    atirador: disparo.atirador
                });
            }
        });
    }

    sincronizarAdagas(); // essa função serve para com que as adagas funcionem sem precisar de cooldown

    for (let i = tirosNaTela.length - 1; i >= 0; i--) {
        let tiro = tirosNaTela[i];

        if (tiro.shootBehavior === 'orbit') {
            // Lê velocidade/raio direto da arma (não guardados na lâmina) pra upgrades
            // (spinSpeed, orbitRadius) valerem na hora pra todas as lâminas já existentes.
            let armaAdaga = sistemaArmas.weapons.find(w => w.id === tiro.weaponId);
            let velGiro = armaAdaga?.spinSpeed || 2;
            let raio = armaAdaga?.orbitRadius || 150;
            let centroPx = tiro.atirador.x + tiro.atirador.w / 2;
            let centroPy = tiro.atirador.y + tiro.atirador.h / 2;

            tiro.anguloOrbita += velGiro * (deltaTime / 1000);
            tiro.angulo = tiro.anguloOrbita;

            tiro.x = centroPx + Math.cos(tiro.anguloOrbita) * raio;
            tiro.y = centroPy + Math.sin(tiro.anguloOrbita) * raio;

            // Conta regressiva do cooldown de hit por inimigo (ver verificarColisaoTiros)
            if (tiro.ultimosHits && tiro.ultimosHits.size > 0) {
                tiro.ultimosHits.forEach((restante, inimigoRef) => {
                    let novoRestante = restante - deltaTime;
                    if (novoRestante <= 0) tiro.ultimosHits.delete(inimigoRef);
                    else tiro.ultimosHits.set(inimigoRef, novoRestante);
                });
            }
        } else {
            tiro.x += tiro.vx * (deltaTime / 1000);
            tiro.y += tiro.vy * (deltaTime / 1000);
        }

        if (!tiro.permanente) tiro.tempoVida -= deltaTime; // adaga é permanente, não tem tempoVida pra descontar

        if (tiro.type === 'big_boom') {
            tiro.frameTimer += deltaTime;
            if (tiro.frameTimer >= 100) {
                tiro.frameX = (tiro.frameX + 1) % 5;
                tiro.frameTimer = 0;
            }
        }

        if (tiro.shootBehavior === 'boomerang') {
            // Professor. Se você perguntar. Não, eu não pensaria em fazer isso aquí, estou sendo honesto nessa. - João
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

    tirosNaTela = tirosNaTela.filter(t => t.permanente || t.tempoVida > 0);
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

        // Caixa de acerto do tiro: retângulo centrado em (tiro.x, tiro.y), com o
        // tamanho definido em armas.js (hitboxW / hitboxH da arma).
        // Calculada uma vez só por tiro, fora do laço de inimigos.
        let larguraTiro = tiro.hitboxW || tiro.w || 50;
        let alturaTiro = tiro.hitboxH || tiro.h || 50;
        let tiroEsq = tiro.x - larguraTiro / 2;
        let tiroTopo = tiro.y - alturaTiro / 2;

        for (let j = inimigos.length - 1; j >= 0; j--) {
            let inimigo = inimigos[j];

            // Caixa do inimigo: o MESMO this.hitbox que Inimigos.js já calcula
            // (80% do sprite, centralizado). Por isso um Boss grande agora tem uma
            // área de acerto grande, e uma larva tem uma área pequena.
            let inimigoEsq = inimigo.x + inimigo.hitbox.x;
            let inimigoTopo = inimigo.y + inimigo.hitbox.y;

            // Colisão AABB (retângulo x retângulo): 4 comparações, sem Math.sqrt.
            let colidiu = tiroEsq < inimigoEsq + inimigo.hitbox.w &&
                          tiroEsq + larguraTiro > inimigoEsq &&
                          tiroTopo < inimigoTopo + inimigo.hitbox.h &&
                          tiroTopo + alturaTiro > inimigoTopo;

            if (colidiu) {
                if (tiro.permanente) {
                    // Adaga: não existe mais "só acerta 1x na vida do tiro" (ela nunca expira).
                    // Em vez disso, cada lâmina tem um cooldown de hit de 500ms POR inimigo.
                    let restante = tiro.ultimosHits.get(inimigo) || 0;
                    if (restante > 0) continue;
                    tiro.ultimosHits.set(inimigo, 500);
                } else if (tiro.type === 'force' || tiro.shootBehavior === 'boomerang') {
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
                    let armaBigBoom = sistemaArmas.weapons.find(w => w.projectileType === 'big_boom');

                    // Área de dano da explosão: retângulo centrado no ponto do impacto.
                    // Tamanho configurável em armas.js (explosionW / explosionH do Gjallahorn).
                    let larguraExplosao = armaBigBoom?.explosionW || 240;
                    let alturaExplosao = armaBigBoom?.explosionH || 240;
                    let explosaoEsq = tiro.x - larguraExplosao / 2;
                    let explosaoTopo = tiro.y - alturaExplosao / 2;

                    for (let k = inimigos.length - 1; k >= 0; k--) {
                        let vitimaArea = inimigos[k];
                        let vitimaEsq = vitimaArea.x + vitimaArea.hitbox.x;
                        let vitimaTopo = vitimaArea.y + vitimaArea.hitbox.y;

                        // Mesma colisão AABB usada nos tiros, sem Math.sqrt
                        let dentroDaExplosao = explosaoEsq < vitimaEsq + vitimaArea.hitbox.w &&
                                               explosaoEsq + larguraExplosao > vitimaEsq &&
                                               explosaoTopo < vitimaTopo + vitimaArea.hitbox.h &&
                                               explosaoTopo + alturaExplosao > vitimaTopo;

                        if (dentroDaExplosao) {
                            vitimaArea.tomarDano(tiro.damage);
                        }
                    }

                    // Som da explosão, tocado no exato instante em que o dano em área é aplicado
                    if (armaBigBoom) tocarSom(armaBigBoom.somExplosao);

                    // Dispara a animação de explosão
                    explosoes.push({
                        x: tiro.x,
                        y: tiro.y,
                        frameX: 0,
                        frameTimer: 0,
                        tamanho: Math.max(larguraExplosao, alturaExplosao) // cobre visualmente a área do dano
                    });
                } else if (tiro.permanente) {
                    // Adaga: dano lido direto da arma (assim upgrades de dano valem na hora),
                    // com o crítico rolado aqui já que não existe mais um "disparo" único.
                    let armaAdaga = sistemaArmas.weapons.find(w => w.id === tiro.weaponId);
                    let dano = armaAdaga ? armaAdaga.damage : 0;
                    if (Math.random() < sistemaArmas.critChance) dano = Math.floor(dano * sistemaArmas.critMultiplier);
                    inimigo.tomarDano(dano);
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

// Atualiza a animação das explosões (avança quadro a quadro e remove ao terminar)
function atualizarExplosoes(deltaTime) {
    const totalQuadros = 7; // kaboom.png tem 7 quadros de 32x32

    for (let i = explosoes.length - 1; i >= 0; i--) {
        let exp = explosoes[i];
        exp.frameTimer += deltaTime;

        if (exp.frameTimer >= 60) {
            exp.frameX++;
            exp.frameTimer = 0;
        }

        if (exp.frameX >= totalQuadros) {
            explosoes.splice(i, 1); // Animação terminou, remove
        }
    }
}

function desenharExplosoes() {
    if (!imgKaboom.complete || imgKaboom.naturalWidth === 0) return;

    const totalQuadros = 7;
    let larguraQuadro = imgKaboom.width / totalQuadros;
    let alturaQuadro = imgKaboom.height;

    explosoes.forEach(exp => {
        des.drawImage(
            imgKaboom,
            exp.frameX * larguraQuadro, 0, larguraQuadro, alturaQuadro,
            exp.x - exp.tamanho / 2, exp.y - exp.tamanho / 2, exp.tamanho, exp.tamanho
        );
    });
}

// ==========================================
// 5.1 TRANSIÇÃO DE TELA + TELA DE CARREGAMENTO
// ==========================================
//
// O fade.png é lido nos DOIS sentidos:
//   quadro 0  = tela 100% preta (coberta)
//   quadro 12 = totalmente transparente (jogo visível)
// Por isso "cobrir" é tocar 12 -> 0 e "revelar" é tocar 0 -> 12.
//
// A transição tem 3 etapas: COBRINDO -> ESPERANDO -> REVELANDO.
// Na etapa ESPERANDO a animação fica parada no quadro preto, que é onde
// acontece o pré-carregamento dos arquivos (ou só uma pausa curta, na troca de fase).

const TOTAL_QUADROS_FADE = 13;   // fade.png tem 13 quadros
const DURACAO_QUADRO_FADE = 40;  // ms por quadro. Mude aqui pra ajustar a velocidade da transição
let delayTransicaoFase = 3000;   // ms de espera (com "Fase Concluída!" na tela) antes de começar a animação de fade. Mude aqui se precisar.

const TOTAL_QUADROS_CARREGANDO = 3;    // bad-coffee-carregamento.png tem 3 quadros
const DURACAO_QUADRO_CARREGANDO = 160; // ms por quadro da animação de carregamento
const TAMANHO_CARREGANDO = 96;         // altura em pixels que a animação ocupa na tela
const MARGEM_CARREGANDO = 40;          // distância da animação até as bordas da tela
const PAUSA_TROCA_DE_FASE = 600;       // ms com a tela preta na troca de fase (nada pra carregar, só respiro visual)

const QUADRO_COBERTO = 0;                        // quadro totalmente preto
const QUADRO_REVELADO = TOTAL_QUADROS_FADE - 1;  // quadro totalmente transparente

// Etapas possíveis: 'inativo' | 'cobrindo' | 'esperando' | 'revelando'
let transicaoFade = {
    etapa: 'inativo',
    frameX: QUADRO_REVELADO,
    frameTimer: 0,
    aoCobrir: null,           // função chamada no instante em que a tela fica 100% preta
    mostrarCarregando: false, // desenha a animação de carregamento durante a etapa 'esperando'
    esperaMinima: 0,          // ms mínimos parados no quadro preto
    timerEspera: 0,
    liberado: false           // só revela depois que isso virar true
};

let animacaoCarregando = { frameX: 0, frameTimer: 0 };

// true enquanto qualquer etapa da transição estiver rodando.
// Usado pelo menu pra ignorar cliques no meio da animação.
function transicaoEmAndamento() {
    return transicaoFade.etapa !== 'inativo';
}

// true enquanto a tela está preta (cobrindo ou esperando o carregamento).
// O jogo fica congelado nesse período pra nada acontecer fora da vista do jogador.
function telaCobertaPelaTransicao() {
    return transicaoFade.etapa === 'cobrindo' || transicaoFade.etapa === 'esperando';
}

// Inicia a transição cobrindo a tela.
// opcoes.aoCobrir          -> executado quando a tela terminar de ficar preta
// opcoes.mostrarCarregando -> mostra a animação de carregamento enquanto espera
// opcoes.esperaMinima      -> ms mínimos com a tela preta antes de revelar
// opcoes.revelarSozinho    -> se true, revela sem precisar de liberarRevelacao()
function iniciarTransicao(opcoes = {}) {
    transicaoFade.etapa = 'cobrindo';
    transicaoFade.frameX = QUADRO_REVELADO;
    transicaoFade.frameTimer = 0;
    transicaoFade.aoCobrir = opcoes.aoCobrir || null;
    transicaoFade.mostrarCarregando = opcoes.mostrarCarregando === true;
    transicaoFade.esperaMinima = opcoes.esperaMinima || 0;
    transicaoFade.timerEspera = 0;
    transicaoFade.liberado = opcoes.revelarSozinho === true;

    animacaoCarregando.frameX = 0;
    animacaoCarregando.frameTimer = 0;
}

// Avisa a transição que o carregamento acabou e ela já pode revelar a tela.
function liberarRevelacao() {
    transicaoFade.liberado = true;
}

function atualizarEdesenharTransicaoFade(deltaTime) {
    if (transicaoFade.etapa === 'inativo') return;

    if (transicaoFade.etapa === 'cobrindo') {
        transicaoFade.frameTimer += deltaTime;
        if (transicaoFade.frameTimer >= DURACAO_QUADRO_FADE) {
            transicaoFade.frameTimer = 0;
            transicaoFade.frameX--;

            // Chegou no quadro preto: pausa aqui e dispara a ação da troca
            if (transicaoFade.frameX <= QUADRO_COBERTO) {
                transicaoFade.frameX = QUADRO_COBERTO;
                transicaoFade.etapa = 'esperando';

                // Zera antes de chamar pra que a função não sobrescreva uma
                // transição nova que ela mesma tenha iniciado.
                let acao = transicaoFade.aoCobrir;
                transicaoFade.aoCobrir = null;
                if (acao) acao();
            }
        }
    } else if (transicaoFade.etapa === 'esperando') {
        transicaoFade.timerEspera += deltaTime;

        if (transicaoFade.liberado && transicaoFade.timerEspera >= transicaoFade.esperaMinima) {
            transicaoFade.etapa = 'revelando';
            transicaoFade.frameTimer = 0;
            transicaoFade.mostrarCarregando = false;
        }
    } else if (transicaoFade.etapa === 'revelando') {
        transicaoFade.frameTimer += deltaTime;
        if (transicaoFade.frameTimer >= DURACAO_QUADRO_FADE) {
            transicaoFade.frameTimer = 0;
            transicaoFade.frameX++;

            if (transicaoFade.frameX >= QUADRO_REVELADO) {
                transicaoFade.frameX = QUADRO_REVELADO;
                transicaoFade.etapa = 'inativo';
                return; // último quadro é transparente, não precisa desenhar nada
            }
        }
    }

    desenharQuadroDoFade();

    if (transicaoFade.mostrarCarregando) {
        atualizarEdesenharAnimacaoCarregando(deltaTime);
    }
}

function desenharQuadroDoFade() {
    // Se o spritesheet ainda não carregou, cobre com preto na mesma proporção
    // do quadro atual — assim a tela nunca "vaza" o jogo durante a transição.
    if (!imgFade.complete || imgFade.naturalWidth === 0) {
        let opacidade = 1 - (transicaoFade.frameX / QUADRO_REVELADO);
        des.fillStyle = `rgba(0, 0, 0, ${opacidade})`;
        des.fillRect(0, 0, canvas.width, canvas.height);
        return;
    }

    let larguraQuadro = imgFade.naturalWidth / TOTAL_QUADROS_FADE;
    let alturaQuadro = imgFade.naturalHeight;
    des.drawImage(
        imgFade,
        transicaoFade.frameX * larguraQuadro, 0, larguraQuadro, alturaQuadro,
        0, 0, canvas.width, canvas.height
    );
}

// Anima o spritesheet de carregamento em loop no canto inferior direito da tela.
function atualizarEdesenharAnimacaoCarregando(deltaTime) {
    animacaoCarregando.frameTimer += deltaTime;
    if (animacaoCarregando.frameTimer >= DURACAO_QUADRO_CARREGANDO) {
        animacaoCarregando.frameTimer = 0;
        animacaoCarregando.frameX = (animacaoCarregando.frameX + 1) % TOTAL_QUADROS_CARREGANDO;
    }

    if (!imgCarregando.complete || imgCarregando.naturalWidth === 0) return;

    let larguraQuadro = imgCarregando.naturalWidth / TOTAL_QUADROS_CARREGANDO;
    let alturaQuadro = imgCarregando.naturalHeight;

    // Mantém a proporção original do quadro, usando TAMANHO_CARREGANDO como altura
    let escala = TAMANHO_CARREGANDO / alturaQuadro;
    let larguraNaTela = larguraQuadro * escala;
    let alturaNaTela = alturaQuadro * escala;

    des.drawImage(
        imgCarregando,
        animacaoCarregando.frameX * larguraQuadro, 0, larguraQuadro, alturaQuadro,
        canvas.width - larguraNaTela - MARGEM_CARREGANDO,
        canvas.height - alturaNaTela - MARGEM_CARREGANDO,
        larguraNaTela, alturaNaTela
    );
}

// ==========================================
// 5.2 PRÉ-CARREGAMENTO DOS ARQUIVOS DO JOGO
// ==========================================
//
// Baixa tudo de uma vez com a tela preta, pra que durante a partida nenhum
// sprite apareça em branco e nenhum som atrase na primeira vez que tocar.

const IMAGENS_DO_JOGO = [
    "../Img/2xp_bar_img.png",
    "../Img/xp_bar.png",
    "../Img/barra_item.png",
    "../Img/Background.png",
    "../Img/Background2.png",
    "../Img/Background3.png",
    "../Img/menu.png",
    "../Img/fade.png",
    "../Img/bad-coffee-carregamento.png",
    "../Img/bad_coffee.png",
    "../Img/bad_coffee2.png",
    "../Img/xicara.png",
    "../Img/kaboom.png",
    "../Img/bala.png",
    "../Img/tiroGjahllahorn.png",
    "../Img/tiroGjahllahorn_SpriteSheet.png",
    "../Img/acaro.png",
    "../Img/bichoMineiro.png",
    "../Img/broca.png",
    "../Img/casca.png",
    "../Img/larva.png",
    "../Img/ninfa.png",
    "../Img/ninfa_cavando.png",
    "../Img/quesadagigas.png",
    "../Img/armadura.png",
    "../Img/milk.png",
    "../Img/seringa.png",
    "../Img/armas/adaga.png",
    "../Img/armas/gjahllahorn.png",
    "../Img/armas/KS-23.png",
    "../Img/armas/lightsaber.png",
    "../Img/armas/mp5.png",
    "../Img/armas/p320.png"
];

const AUDIOS_DO_JOGO = [
    "../music/fuel-abbynoise-main-version-02-28-17433.mp3",
    "../music/scorcher-abbynoise-main-version-21507-02-23.mp3",
    "../sound/gjalahorn fire.mp3",
    "../sound/gjalahorn kaboom.mp3",
    "../sound/gjalahorn midair.mp3",
    "../sound/ks shot.mp3",
    "../sound/lightsaber.mp3",
    "../sound/mp5 shot.mp3",
    "../sound/p320 shot.mp3"
];

// Guarda as referências pro navegador não descartar o que já foi baixado
let recursosPrecarregados = [];
let recursosJaCarregados = false;

// Trava de segurança: se algum arquivo nunca terminar de baixar (conexão ruim,
// evento que não dispara em certos navegadores), o jogo entra assim mesmo.
const TIMEOUT_CARREGAMENTO = 20000; // ms

function precarregarRecursos(aoTerminar) {
    if (recursosJaCarregados) {
        aoTerminar();
        return;
    }

    let totalDeArquivos = IMAGENS_DO_JOGO.length + AUDIOS_DO_JOGO.length;
    let restantes = totalDeArquivos;
    let jaFinalizou = false;

    function finalizar() {
        if (jaFinalizou) return;
        jaFinalizou = true;
        recursosJaCarregados = true;
        aoTerminar();
    }

    // Um arquivo que falha (404, formato não suportado) não pode travar a tela
    // de carregamento pra sempre — por isso erro também conta como concluído.
    function contarUmArquivo() {
        let jaContou = false;
        return function () {
            if (jaContou) return;
            jaContou = true;

            restantes--;
            if (restantes <= 0) finalizar();
        };
    }

    if (totalDeArquivos === 0) {
        finalizar();
        return;
    }

    setTimeout(finalizar, TIMEOUT_CARREGAMENTO);

    IMAGENS_DO_JOGO.forEach(caminho => {
        let contar = contarUmArquivo();
        let imagem = new Image();
        imagem.onload = contar;
        imagem.onerror = contar;
        imagem.src = caminho;
        recursosPrecarregados.push(imagem);
    });

    AUDIOS_DO_JOGO.forEach(caminho => {
        let contar = contarUmArquivo();
        let audio = new Audio();
        audio.preload = "auto";
        audio.addEventListener('canplaythrough', contar);
        audio.addEventListener('error', contar);
        audio.src = caminho;
        audio.load();
        recursosPrecarregados.push(audio);
    });
}

// Chamado pelo menu ao clicar em "Um Jogador" / "Dois Jogadores".
// A tela é coberta ANTES de trocar de estado: o jogo só começa a rodar
// quando a tela já está preta, e só aparece depois que tudo carregou.
function iniciarJogoComCarregamento(estadoDestino) {
    if (transicaoEmAndamento()) return; // ignora clique repetido

    iniciarTransicao({
        mostrarCarregando: true,
        aoCobrir: function () {
            estadoJogo = estadoDestino;
            tocarMusicaFase("../music/fuel-abbynoise-main-version-02-28-17433.mp3");
            precarregarRecursos(liberarRevelacao);
        }
    });
}

// ==========================================
// 6. GERENCIADOR DE INIMIGOS E LOGICA DE WAVES
// ==========================================

let faseAtual = 1;
let pontos = 0;
let gameOver = false;
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

    // Ninfas do Boss: nascem em posições aleatórias DENTRO da tela visível, pra espalhar a pressão pelo mapa em vez de empilhar
    // tudo perto dele. A margem evita que a ninfa nasça cortada pra fora da borda.
    spawnarNinfas: function (quantidade) {
        let configNinfa = TIPOS_INIMIGOS.ninfa || TIPOS_INIMIGOS.larva || { largura: 75, altura: 50, img: "../Img/ninfa.png" };
        let margem = 20;

        for (let i = 0; i < quantidade; i++) {
            let larguraUtil = Math.max(canvas.width - configNinfa.largura - margem * 2, 0);
            let alturaUtil = Math.max(canvas.height - configNinfa.altura - margem * 2, 0);

            let spawnX = margem + Math.random() * larguraUtil;
            let spawnY = margem + Math.random() * alturaUtil;

            let novaNinfa = new Inimigo(
                spawnX, spawnY,
                configNinfa.largura, configNinfa.altura,
                configNinfa.img, configNinfa, contextoDoJogo
            );

            inimigos.push(novaNinfa);
            inimigosVivos++;
        }
    }
};

function iniciarWave() {
    descansoAtivo = false;

    if (faseAtual === 3 && waveAtual === 3) {
        textoMensagemWave = "ALERTA DE BOSS: QUESADAS GIGAS!";
        timerMensagemWave = 4000;
        inimigosParaSpawnar = 0; // Boss é spawnado manualmente, sem fila comum
        inimigosVivos = 1;
        spawnarBoss();

        // Fade out da música das Fases 1/2 e, assim que sumir de vez, entra a música do Boss
        pararMusicaComFade(() => tocarMusicaFase("../music/scorcher-abbynoise-main-version-21507-02-23.mp3"));
    } else {
        textoMensagemWave = `FASE ${faseAtual} - WAVE ${waveAtual}`;
        timerMensagemWave = 3500;

        let numeroWaveTotal = ((faseAtual - 1) * 3) + waveAtual;
        let quantidadeNestaWave = 3 + (numeroWaveTotal * 2);

        inimigosParaSpawnar = quantidadeNestaWave;
        inimigosVivos = quantidadeNestaWave;
    }
}

// ==========================================
// 6.1 RETORNO DOS JOGADORES NO FIM DA FASE
// ==========================================
// No modo cooperativo, quem morreu volta ao vivo na troca de fase, pra que o
// parceiro não termine o jogo sozinho. Só vale no 2P: no solo, a morte do
// Jogador 1 já encerra a partida (gameOver), então não existe fase seguinte.

const PROPORCAO_VIDA_AO_REVIVER = 0.5; // 0.5 = metade da vida máxima. Mude aqui se quiserem mais/menos.
const DURACAO_AVISO_RETORNO = 2500;    // ms que o aviso "JOGADOR X VOLTOU!" fica na tela

// Devolve um jogador morto ao jogo: metade da vida máxima e posição no centro da tela.
function reviverJogador(jogador) {
    jogador.vidaAtual = jogador.vidaMaxima * PROPORCAO_VIDA_AO_REVIVER;

    jogador.x = canvas.width / 2 - jogador.w / 2;
    jogador.y = canvas.height / 2 - jogador.h / 2;
}

function reviverJogadoresMortos() {
    if (estadoJogo !== 'JOGANDO_2P') return;

    let nomes = [];
    if (player.vidaAtual <= 0) {
        reviverJogador(player);
        nomes.push("JOGADOR 1");
    }
    if (player2.vidaAtual <= 0) {
        reviverJogador(player2);
        nomes.push("JOGADOR 2");
    }

    if (nomes.length === 0) return;

    // O aviso é escrito AQUI, no instante em que o jogador volta de fato (com a tela
    // ainda preta), pra ele já estar na tela quando a transição revelar. A fase/wave
    // continua visível na caixa do HUD lá em cima, então nada de informação se perde.
    textoMensagemWave = `${nomes.join(" e ")} VOLTOU!`;
    timerMensagemWave = DURACAO_AVISO_RETORNO;
}

function verificarFimDaWave() {
    if (inimigosVivos <= 0 && inimigosParaSpawnar <= 0) {
        if (faseAtual === 3 && waveAtual === 3) {
            jogoVencido = true;
            textoMensagemWave = "PARABÉNS!!";
            timerMensagemWave = 999999;
            pararMusicaImediatamente();
            return;
        }

        // Se concluiu a Wave 3 de qualquer fase, avança de Fase e reseta as Waves para 1
        if (waveAtual === 3) {
            textoMensagemWave = "Fase Concluída!";
            timerMensagemWave = delayTransicaoFase;
            faseAtual++;
            waveAtual = 1;
            // Espera "delayTransicaoFase" ms mostrando o texto antes de iniciar a transição de tela.
            // A tela cobre, troca o background com o jogador sem ver (faseVisual), dá uma
            // pausa curta e revela a fase nova — mesma animação usada na entrada do jogo,
            // só que sem a etapa de carregamento, já que os arquivos já estão na memória.
            setTimeout(() => {
                iniciarTransicao({
                    revelarSozinho: true,
                    esperaMinima: PAUSA_TROCA_DE_FASE,
                    aoCobrir: () => {
                        faseVisual = faseAtual;
                        // Revive com a tela já preta: o jogador reaparece no centro
                        // junto com a fase nova, sem "brotar" na frente de quem sobreviveu.
                        reviverJogadoresMortos();
                    }
                });
            }, delayTransicaoFase);
        } else {
            // Caso contrário, apenas avança para a próxima Wave dentro da mesma Fase
            textoMensagemWave = "WAVE CONCLUÍDA!";
            timerMensagemWave = 2000;
            waveAtual++;
        }

        descansoAtivo = true;
        setTimeout(iniciarWave, 3000); // 3 segundos de descanso/preparação
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

    let numeroWaveTotal = ((faseAtual - 1) * 3) + waveAtual;

    const pragasDisponiveis = ["acaro"];
    if (numeroWaveTotal >= 3) pragasDisponiveis.push("broca");
    if (numeroWaveTotal >= 5) pragasDisponiveis.push("bichoMineiro");

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
        ctx.font = "bold 14px VCROSDMono, Arial";
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

    // Caixa do HUD adaptada para mostrar Fase e Wave
    let largCaixa = 260;
    let altCaixa = 40;
    let xCaixa = (canvas.width / 2) - (largCaixa / 2);
    let yCaixa = 15;

    contexto.fillStyle = "rgba(0, 0, 0, 0.7)";
    contexto.fillRect(xCaixa, yCaixa, largCaixa, altCaixa);

    contexto.strokeStyle = "#f1c40f";
    contexto.lineWidth = 2;
    contexto.strokeRect(xCaixa, yCaixa, largCaixa, altCaixa);

    contexto.fillStyle = "#ffffff";
    contexto.font = "bold 14px VCROSDMono, Arial";
    contexto.textAlign = "center";
    contexto.textBaseline = "middle";

    // Só "inimigosVivos": ele JÁ representa a wave inteira (nasce com o total da wave
    // e só diminui em removerInimigo). Somar inimigosParaSpawnar contava os mesmos
    // inimigos duas vezes, e o número caía sozinho conforme cada um nascia.
    let totalRestante = inimigosVivos;
    let textoTop = `Fase ${faseAtual} - Wave ${waveAtual}   |   Resta: ${totalRestante}`;
    contexto.fillText(textoTop, canvas.width / 2, yCaixa + (altCaixa / 2));

    // Mensagem gigante centralizada ("Fase X - Wave Y", "Alerta de Boss", etc.)
    if (timerMensagemWave > 0) {
        let alpha = Math.min(timerMensagemWave / 1000, 1);
        contexto.globalAlpha = alpha;

        // Sombra projetada do texto
        contexto.fillStyle = "rgba(0, 0, 0, 0.5)";
        contexto.font = "bold 42px VCROSDMono, Arial";
        contexto.fillText(textoMensagemWave, (canvas.width / 2) + 3, (canvas.height / 3) + 3);

        // Cor do texto: Vermelho intimidador para o Boss, Amarelo para waves normais
        contexto.fillStyle = (faseAtual === 3 && waveAtual === 3) ? "#e74c3c" : "#f1c40f";
        contexto.fillText(textoMensagemWave, canvas.width / 2, canvas.height / 3);
    }

    contexto.restore();
}

// Desenha uma imagem "contida" dentro de um quadrado de "tamanho" px, sem esticar:
// mantém a proporção original do arquivo e centraliza o resultado no slot.
function desenharIconeContido(img, x, y, tamanho) {
    let escala = Math.min(tamanho / img.naturalWidth, tamanho / img.naturalHeight);
    let w = img.naturalWidth * escala;
    let h = img.naturalHeight * escala;
    let offsetX = (tamanho - w) / 2;
    let offsetY = (tamanho - h) / 2;
    des.drawImage(img, x + offsetX, y + offsetY, w, h);
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
    des.font = "bold 10px VCROSDMono, Arial";
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
                desenharIconeContido(arma.imgObjeto, slotX + 4, posY + 8, tamanhoIcone);
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
                desenharIconeContido(item.imgObjeto, slotX + 4, posY + 8, tamanhoIcone);
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
    des.font = "bold 13px VCROSDMono, Arial";
    des.textAlign = "right";

    let textoXP = `LV. ${sistemaArmas.level}  |  ${sistemaArmas.currentXp} / ${sistemaArmas.xpNeeded} XP`;

    des.strokeStyle = "#000000";
    des.lineWidth = 3;
    des.strokeText(textoXP, canvas.width - 20, alturaBarra + 20);
    des.fillText(textoXP, canvas.width - 20, alturaBarra + 20);
    des.textAlign = "left";
}

// ============================ MAIN ===================================
// desenharMenu() e desenharSobre() agora vivem em menu.js

// Botão "VOLTAR AO MENU" usado tanto na tela de Derrota quanto na de Vitória.
// Reaproveita mouseX/mouseY (já calculados em menu.js) pra hover e clique.
let botaoVoltarMenuJogo = { x: 0, y: 0, w: 260, h: 55 };

function desenharBotaoVoltarMenuJogo(y) {
    botaoVoltarMenuJogo.x = canvas.width / 2 - botaoVoltarMenuJogo.w / 2;
    botaoVoltarMenuJogo.y = y;

    let hover = mouseX >= botaoVoltarMenuJogo.x && mouseX <= botaoVoltarMenuJogo.x + botaoVoltarMenuJogo.w &&
        mouseY >= botaoVoltarMenuJogo.y && mouseY <= botaoVoltarMenuJogo.y + botaoVoltarMenuJogo.h;

    des.fillStyle = hover ? "#555555" : "#222226";
    des.fillRect(botaoVoltarMenuJogo.x, botaoVoltarMenuJogo.y, botaoVoltarMenuJogo.w, botaoVoltarMenuJogo.h);
    des.strokeStyle = "white";
    des.lineWidth = 2;
    des.strokeRect(botaoVoltarMenuJogo.x, botaoVoltarMenuJogo.y, botaoVoltarMenuJogo.w, botaoVoltarMenuJogo.h);

    des.fillStyle = "white";
    des.font = "bold 18px VCROSDMono, Arial";
    des.textAlign = "center";
    des.textBaseline = "middle";
    des.fillText("VOLTAR AO MENU", botaoVoltarMenuJogo.x + botaoVoltarMenuJogo.w / 2, botaoVoltarMenuJogo.y + botaoVoltarMenuJogo.h / 2);
    des.textBaseline = "alphabetic";
}

// Clique no botão de Voltar ao Menu (só reage quando a tela de Derrota ou Vitória está visível).
// Recarrega a página pra garantir que TUDO (vida, waves, fase, armas, inimigos, música) volte limpo.
window.addEventListener('click', () => {
    if (!gameOver && !jogoVencido) return;

    let dentroDoBotao = mouseX >= botaoVoltarMenuJogo.x && mouseX <= botaoVoltarMenuJogo.x + botaoVoltarMenuJogo.w &&
        mouseY >= botaoVoltarMenuJogo.y && mouseY <= botaoVoltarMenuJogo.y + botaoVoltarMenuJogo.h;

    if (dentroDoBotao) {
        location.reload();
    }
});

function desenha() {
    // Escolhe o background de acordo com a FASE atual (1, 2 ou 3). Se por algum motivo
    // a imagem daquela fase ainda não carregou, cai pro Background.png padrão.
    let fundoDaFase = imagensFundoPorFase[faseVisual - 1] || imgBackground;
    if (!fundoDaFase.complete || fundoDaFase.naturalWidth === 0) {
        fundoDaFase = imgBackground;
    }

    if (fundoDaFase.complete && fundoDaFase.naturalWidth !== 0) {
        des.drawImage(fundoDaFase, 0, 0, canvas.width, canvas.height);
    } else {
        des.fillStyle = "#2c3e50";
        des.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (player.vidaAtual > 0) {
        player.des_player();
        player.desenharBarraVida(des);
    }
    desenharEfeitosArmas();
    desenharTiros();


    if (estadoJogo === 'JOGANDO_2P' && player2.vidaAtual > 0) {
        player2.des_player(); // Desenha o jogador 2
        player2.desenharBarraVida(des);
        desenharEfeitosArmas();
        desenharTiros();
    }
    desenharExplosoes();
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
        des.font = "bold 52px VCROSDMono, Arial";
        des.textAlign = "center";
        des.fillText("VITÓRIA!", canvas.width / 2, canvas.height / 2 - 40);

        des.fillStyle = "#ffffff";
        des.font = "bold 20px VCROSDMono, Arial";
        des.fillText("Você derrotou Quesada Gigas e salvou o cafezal!", canvas.width / 2, canvas.height / 2 + 20);

        des.font = "16px VCROSDMono, Arial";
        des.fillStyle = "#bdc3c7";
        des.fillText("Recarregue a página para jogar novamente.", canvas.width / 2, canvas.height / 2 + 65);
        des.textAlign = "left";

        desenharBotaoVoltarMenuJogo(canvas.height / 2 + 100);
    }

    // Tela de Derrota, mostrada quando não sobra nenhum jogador vivo
    if (gameOver) {
        des.fillStyle = "rgba(0, 0, 0, 0.85)";
        des.fillRect(0, 0, canvas.width, canvas.height);

        des.fillStyle = "#e74c3c";
        des.font = "bold 52px VCROSDMono, Arial";
        des.textAlign = "center";
        des.fillText("VOCÊ PERDEU", canvas.width / 2, canvas.height / 2 - 40);

        des.fillStyle = "#ffffff";
        des.font = "bold 20px VCROSDMono, Arial";
        des.fillText("O cafezal foi tomado pelas pragas...", canvas.width / 2, canvas.height / 2 + 20);
        des.textAlign = "left";

        desenharBotaoVoltarMenuJogo(canvas.height / 2 + 70);
    }
}

function atualiza(deltaTime, disparosFeitos = []) {
    if (jogoVencido) return; // Trava o progresso do jogo se tiver vencido
    if (gameOver) return;    // Trava o progresso do jogo se o jogador morreu
    if (menuLevelUpAtivo) return;

    // Trava o jogo enquanto a tela está coberta pela transição. Sem isso, os
    // inimigos nasceriam e andariam durante o carregamento, e o jogador
    // encontraria a tela já cheia de inimigos assim que ela fosse revelada.
    if (telaCobertaPelaTransicao()) return;

    let limiteCima = 0;
    let limiteBaixo = canvas.height;
    let limiteEsq = 0;
    let limiteDir = canvas.width;

    controlarPlayers();

    // Só move e aplica mecânicas (regen) do Player 1 se ele ainda estiver vivo.
    // Sem essa checagem, mesmo com vidaAtual em 0 ele continuava andando e brigando normalmente (imortal).
    if (player.vidaAtual > 0) {
        player.mov_player(limiteCima, limiteBaixo, limiteEsq, limiteDir);

        // CORREÇÃO ITEM "LEITE": atualizarMecanicas() aplica o regen (this.regen) a cada frame.
        // Ela já existia em player.js, mas nunca era chamada em lugar nenhum do jogo.
        player.atualizarMecanicas(deltaTime);
    }

    controlarTiros(deltaTime, disparosFeitos);
    atualizarEfeitosArmas(deltaTime);
    if (estadoJogo === 'JOGANDO_2P' && player2.vidaAtual > 0) {
        if (teclasP2.ArrowUp) player2.y -= player2.speed;
        if (teclasP2.ArrowDown) player2.y += player2.speed;
        if (teclasP2.ArrowLeft) player2.x -= player2.speed;
        if (teclasP2.ArrowRight) player2.x += player2.speed;

        player2.atualizarMecanicas(deltaTime);
    }
    //davi
    // Atualiza a inteligência e movimento dos inimigos 

    verificarColisaoTiros();
    atualizarExplosoes(deltaTime);

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

    // Verifica se não sobrou nenhum jogador vivo (no 1P é só o player; no 2P precisa dos dois mortos)
    let ninguemVivo = player.vidaAtual <= 0 && (estadoJogo !== 'JOGANDO_2P' || player2.vidaAtual <= 0);
    if (ninguemVivo) {
        gameOver = true;
        pararMusicaImediatamente();
    }
}

let ultimoTempo = 0;

// Funções de apoio do main(), extraídas só pra organizar

// Telas que não rodam o jogo em si (menu e "sobre"). Retorna true se já cuidou do frame.
function renderizarTelasEstaticas() {
    if (estadoJogo === 'MENU') {
        desenharMenu();
        return true;
    }
    if (estadoJogo === 'SOBRE') {
        desenharSobre();
        return true;
    }
    return false;
}

// Calcula quantos milissegundos se passaram entre o frame anterior e o atual
function calcularDeltaTime(tempoAtual) {
    let deltaTime = tempoAtual - ultimoTempo;
    if (!ultimoTempo) deltaTime = 0;
    ultimoTempo = tempoAtual;

    if (deltaTime > 100) deltaTime = 16; // evita "pulo" grande (ex: aba minimizada) virar teleporte
    return deltaTime;
}

function moverPlayer2(deltaTime) {
    if (menuLevelUpAtivo) return; // trava o movimento com o menu de level up aberto

    if (teclasP2.ArrowUp) player2.y -= player2.speed * (deltaTime / 1000);
    if (teclasP2.ArrowDown) player2.y += player2.speed * (deltaTime / 1000);
    if (teclasP2.ArrowLeft) player2.x -= player2.speed * (deltaTime / 1000);
    if (teclasP2.ArrowRight) player2.x += player2.speed * (deltaTime / 1000);
}

function limitarPlayer2AaTela() {
    if (player2.x < 0) player2.x = 0;
    if (player2.y < 0) player2.y = 0;
    if (player2.x + player2.w > canvas.width) player2.x = canvas.width - player2.w;
    if (player2.y + player2.h > canvas.height) player2.y = canvas.height - player2.h;
}

// Monta a lista de jogadores vivos, move/trava o Jogador 2 e atualiza o contexto
// compartilhado (contextoDoJogo) que os inimigos usam pra mirar quem está vivo.
function atualizarJogadoresEContexto(deltaTime) {
    let jogadoresAtivos = [];
    if (player.vidaAtual > 0) jogadoresAtivos.push(player);

    if (estadoJogo === 'JOGANDO_2P' && player2.vidaAtual > 0) {
        jogadoresAtivos.push(player2);
        moverPlayer2(deltaTime);
        limitarPlayer2AaTela();
    }

    contextoDoJogo.jogadores = jogadoresAtivos;
    contextoDoJogo.temDoisJogadores = jogadoresAtivos.length > 1;

    return jogadoresAtivos;
}

function main(tempoAtual) {
    // O deltaTime passou a ser calculado antes das telas estáticas porque a
    // transição também roda por cima do MENU (é ela que cobre a tela quando o
    // jogador clica em "Iniciar", antes do jogo aparecer).
    let deltaTime = calcularDeltaTime(tempoAtual);

    if (renderizarTelasEstaticas()) {
        atualizarEdesenharTransicaoFade(deltaTime);
        requestAnimationFrame(main);
        return;
    }

    des.clearRect(0, 0, canvas.width, canvas.height);

    let jogadoresAtivos = atualizarJogadoresEContexto(deltaTime);

    // As armas também ficam paradas com a tela coberta, senão elas atirariam
    // (e tocariam som) durante a tela de carregamento.
    let disparosFeitos = [];
    if (!menuLevelUpAtivo && !telaCobertaPelaTransicao()) {
        disparosFeitos = sistemaArmas.updateWeapons(deltaTime, jogadoresAtivos, inimigos) || [];
    }

    desenha()
    atualizarEdesenharTransicaoFade(deltaTime); // Desenha o overlay de fade por cima de tudo, se estiver ativo
    atualiza(menuLevelUpAtivo ? 0 : deltaTime, disparosFeitos) // Envia o tempo rodado para atualizar as armas corretamente

    requestAnimationFrame(main);
}

iniciarWave();

// Inicializa o primeiro frame passando o tempo de partida
requestAnimationFrame((tempo) => main(tempo));