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
let sistemaArmas = new GameSystem() // Inicializa o cérebro das armas e itens

// Substitua o caminho abaixo pelo local correto onde guardou a imagem da barra vazia
const imgBarraXPVazia = new Image();
imgBarraXPVazia.src = '../Img/2xp_bar_img.png'

const imgBarraInventario = new Image();
imgBarraInventario.src = "../img/barra_item.png"; // Certifica-te de que o nome do ficheiro está correto na tua pasta

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
let tirosNaTela = []
function controlarTiros(deltaTime) {
    // 1. Pega os tiros passando a array correta de inimigos da Wave
    let disparosFeitos = sistemaArmas.updateWeapons(deltaTime, player, inimigos);

    let centroPx = player.x + player.w / 2;
    let centroPy = player.y + player.h / 2;

    // 2. Criação do projétil baseada no comportamento
    disparosFeitos.forEach(tiro => {
        if (tiro.target) {
            let dx = tiro.target.x - centroPx;
            let dy = tiro.target.y - centroPy;
            let anguloAlvo = Math.atan2(dy, dx); 

            // COMPORTAMENTO 1: Tiro Reto (Pistola, MP5, Lança, Gjallahorn)
            if (tiro.shootBehavior === 'sequence') {
                tirosNaTela.push({
                    x: centroPx, y: centroPy,
                    vx: Math.cos(anguloAlvo) * tiro.projectileSpeed,
                    vy: Math.sin(anguloAlvo) * tiro.projectileSpeed,
                    type: tiro.projectileType, damage: tiro.damage, isCritical: tiro.isCritical,
                    tempoVida: 2000 
                });
            } 
            // COMPORTAMENTO 2: Cone / Espingarda (KS-23)
            else if (tiro.shootBehavior === 'cone') {
                for(let i = -1; i <= 1; i++) {
                    let spread = anguloAlvo + (i * 0.2); 
                    tirosNaTela.push({
                        x: centroPx, y: centroPy,
                        vx: Math.cos(spread) * tiro.projectileSpeed,
                        vy: Math.sin(spread) * tiro.projectileSpeed,
                        type: tiro.projectileType, damage: tiro.damage, isCritical: tiro.isCritical,
                        tempoVida: 800 
                    });
                }
            }
            // COMPORTAMENTO 3: Corte / Sabre de Luz
            else if (tiro.shootBehavior === 'slash') {
                 tirosNaTela.push({
                    x: centroPx + Math.cos(anguloAlvo) * 60, 
                    y: centroPy + Math.sin(anguloAlvo) * 60,
                    vx: 0, vy: 0, 
                    type: tiro.projectileType, damage: tiro.damage, isCritical: tiro.isCritical,
                    tempoVida: 200 
                });
            }
            // COMPORTAMENTO 4: Órbita / Adaga
            else if (tiro.shootBehavior === 'orbit') {
                 tirosNaTela.push({
                    x: centroPx, y: centroPy,
                    vx: 0, vy: 0, anguloOrbita: 0, orbitando: true,
                    type: tiro.projectileType, damage: tiro.damage, isCritical: tiro.isCritical,
                    tempoVida: 3000 
                });
            }
        }
    });

    // 3. Move os tiros
    tirosNaTela.forEach(tiro => {
        if (tiro.orbitando) {
            tiro.anguloOrbita += 0.1;
            tiro.x = centroPx + Math.cos(tiro.anguloOrbita) * 80; 
            tiro.y = centroPy + Math.sin(tiro.anguloOrbita) * 80;
        } else {
            tiro.x += tiro.vx * (deltaTime / 1000);
            tiro.y += tiro.vy * (deltaTime / 1000);
        }
        tiro.tempoVida -= deltaTime;
    });

    // 4. Limpa tiros mortos
    tirosNaTela = tirosNaTela.filter(t => t.tempoVida > 0);
}

// Função só para desenhar os tiros (Organização visual)
function desenharTiros() {
    tirosNaTela.forEach(tiro => {
        des.beginPath();
        
        if (tiro.isCritical) des.fillStyle = "purple"; 
        else if (tiro.type === 'bullet') des.fillStyle = "yellow";
        else if (tiro.type === 'pellet') des.fillStyle = "orange";
        else if (tiro.type === 'force') des.fillStyle = "cyan"; 
        else if (tiro.type === 'spin') des.fillStyle = "gray";  
        else des.fillStyle = "white";

        des.arc(tiro.x, tiro.y, 6, 0, Math.PI * 2);
        des.fill();
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
            // Agora conecta o XP dropado pelo inimigo direto no sistema do Abel!
            sistemaArmas.adicionarXP(qtd); 
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
    let alturaBarra = 96; // Ajuste a altura para ficar proporcional à sua imagem
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
        des.fillRect(562, 12, larguraPreenchimento, alturaBarra - 4);

        // Detalhe extra: Efeito de brilho na parte de cima do preenchimento verde (opcional, dá estilo)
        des.fillStyle = "#58d68d"; 
        des.fillRect(2, 2, larguraPreenchimento, 4);
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
    player.des_player();
    player.desenharBarraVida(des); // <--- ADICIONADO AQUI PARA DESENHAR A BARRA DE VIDA!
    desenharTiros();

    // Desenha todos os inimigos vivos na tela ---
    inimigos.forEach(inimigo => {
        inimigo.desenhar(des);
    });
    // --- INTERFACE HUD (Sempre desenhada por último para ficar em cima de tudo) ---
    desenharBarraXP();
    desenharInventarioVisual();
}



function atualiza(deltaTime) {
    let limiteCima = 0;
    let limiteBaixo = canvas.height;
    let limiteEsq = 0;
    let limiteDir = canvas.width;

    player.mov_player(limiteCima, limiteBaixo, limiteEsq, limiteDir);
    controlarPlayers()

    controlarTiros(deltaTime); 
    
    //davi
    // Atualiza a inteligência e movimento dos inimigos 
    inimigos.forEach(inimigo => {
        inimigo.atualizarI();
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