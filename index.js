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

let player = new Player(200, 200, 128, 128, "../img/killer_bean.png")
let sistemaArmas = new GameSystem() // Inicializa o cérebro das armas e itens

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

    // PLAYER 2
    player2.dirX = 0
    player2.dirY = 0

    if (keys['ArrowUp']) player2.dirY = -1
    if (keys['ArrowDown']) player2.dirY = 1
    if (keys['ArrowLeft']) player2.dirX = -1
    if (keys['ArrowRight']) player2.dirX = 1
}

// --- ARRAYS DE CONTROLE ---
// --- Abel --- 
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
        adicionarXP: (qtd) => { console.log(`Ganhou +${qtd} XP!`); } 
    },
    removerInimigo: function(inimigoMorto) {
        // Remove o inimigo específico da lista
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
    //muita geometria complexa dps vejo - jonas

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


// ============================ MAIN ===================================

function desenha() {
    player.des_player();
    desenharTiros();

    // Desenha todos os inimigos vivos na tela ---
    inimigos.forEach(inimigo => {
        inimigo.desenhar(des);
    });
}

function atualiza(deltaTime) {
    let limiteCima = 0;
    let limiteBaixo = canvas.height;
    let limiteEsq = 0;
    let limiteDir = canvas.width;

    player.mov_player(limiteCima, limiteBaixo, limiteEsq, limiteDir);
    // controlarPlayers() // Nota: Se essa função não existir no seu código, comente-a para não dar erro!

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
// Inicializa o primeiro frame passando o tempo zero de partida
requestAnimationFrame((tempo) => main(tempo));

// Inicia a primeira rodada de inimigos!
iniciarWave();

// Inicializa o primeiro frame passando o tempo zero de partida
requestAnimationFrame((tempo) => main(tempo));