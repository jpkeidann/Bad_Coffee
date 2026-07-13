let canvas = document.getElementById('des')
let des = canvas.getContext('2d')

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

let player = new Player(200, 200, 64, 64, "../Img/bad_coffee.png")

player.hitbox = {
    x: 4,
    y: 4,
    w: 56,
    h: 56
};

let sistemaArmas = new GameSystem() // Inicializa o cérebro das armas e itens

// Substitua o caminho abaixo pelo local correto onde guardou a imagem da barra vazia
const imgBarraXPVazia = new Image();
imgBarraXPVazia.src = '../Img/2xp_bar_img.png'

const imgBarraInventario = new Image();
imgBarraInventario.src = "../Img/barra_item.png"; // Certifica-te de que o nome do ficheiro está correto na tua pasta

// Adicione isto junto com as outras imagens no topo do código
const imgBackground = new Image();
imgBackground.src = "../Img/Background.png"; // Certifica-te de que a pasta (maiuscula/minuscula) está corretac:\Users\PC\Downloads\Background.png


// --- SISTEMA DE LEVEL UP (XÍCARA E ESCOLHAS) ---
const imgXicara = new Image();
imgXicara.src = "../Img/xicara.png"; // Certifique-se de que o caminho está correto

const imgFogueteAnimado = new Image();
imgFogueteAnimado.src = "../Img/tiroGjahllahorn_SpriteSheet.png";

let menuLevelUpAtivo = false;
let opcoesDeEscolha = [];
let animacaoXicaraTimer = 0;

// Variáveis de controle de animação dos dois botões de itens
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

    // Agora os itens já nascem alinhados com o eixo X final deles
    let alvoXEsquerda = centroX - 100;
    let alvoXDireita = centroX + 100;

    // Guardamos o startX para saber onde desenhar as xícaras
    itemEsquerda = { startX: alvoXEsquerda, x: alvoXEsquerda, y: centroY, escala: 0, alpha: 0, dados: op1 };
    itemDireita = { startX: alvoXDireita, x: alvoXDireita, y: centroY, escala: 0, alpha: 0, dados: op2 };
};

function atualizarEdesenharMenuLevelUp(deltaTime) {
    if (!menuLevelUpAtivo) return;

    // Fundo escuro cobrindo o jogo todo
    des.fillStyle = "rgba(0, 0, 0, 0.6)";
    des.fillRect(0, 0, canvas.width, canvas.height);

    let centroX = canvas.width / 2;
    let centroY = canvas.height / 2;
    let tamXicara = 120;

    let alvoY = centroY - 120;
    animacaoXicaraTimer += deltaTime / 1000;
    let t = Math.min(animacaoXicaraTimer * 3, 1);

    // Movimentação Y (Subindo) e Escala
    itemEsquerda.y = centroY + (alvoY - centroY) * t;
    itemEsquerda.escala = t;
    itemEsquerda.alpha = t;

    itemDireita.y = centroY + (alvoY - centroY) * t;
    itemDireita.escala = t;
    itemDireita.alpha = t;

    // DESENHA AS DUAS XÍCARAS
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

    let largCard = 140;
    let altCard = 160;

    // Desenha o Ícone do Item
    if (!item.dados.imgObjeto) {
        item.dados.imgObjeto = new Image();
        item.dados.imgObjeto.src = item.dados.imgSrc;
    }
    if (item.dados.imgObjeto.complete && item.dados.imgObjeto.naturalWidth !== 0) {
        des.drawImage(item.dados.imgObjeto, -24, -65, 48, 48);
    }

    // Textos do Cartão
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
        des.fillText(`⚔️ Dano: ${item.dados.damage}`, 0, 45);
        des.fillStyle = "#3498db";
        des.fillText(`⚡ Recarga: ${item.dados.cooldown}ms`, 0, 62);
    }

    des.restore();
}

