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

let menuLevelUpAtivo = false;
let opcoesDeEscolha = [];
let animacaoXicaraTimer = 0;

// Variáveis de controle de animação dos dois botões de itens
let itemEsquerda = { x: 0, y: 0, escala: 0, alpha: 0, dados: null };
let itemDireita = { x: 0, y: 0, escala: 0, alpha: 0, dados: null };


window.ativarMenuLevelUp = function(escolhas) {
    if (escolhas.length === 0) {
        // Se o inventário e os níveis estiverem todos no MÁXIMO
        player.vidaAtual = player.vidaMaxima; // Cura o jogador
        console.log("Tudo no máximo! O café recuperou toda a vida.");
        return; 
    }
    
    menuLevelUpAtivo = true;
    opcoesDeEscolha = escolhas;
    animacaoXicaraTimer = 0;

    let centroX = canvas.width / 2;
    let centroY = canvas.height / 2;

    // Se só sobrar 1 opção válida no jogo inteiro, repete ela nos dois lados
    let op1 = escolhas[0];
    let op2 = escolhas.length > 1 ? escolhas[1] : escolhas[0];

    itemEsquerda = { x: centroX, y: centroY, escala: 0, alpha: 0, dados: op1 };
    itemDireita = { x: centroX, y: centroY, escala: 0, alpha: 0, dados: op2 };
};

function atualizarEdesenharMenuLevelUp(deltaTime) {
    if (!menuLevelUpAtivo) return;

    // 1. Escurece o fundo do jogo suavemente para dar foco ao menu
    des.fillStyle = "rgba(0, 0, 0, 0.6)";
    des.fillRect(0, 0, canvas.width, canvas.height);

    let centroX = canvas.width / 2;
    let centroY = canvas.height / 2;

    // 2. Desenha a Xícara no centro
    let tamXicara = 120;
    if (imgXicara.complete) {
        des.drawImage(imgXicara, centroX - tamXicara/2, centroY - tamXicara/3, tamXicara, tamXicara);
    }

    // 3. ANIMAÇÃO: Os itens sobem flutuando para fora da xícara
    animacaoXicaraTimer += deltaTime / 1000; // Converte para segundos

    // Alvos finais de posicionamento para as duas cartas
    let alvoY = centroY - 120; 
    let alvoXEsquerda = centroX - 100;
    let alvoXDireita = centroX + 100;

    // Interpolação Linear (Suavização Lerp)
    let t = Math.min(animacaoXicaraTimer * 3, 1); // Chega ao topo em ~0.3 segundos

    itemEsquerda.x = centroX + (alvoXEsquerda - centroX) * t;
    itemEsquerda.y = centroY + (alvoY - centroY) * t;
    itemEsquerda.escala = t;
    itemEsquerda.alpha = t;

    itemDireita.x = centroX + (alvoXDireita - centroX) * t;
    itemDireita.y = centroY + (alvoY - centroY) * t;
    itemDireita.escala = t;
    itemDireita.alpha = t;

    // 4. DESENHAR OS DOIS BOTÕES DE ITENS
    desenharBotaoSelecao(itemEsquerda);
    desenharBotaoSelecao(itemDireita);
}