canvas.addEventListener('click', (e) => {
    if (!menuLevelUpAtivo) return;

    // Pega as coordenadas exatas do clique do mouse dentro do canvas
    let rect = canvas.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;
    let mouseY = e.clientY - rect.top;

    let largCard = 140;
    let altCard = 160;

    // Função auxiliar para ver se o clique acertou o retângulo do card
    function clicouNoCard(item) {
        return (mouseX >= item.x - largCard / 2 && mouseX <= item.x + largCard / 2 &&
            mouseY >= item.y - altCard / 2 && mouseY <= item.y + altCard / 2);
    }

    let itemEscolhido = null;

    if (clicouNoCard(itemEsquerda)) itemEscolhido = itemEsquerda.dados;
    if (clicouNoCard(itemDireita)) itemEscolhido = itemDireita.dados;

    if (itemEscolhido) {
        // Tenta colocar no inventário ou dar upgrade pelo GameSystem
        sistemaArmas.buyItem(itemEscolhido);

        menuLevelUpAtivo = false;
        console.log(`Escolheu: ${itemEscolhido.name}`);
    }
});

// ============= PLAYER =============
// -joão

const keys = {}

let jogar = true
let fase = 1

let velocidadeCar = 1

document.addEventListener('keydown', (e) => {
    keys[e.key] = true
})

document.addEventListener('keyup', (e) => {
    keys[e.key] = false
})

function controlarPlayers() {

    // PLAYER 1
    player.dirX = 0
    player.dirY = 0

    if (keys['w']) player.dirY = -1
    if (keys['s']) player.dirY = 1
    if (keys['a']) player.dirX = -1
    if (keys['d']) player.dirX = 1

    // // PLAYER 2
    // player2.dirX = 0
    // player2.dirY = 0

    // if (keys['ArrowUp']) player2.dirY = -1
    // if (keys['ArrowDown']) player2.dirY = 1
    // if (keys['ArrowLeft']) player2.dirX = -1
    // if (keys['ArrowRight']) player2.dirX = 1
}

// --- ARRAYS DE CONTROLE ---
// --- Abel --- 
let efeitosArmas = []; // Guarda os sprites das armas que aparecem rapidamente ao atirar
let tirosNaTela = [];

function controlarTiros(deltaTime) {
    // 1. Dispara os tiros calculados pelas armas do Abel contra os inimigos do Davi
    let disparosFeitos = sistemaArmas.updateWeapons(deltaTime, player, inimigos);

    let centroPx = player.x + player.w / 2;
    let centroPy = player.y + player.h / 2;

    disparosFeitos.forEach(tiro => {
        if (tiro.target || tiro.shootBehavior === 'orbit') {

            let anguloAlvo = 0; // O ângulo base começa em zero para a adaga

            // Só calcula a mira se houver um inimigo de verdade
            if (tiro.target) {
                let dx = tiro.target.x - centroPx;
                let dy = tiro.target.y - centroPy;
                anguloAlvo = Math.atan2(dy, dx);
            }

            // Encontra a arma que disparou para pegar a imagem dela
            let armaDoTiro = sistemaArmas.weapons.find(w => w.id === tiro.id);
            if (armaDoTiro) {
                if (!armaDoTiro.imgObjeto) {
                    armaDoTiro.imgObjeto = new Image();
                    armaDoTiro.imgObjeto.src = armaDoTiro.imgSrc;
                }
                // Guarda a arma na lista para ela piscar no ecrã
                // Só guarda o efeito se a arma NÃO tiver a tag hideEffect
                if (!armaDoTiro.hideEffect) {
                    efeitosArmas.push({
                        img: armaDoTiro.imgObjeto,
                        angulo: anguloAlvo,
                        tempoVida: 150, // Vai aparecer por 150 milissegundos
                        w: armaDoTiro.effectW || 64, // Pega o tamanho do catálogo (ou 64 por padrão)
                        h: armaDoTiro.effectH || 32  // Pega a altura do catálogo (ou 32 por padrão)
                    });
                }
            }

            // Criamos um objeto de imagem persistente para a bala não recarregar do zero a cada frame
            if (!tiro.bulletImgObjeto && tiro.bulletImgSrc) {
                tiro.bulletImgObjeto = new Image();
                tiro.bulletImgObjeto.src = tiro.bulletImgSrc;
            }

            // ESTILO 1: Tiro Sequencial / Direto (P320, MP5, Gjallahorn)
            if (tiro.shootBehavior === 'sequence') {
                tirosNaTela.push({
                    x: centroPx, y: centroPy,
                    vx: Math.cos(anguloAlvo) * tiro.projectileSpeed,
                    vy: Math.sin(anguloAlvo) * tiro.projectileSpeed,
                    angulo: anguloAlvo, img: tiro.bulletImgObjeto,
                    type: tiro.projectileType, damage: tiro.damage, isCritical: tiro.isCritical,
                    tempoVida: 2000, w: 36, h: 36, // Dimensões da bala no ecrã
                    frameX: 0,
                    frameTimer: 0
                });
            }
            // ESTILO 2: Cone / Espingarda espalhada (KS-23)
            else if (tiro.shootBehavior === 'cone') {
                for (let i = -1; i <= 1; i++) {
                    let spread = anguloAlvo + (i * 0.25); // Abre o ângulo para os lados
                    tirosNaTela.push({
                        x: centroPx, y: centroPy,
                        vx: Math.cos(spread) * tiro.projectileSpeed,
                        vy: Math.sin(spread) * tiro.projectileSpeed,
                        angulo: spread, img: tiro.bulletImgObjeto,
                        type: tiro.projectileType, damage: tiro.damage, isCritical: tiro.isCritical,
                        tempoVida: 1500, w: 16, h: 16
                    });
                }
            }
            else if (tiro.shootBehavior === 'boomerang') {
                let alcance = armaDoTiro.throwRange || 250;
                let tempoTotal = armaDoTiro.throwTime || 1200;
                let velGiro = armaDoTiro.spinSpeed || 20;

                tirosNaTela.push({
                    x: centroPx, y: centroPy,
                    startX: centroPx, startY: centroPy, // Ponto de onde saiu
                    anguloDisparo: anguloAlvo, // Direção inicial
                    alcanceMaximo: alcance,
                    tempoVidaTotal: tempoTotal,
                    tempoVida: tempoTotal,
                    velocidadeGiro: velGiro,
                    rotacaoAtual: 0,
                    faseRetorno: false, // Controla se está indo ou voltando
                    img: tiro.bulletImgObjeto,
                    type: tiro.projectileType,
                    shootBehavior: 'boomerang',
                    damage: tiro.damage,
                    isCritical: tiro.isCritical,
                    w: 64, h: 64, // Quadrado ajuda no giro centralizado
                    inimigosAtingidosIda: [], // Quem apanhou na ida
                    inimigosAtingidosVolta: [] // Quem apanhou na volta
                });
            }
            // ESTILO 4: Escudo Orbital Giratório (Adaga)
            else if (tiro.shootBehavior === 'orbit') {
                let raio = armaDoTiro.orbitRadius || 60; // Já ajustado para nascer mais perto
                let velGiro = tiro.spinSpeed || armaDoTiro.spinSpeed || 4
                let tempoDuracao = armaDoTiro.orbitDuration || 3000;

                // Puxa a quantidade de adagas do level da arma (se não tiver, é 1)
                let quantidade = tiro.projectileCount || 1;

                // Divide um círculo perfeito (360 graus) pela quantidade de adagas
                // Assim elas ficam perfeitamente distribuídas!
                let espacamento = (Math.PI * 2) / quantidade;

                // Cria uma adaga para cada número no projectileCount
                for (let i = 0; i < quantidade; i++) {
                    tirosNaTela.push({
                        x: centroPx,
                        y: centroPy,
                        // Cada adaga nasce com o espaçamento somado para não nascerem coladas
                        anguloOrbita: (-Math.PI / 2) + (espacamento * i),
                        distanciaBase: raio,
                        velocidadeOrbita: velGiro,
                        tempoVidaTotal: tempoDuracao,
                        tempoVida: tempoDuracao,
                        angulo: 0,
                        img: tiro.bulletImgObjeto,
                        type: tiro.projectileType,
                        shootBehavior: 'orbit',
                        damage: tiro.damage,
                        isCritical: tiro.isCritical,
                        w: 48, h: 16,
                        orbitando: true,
                        inimigosAtingidos: []
                    });
                }
            }
        }
    });

    // 2. Movimentação e Atualização Física das Balas
    tirosNaTela.forEach(tiro => {
        if (tiro.shootBehavior === 'orbit') {
            let centroPx = player.x + player.w / 2;
            let centroPy = player.y + player.h / 2;

            // Gira no sentido horário continuamente
            tiro.anguloOrbita += tiro.velocidadeOrbita * (deltaTime / 1000);

            // A imagem da adaga aponta para fora como a sawblade
            tiro.angulo = tiro.anguloOrbita;

            // Mantém a distância perfeita do jogador
            tiro.x = centroPx + Math.cos(tiro.anguloOrbita) * tiro.distanciaBase;
            tiro.y = centroPy + Math.sin(tiro.anguloOrbita) * tiro.distanciaBase;

        } else {
            // Balas normais seguem em linha reta multiplicadas pelo tempo real (deltaTime)
            tiro.x += tiro.vx * (deltaTime / 1000);
            tiro.y += tiro.vy * (deltaTime / 1000);
        }
        tiro.tempoVida -= deltaTime;
        if (tiro.type === 'big_boom') {
            tiro.frameTimer += deltaTime;
            if (tiro.frameTimer >= 100) { // Muda de imagem a cada 100ms
                tiro.frameX = (tiro.frameX + 1) % 5; // 5 é a quantidade de desenhos na SpriteSheet
                tiro.frameTimer = 0;
            }
        }
        if (tiro.shootBehavior === 'boomerang') {
            // 1. Gira a imagem continuamente
            tiro.rotacaoAtual += tiro.velocidadeGiro * (deltaTime / 1000);
            tiro.angulo = tiro.rotacaoAtual;

            // 2. Calcula em que parte da viagem o sabre está
            let tempoPassado = tiro.tempoVidaTotal - tiro.tempoVida;
            let metadeTempo = tiro.tempoVidaTotal / 2;
            let centroPx = player.x + player.w / 2;
            let centroPy = player.y + player.h / 2;

            if (tempoPassado < metadeTempo) {
                // FASE 1: IDA (Afastando do player na direção do alvo)
                tiro.faseRetorno = false;
                let progressoIda = tempoPassado / metadeTempo;

                tiro.x = tiro.startX + Math.cos(tiro.anguloDisparo) * (tiro.alcanceMaximo * progressoIda);
                tiro.y = tiro.startY + Math.sin(tiro.anguloDisparo) * (tiro.alcanceMaximo * progressoIda);
            } else {
                // FASE 2: VOLTA (Perseguindo a posição atual do player)
                tiro.faseRetorno = true;
                let progressoVolta = (tempoPassado - metadeTempo) / metadeTempo;

                // Descobre onde foi o limite máximo que o sabre chegou
                let pontoMaximoX = tiro.startX + Math.cos(tiro.anguloDisparo) * tiro.alcanceMaximo;
                let pontoMaximoY = tiro.startY + Math.sin(tiro.anguloDisparo) * tiro.alcanceMaximo;

                // Interpola para fazê-lo voltar para a mão do jogador
                tiro.x = pontoMaximoX + (centroPx - pontoMaximoX) * progressoVolta;
                tiro.y = pontoMaximoY + (centroPy - pontoMaximoY) * progressoVolta;
            }
        }
    });

    // 3. Filtra e apaga projéteis que expiraram o tempo de vida
    tirosNaTela = tirosNaTela.filter(t => t.tempoVida > 0);
}