function desenharBotaoSelecao(item) {
    des.save();
    des.globalAlpha = item.alpha;
    des.translate(item.x, item.y);
    des.scale(item.escala, item.escala);

    // Cartão maior para caber o texto
    let largCard = 140;
    let altCard = 160;

    // Fundo do Card
    des.fillStyle = "#2c3e50";
    des.strokeStyle = item.dados.type === 'weapon' ? "#f1c40f" : "#2ecc71";
    des.lineWidth = 4;
    des.fillRect(-largCard/2, -altCard/2, largCard, altCard);
    des.strokeRect(-largCard/2, -altCard/2, largCard, altCard);

    // Desenha o Ícone do Item (movido um pouco mais para cima)
    if (!item.dados.imgObjeto) {
        item.dados.imgObjeto = new Image();
        item.dados.imgObjeto.src = item.dados.imgSrc;
    }
    if (item.dados.imgObjeto.complete) {
        des.drawImage(item.dados.imgObjeto, -24, -65, 48, 48);
    }

    // Texto: Nome do Item
    des.fillStyle = "#ffffff";
    des.font = "bold 12px Arial";
    des.textAlign = "center";
    des.fillText(item.dados.name, 0, 5);

    // Texto: Tipo (Arma ou Passivo)
    des.font = "10px Arial";
    des.fillStyle = "#bdc3c7";
    let txtInfo = item.dados.type === 'weapon' ? "ARMA" : "ITEM PASSIVO";
    des.fillText(txtInfo, 0, 22);

    // --- SISTEMA DE DESCRIÇÕES ---
    des.fillStyle = "#f1c40f"; // Amarelo dourado para os detalhes
    des.font = "bold 11px Arial";

    if (item.dados.description) {
        // Se for um item passivo e tiver descrição no catálogo
        des.fillText(item.dados.description, 0, 45);
    } else {
        // Se for uma arma, mostra os status reais atuais dela
        des.fillStyle = "#e74c3c"; // Vermelho para dano
        des.fillText(`⚔️ Dano: ${item.dados.damage}`, 0, 45);
        des.fillStyle = "#3498db"; // Azul para recarga
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
        return (mouseX >= item.x - largCard/2 && mouseX <= item.x + largCard/2 &&
                mouseY >= item.y - altCard/2 && mouseY <= item.y + altCard/2);
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
let tirosNaTela = [];

function controlarTiros(deltaTime) {
    // 1. Dispara os tiros calculados pelas armas do Abel contra os inimigos do Davi
    let disparosFeitos = sistemaArmas.updateWeapons(deltaTime, player, inimigos);

    let centroPx = player.x + player.w / 2;
    let centroPy = player.y + player.h / 2;

    disparosFeitos.forEach(tiro => {
        if (tiro.target) {
            let dx = tiro.target.x - centroPx;
            let dy = tiro.target.y - centroPy;
            let anguloAlvo = Math.atan2(dy, dx); 

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
                    tempoVida: 2000, w: 36, h: 36 // Dimensões da bala no ecrã
                });
            } 
            // ESTILO 2: Cone / Espingarda espalhada (KS-23)
            else if (tiro.shootBehavior === 'cone') {
                for(let i = -1; i <= 1; i++) {
                    let spread = anguloAlvo + (i * 0.25); // Abre o ângulo para os lados
                    tirosNaTela.push({
                        x: centroPx, y: centroPy,
                        vx: Math.cos(spread) * tiro.projectileSpeed,
                        vy: Math.sin(spread) * tiro.projectileSpeed,
                        angulo: spread, img: tiro.bulletImgObjeto,
                        type: tiro.projectileType, damage: tiro.damage, isCritical: tiro.isCritical,
                        tempoVida: 800, w: 16, h: 16
                    });
                }
            }
            // ESTILO 3: Corte Corpo a Corpo (Sabre de Luz)
            else if (tiro.shootBehavior === 'slash') {
                 tirosNaTela.push({
                    x: centroPx + Math.cos(anguloAlvo) * 50, 
                    y: centroPy + Math.sin(anguloAlvo) * 50,
                    vx: 0, vy: 0, angulo: anguloAlvo, img: tiro.bulletImgObjeto,
                    type: tiro.projectileType, damage: tiro.damage, isCritical: tiro.isCritical,
                    tempoVida: 150, w: 64, h: 48 // O corte é maior
                });
            }
            // ESTILO 4: Escudo Orbital Giratório (Adaga)
            else if (tiro.shootBehavior === 'orbit') {
                 tirosNaTela.push({
                    x: centroPx, y: centroPy,
                    vx: 0, vy: 0, anguloOrbita: Math.random() * Math.PI, orbitando: true,
                    angulo: 0, img: tiro.bulletImgObjeto,
                    type: tiro.projectileType, damage: tiro.damage, isCritical: tiro.isCritical,
                    tempoVida: 4000, w: 32, h: 32
                });
            }
        }
    });

    // 2. Movimentação e Atualização Física das Balas
    tirosNaTela.forEach(tiro => {
        if (tiro.orbitando) {
            tiro.anguloOrbita += 0.05; // Velocidade de rotação ao redor do Grão de Café
            tiro.x = (player.x + player.w / 2) + Math.cos(tiro.anguloOrbita) * 90; 
            tiro.y = (player.y + player.h / 2) + Math.sin(tiro.anguloOrbita) * 90;
            tiro.angulo = tiro.anguloOrbita + Math.PI / 2; // Aponta a ponta da adaga para a frente do giro
        } else {
            // Balas normais seguem em linha reta multiplicadas pelo tempo real (deltaTime)
            tiro.x += tiro.vx * (deltaTime / 1000);
            tiro.y += tiro.vy * (deltaTime / 1000);
        }
        tiro.tempoVida -= deltaTime;
    });

    // 3. Filtra e apaga projéteis que expiraram o tempo de vida
    tirosNaTela = tirosNaTela.filter(t => t.tempoVida > 0);
}

function desenharTiros() {
    tirosNaTela.forEach(tiro => {
        // Se a imagem da bala estiver carregada com sucesso
        if (tiro.img && tiro.img.complete && tiro.img.naturalWidth !== 0) {
            des.save();
            // Desloca a origem do desenho para o centro do projétil
            des.translate(tiro.x, tiro.y);
            // Rotaciona o canvas baseado na direção em que ele voa
            des.rotate(tiro.angulo);
            
            // Desenha o sprite da bala perfeitamente alinhado
            des.drawImage(tiro.img, -tiro.w / 2, -tiro.h / 2, tiro.w, tiro.h);
            
            des.restore();
        } else {
            // Fallback de segurança se as imagens das balas ainda não existirem na pasta:
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
            if (tiro.type !== 'force') {
                tirosNaTela.splice(i, 1);
            }
        }
    }
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
    removerInimigo: function(inimigoMorto) {
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

    let configInimigo = { 
        nome: "Praga do Café", 
        velocidade: 2 + (Math.random() * 0.5), 
        vida: 10, 
        dano: 1, 
        xp: 5 
    };

    let larguraInimigo = 40; 
    let alturaInimigo = 40;  
    let imagemInimigo = "";  // Deixe vazio por enquanto para ver o quadrado vermelho 

    let novoInimigo = new Inimigo(
        spawnX, 
        spawnY, 
        larguraInimigo, 
        alturaInimigo, 
        imagemInimigo, 
        configInimigo, 
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
    // player.desenharHitbox(des);
    desenharTiros();

    // Desenha todos os inimigos vivos na tela ---
    inimigos.forEach(inimigo => {
        inimigo.desenhar(des);
    });
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