function desenharTiros() {
    tirosNaTela.forEach(tiro => {
        if (tiro.img && tiro.img.complete && tiro.img.naturalWidth !== 0) {
            des.save();
            des.translate(tiro.x, tiro.y);
            des.rotate(tiro.angulo);

            // --- NOVO: Se for o FOGUETE, usa o sistema de SpriteSheet Animada ---
            if (tiro.type === 'big_boom' && typeof imgFogueteAnimado !== 'undefined' && imgFogueteAnimado.complete) {
                let larguraQuadro = imgFogueteAnimado.width / 5;
                let alturaQuadro = imgFogueteAnimado.height;

                des.drawImage(
                    imgFogueteAnimado,
                    tiro.frameX * larguraQuadro, 0, larguraQuadro, alturaQuadro,
                    -20, -10, 40, 20 // Posição -20, -10 para centralizar o tamanho 40x20
                );
            }
            // --- Para todas as outras balas (P320, MP5, Adaga, etc) ---
            else {
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

            // Calcula a distância entre a bala e o inimigo atual
            let centroInimigoX = inimigo.x + inimigo.w / 2;
            let centroInimigoY = inimigo.y + inimigo.h / 2;
            let dx = tiro.x - centroInimigoX;
            let dy = tiro.y - centroInimigoY;
            let distancia = Math.sqrt(dx * dx + dy * dy);

            // Margem de acerto padrão para o impacto do projétil (25 pixels)
            if (distancia < 25) {
                if (tiro.type === 'force' || tiro.shootBehavior === 'boomerang' || tiro.shootBehavior === 'orbit') {
                    // Escolhe a lista dependendo se o sabre está indo ou voltando
                    let listaAtingidos;

                    if (tiro.shootBehavior === 'boomerang') {
                        // Boomerang usa listas separadas para a IDA e para a VOLTA
                        listaAtingidos = tiro.faseRetorno ? tiro.inimigosAtingidosVolta : tiro.inimigosAtingidosIda;
                    } else {
                        // Adaga Orbital usa uma lista única
                        if (!tiro.inimigosAtingidos) tiro.inimigosAtingidos = [];
                        listaAtingidos = tiro.inimigosAtingidos;
                    }

                    if (listaAtingidos.includes(inimigo)) continue;
                    listaAtingidos.push(inimigo);
                }
                tiroColidiu = true;

                // COMPORTAMENTO ESPECIAL DA GJALLAHORN (EXPLOSÃO)
                if (tiro.type === 'big_boom') {
                    console.log(" Causando dano em área!");

                    let raioExplosao = 120; // Tamanho da hitbox da explosão (em pixels)

                    // Percorre todos os inimigos novamente para dar dano em quem estiver perto da explosão
                    for (let k = inimigos.length - 1; k >= 0; k--) {
                        let vitimaArea = inimigos[k];
                        let cVitimaX = vitimaArea.x + vitimaArea.w / 2;
                        let cVitimaY = vitimaArea.y + vitimaArea.h / 2;

                        // Distância entre o ponto da explosão e o outro inimigo
                        let ex = tiro.x - cVitimaX;
                        let ey = tiro.y - cVitimaY;
                        let distExplosao = Math.sqrt(ex * ex + ey * ey);

                        // Se o inimigo estiver dentro do raio maior da hitbox de explosão
                        if (distExplosao <= raioExplosao) {
                            vitimaArea.tomarDano(tiro.damage);
                        }
                    }
                }
                // COMPORTAMENTO DAS OUTRAS BALAS NORMAIS (P320, MP5, etc.)
                else {
                    inimigo.tomarDano(tiro.damage);
                }

                break; // Sai do loop de inimigos pois o projétil principal atingiu o alvo
            }
        }

        // Se o tiro colidiu, removemos ele da tela (exceto se for o sabre de luz 'force')
        if (tiroColidiu) {
            if (tiro.type !== 'force' && tiro.shootBehavior !== 'orbit' && tiro.shootBehavior !== 'boomerang') {
                tirosNaTela.splice(i, 1);
            }
        }
    }
}

function atualizarEfeitosArmas(deltaTime) {
    // Desconta o tempo de vida de cada arma que está a aparecer na mão
    for (let i = efeitosArmas.length - 1; i >= 0; i--) {
        efeitosArmas[i].tempoVida -= deltaTime;
        if (efeitosArmas[i].tempoVida <= 0) {
            efeitosArmas.splice(i, 1); // Remove quando o tempo (150ms) acaba
        }
    }
}

function desenharEfeitosArmas() {
    let centroPx = player.x + player.w / 2;
    let centroPy = player.y + player.h / 2;

    efeitosArmas.forEach(ef => {
        if (ef.img && ef.img.complete && ef.img.naturalWidth !== 0) {
            des.save();
            // Move o eixo para o centro do jogador
            des.translate(centroPx, centroPy);
            // Gira a arma para apontar para o inimigo
            des.rotate(ef.angulo);

            // Impede a arma de ficar de cabeça para baixo se atirar para trás
            let atirandoParaEsquerda = (ef.angulo > Math.PI / 2 && ef.angulo < 3 * Math.PI / 2) || (ef.angulo < -Math.PI / 2);
            if (atirandoParaEsquerda) {
                des.scale(1, -1);
            }

            // Desenha a arma afastada 15 pixels do corpo ( Largura = 32, Altura = 16 )
            des.drawImage(ef.img, 15, -(ef.h / 2), ef.w * 2, ef.h * 2);
            des.restore();
        }
    });
}

// ============================ INIMIGOS ===============================
// -------------- CONFIGURAÇÃO DO SISTEMA DE WAVES ----------------
let inimigos = [];
let waveAtual = 1;
let inimigosParaSpawnar = 0; // Quantos ainda faltam nascer nesta wave
let inimigosVivos = 0;       // Quantos inimigos restam na tela
let frameTimer = 0;          // Temporizador para controlar o ritmo de nascimento
let descansoAtivo = false;   // Controla os segundos de paz entre as waves

// Este objeto resolve os pedidos que a classe Inimigo faz 
const contextoDoJogo = {
    jogadores: [player],
    temDoisJogadores: false,
    barraXP: {
        adicionarXP: (qtd) => {
            sistemaArmas.gainXp(qtd); // <--- Corrigido de adicionarXP para gainXp
        }
    },
    removerInimigo: function (inimigoMorto) {
        inimigos = inimigos.filter(ini => ini !== inimigoMorto);
        inimigosVivos--;
        verificarFimDaWave();
    }
};

// Lógica para preparar a quantidade de monstros da rodada
function iniciarWave() {
    console.log(`=== INICIANDO WAVE ${waveAtual} ===`);
    descansoAtivo = false;

    // Configura a quantidade: Wave 1 = 5, Wave 2 = 10, Wave 3 = 15...
    let quantidadeNestaWave = 5 * waveAtual;

    inimigosParaSpawnar = quantidadeNestaWave;
    inimigosVivos = quantidadeNestaWave;
}

function verificarFimDaWave() {
    // Se todos morreram e nenhum outro vai nascer, avança a wave
    if (inimigosVivos <= 0 && inimigosParaSpawnar <= 0) {
        console.log(`Wave ${waveAtual} concluída! Próxima em 3 segundos...`);
        waveAtual++;
        descansoAtivo = true;

        // 3 segundos de descanso antes da próxima horda
        setTimeout(iniciarWave, 3000);
    }
}

// ----------------------- SPAWN DE INIMIGOS -----------------------
function spawnarInimigo() {
    let spawnX, spawnY;
    if (Math.random() < 0.5) {
        spawnX = Math.random() * canvas.width;
        spawnY = Math.random() < 0.5 ? -50 : canvas.height + 50;
    } else {
        spawnX = Math.random() < 0.5 ? -50 : canvas.width + 50;
        spawnY = Math.random() * canvas.height;
    }

    // 1. Criamos uma lista com as pragas normais do catálogo (deixando o Boss de fora por enquanto)
    const pragasDisponiveis = ["acaro", "broca", "bichoMineiro", "larva"];
    
    // 2. Sorteia uma das pragas da lista
    const pragaSorteada = pragasDisponiveis[Math.floor(Math.random() * pragasDisponiveis.length)];
    
    // 3. Puxa a configuração completa (com frames, velocidade de animação e imagem certa)
    const configInimigo = TIPOS_INIMIGOS[pragaSorteada];

    // Tamanho padrão do sprite em tela
    let larguraInimigo = 45;
    let alturaInimigo = 45;

    // 4. Instancia o bicho injetando os dados reais do catálogo global
    let novoInimigo = new Inimigo(
        spawnX,
        spawnY,
        larguraInimigo,
        alturaInimigo,
        configInimigo.img, // Passa o caminho da folha de sprites
        configInimigo,     // Passa o objeto com frames, tempo de frame, etc.
        contextoDoJogo
    );

    inimigos.push(novoInimigo);
}

function desenharInventarioVisual() {
    // Dimensões ideais para a barra manter a proporção pixel-art sem esticar muito
    let largBarra = 320;
    let altBarra = 64;

    // Centraliza horizontalmente na tela e coloca um pouco abaixo da barra de XP
    let posX = (canvas.width - largBarra) / 2;
    let posY = canvas.height - 75;

    // 1. Desenha o fundo do inventário (A imagem barra_item.png)
    if (imgBarraInventario.complete) {
        des.drawImage(imgBarraInventario, posX, posY, largBarra, altBarra);
    }

    // Configuração do texto para os nomes/níveis dos itens nos slots
    des.fillStyle = "#ffffff";
    des.font = "bold 10px Arial";
    des.textAlign = "center";

    // 2. RENDEREZAR ARMAS (Máximo 3 slots - Lado Esquerdo)
    // O tamanho estimado de cada quadrado na proporção da barra é ~54px de largura
    let tamanhoIcone = 64;
    let espacamentoSlot = 53;
    let margemEsquerdaArmas = posX + 8; // Ajuste fino para alinhar dentro do primeiro quadrado

    for (let i = 0; i < sistemaArmas.maxWeaponSlots; i++) {
        let slotX = margemEsquerdaArmas + (i * espacamentoSlot);
        let slotY = posY + 35; // Posição vertical do texto dentro do slot

        // Se o jogador já possuir uma arma nesse slot, desenha a informação
        if (sistemaArmas.weapons[i]) {
            let arma = sistemaArmas.weapons[i];


            // Criamos ou reaproveitamos um objeto Image para a arma
            if (!arma.imgObjeto) {
                arma.imgObjeto = new Image();
                arma.imgObjeto.src = arma.imgSrc;
            }
            // Se a imagem da arma já carregou, desenha o Sprite centralizado no slot
            if (arma.imgObjeto.complete && arma.imgObjeto.naturalWidth !== 0) {
                des.drawImage(arma.imgObjeto, slotX + 4, posY + 8, tamanhoIcone, tamanhoIcone);
            } else {
                // Fallback caso a imagem falhe: Mostra as primeiras letras
                des.fillStyle = "#f1c40f";
                des.fillText(arma.id.substring(0, 3).toUpperCase(), slotX + 20, posY + 28);
            }

            // Desenha o número do nível no canto inferior do slot
            des.fillStyle = "#ffffff";
            des.fillText(`Lvl ${arma.level}`, slotX + 20, posY + 52);
        }
    }

    // 3. RENDERIZAR IMAGENS DOS ITENS PASSIVOS (Lado Direito)
    let margemEsquerdaItens = posX + 202;

    for (let i = 0; i < sistemaArmas.maxItemSlots; i++) {
        let slotX = margemEsquerdaItens + (i * espacamentoSlot);

        if (sistemaArmas.items[i]) {
            let item = sistemaArmas.items[i];

            if (!item.imgObjeto) {
                item.imgObjeto = new Image();
                item.imgObjeto.src = item.imgSrc;
            }

            // Desenha o Sprite do item passivo
            if (item.imgObjeto.complete && item.imgObjeto.naturalWidth !== 0) {
                des.drawImage(item.imgObjeto, slotX + 4, posY + 8, tamanhoIcone, tamanhoIcone);
            } else {
                des.fillStyle = "#2ecc71";
                des.fillText(item.id.substring(0, 3).toUpperCase(), slotX + 20, posY + 28);
            }

            // Desenha o nível do item passivo
            des.fillStyle = "#ffffff";
            des.fillText(`Lvl ${item.level}`, slotX + 20, posY + 52);
        }
    }

    des.textAlign = "left"; // Reseta o alinhamento
}

function desenharBarraXP() {
    let alturaBarra = 98; // Ajuste a altura para ficar proporcional à sua imagem
    let larguraTotal = 768;

    // 1. Desenha a sua imagem de barra vazia como plano de fundo (ocupa o topo de ponta a ponta)
    if (imgBarraXPVazia.complete) {
        des.drawImage(imgBarraXPVazia, 550, 0, larguraTotal, alturaBarra);
    } else {
        // Fallback de segurança: Caso a imagem demore a carregar, desenha um fundo escuro
        des.fillStyle = "#111116";
        des.fillRect(0, 0, larguraTotal, alturaBarra);
    }

    // 2. Calcula a proporção matemática do XP atual contra a meta necessária
    let proporcaoXp = sistemaArmas.currentXp / sistemaArmas.xpNeeded;
    if (proporcaoXp > 1) proporcaoXp = 1; // Trava em 100% para não vazar a tela

    // Deixamos uma margem de 2 pixels nas bordas para o preenchimento não cobrir a moldura da imagem
    let larguraPreenchimento = (larguraTotal - 4) * proporcaoXp;

    // 3. Desenha o preenchimento VERDE elétrico por cima da barra vazia
    if (larguraPreenchimento > 0) {
        des.fillStyle = "#2ecc71"; // Verde vibrante
        des.fillRect(562, 12, larguraPreenchimento, alturaBarra - 24);
    }

    // 4. Texto indicador do Nível e progresso numérico (Branco com contorno preto para leitura fácil)
    des.fillStyle = "#ffffff";
    des.font = "bold 13px Arial";
    des.textAlign = "right";

    let textoXP = `LV. ${sistemaArmas.level}  |  ${sistemaArmas.currentXp} / ${sistemaArmas.xpNeeded} XP`;

    // Contorno preto no texto
    des.strokeStyle = "#000000";
    des.lineWidth = 3;
    des.strokeText(textoXP, canvas.width - 20, alturaBarra + 20);
    // Texto branco por cima
    des.fillText(textoXP, canvas.width - 20, alturaBarra + 20);
    des.textAlign = "left"; // Reseta o alinhamento do canvas
}

// ============================ MAIN ===================================

function desenha() {
    if (imgBackground.complete) {
        des.drawImage(imgBackground, 0, 0, canvas.width, canvas.height);
    } else {
        // Fallback de segurança: caso a imagem falhe, limpa com uma cor escura
        des.fillStyle = "#2c3e50";
        des.fillRect(0, 0, canvas.width, canvas.height);
    }
    player.des_player();
    player.desenharBarraVida(des);
    desenharEfeitosArmas();
    desenharTiros();

    // ATUALIZAÇÃO DOS INIMIGOS ---
    inimigos.forEach(inimigo => {
        // Agora passamos: lista de inimigos, lista de tiros vazia [], e o deltaTime!
        inimigo.atualizarI(inimigos, [], deltaTime);
    });

    // Controlador de Ritmo de Spawn ---
    if (!descansoAtivo && inimigosParaSpawnar > 0) {
        frameTimer += deltaTime;
        // Spawna 1 inimigo a cada 500 milissegundos (meio segundo)
        if (frameTimer >= 500) {
            spawnarInimigo();
            inimigosParaSpawnar--;
            frameTimer = 0;
        }
    }

    // --- INTERFACE HUD (Sempre desenhada por último para ficar em cima de tudo) ---
    desenharBarraXP();
    desenharInventarioVisual();
    if (menuLevelUpAtivo) {
        // O deltaTime aqui serve apenas para rodar a animação dos itens subindo
        atualizarEdesenharMenuLevelUp(16);
    }
}



function atualiza(deltaTime) {
    let limiteCima = 0;
    let limiteBaixo = canvas.height;
    let limiteEsq = 0;
    let limiteDir = canvas.width;
    if (menuLevelUpAtivo) return;

    player.mov_player(limiteCima, limiteBaixo, limiteEsq, limiteDir);
    controlarPlayers()

    controlarTiros(deltaTime);
    atualizarEfeitosArmas(deltaTime);

    //davi
    // Atualiza a inteligência e movimento dos inimigos 

    verificarColisaoTiros();

    inimigos.forEach(inimigo => {
        inimigo.atualizarI(inimigos);
    });

    if (!descansoAtivo && inimigosParaSpawnar > 0) {
        frameTimer += deltaTime;
        if (frameTimer >= 500) {
            spawnarInimigo();
            inimigosParaSpawnar--;
            frameTimer = 0;
        }
    }

    // Controlador de Ritmo de Spawn ---
    if (!descansoAtivo && inimigosParaSpawnar > 0) {
        frameTimer += deltaTime;
        // Spawna 1 inimigo a cada 500 milissegundos (meio segundo)
        if (frameTimer >= 500) {
            spawnarInimigo();
            inimigosParaSpawnar--;
            frameTimer = 0;
        }
    }
}

let ultimoTempo = 0

function main(tempoAtual) {
    // Calcula quantos milissegundos se passaram entre o frame anterior e o atual
    let deltaTime = tempoAtual - ultimoTempo;
    if (!ultimoTempo) deltaTime = 0;
    ultimoTempo = tempoAtual;

    // Trava de segurança para caso o jogo mude de aba (não dar saltos gigantes)
    if (deltaTime > 100) deltaTime = 16;

    des.clearRect(0, 0, canvas.width, canvas.height)

    desenha()
    atualiza(deltaTime) // Envia o tempo rodado para atualizar as armas corretamente

    requestAnimationFrame(main)
}

// Inicia a primeira rodada de inimigos!
iniciarWave();

// Inicializa o primeiro frame passando o tempo de partida
requestAnimationFrame((tempo) => main(tempo));