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

// --- ARRAYS DE CONTROLE ---
let tirosNaTela = []

// ==================== Movimento jogador =======================
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
    player.dirX = 0
    player.dirY = 0

    if (keys['w']) player.dirY = -1
    if (keys['s']) player.dirY = 1
    if (keys['a']) player.dirX = -1
    if (keys['d']) player.dirX = 1
}

// ============================ INIMIGOS ===============================
// -------------- CONFIGURAÇÃO DO SISTEMA DE WAVES ----------------
let inimigos = [];
let waveAtual = 1;
let inimigosParaSpawnar = 0; // Quantos ainda faltam nascer nesta wave
let inimigosVivos = 0;       // Quantos inimigos restam na tela
let frameTimer = 0;          // Temporizador para controlar o ritmo de nascimento
let descansoAtivo = false;   // Controla os segundos de paz entre as waves

// Este objeto resolve os pedidos que a classe Inimigo faz (como checar jogadores e dar XP)
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

    let larguraInimigo = 0; 
    let alturaInimigo = 0;  
    let imagemInimigo = ""; 

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
    player.des_player()

    tirosNaTela.forEach(tiro => {
        if (tiro.type === 'bullet') des.fillStyle = "gold";
        else if (tiro.type === 'pellet') des.fillStyle = "silver";
        else des.fillStyle = "cyan"; // Outros tipos como sabre/adaga

        des.beginPath();
        des.arc(tiro.x, tiro.y, 6, 0, Math.PI * 2);
        des.fill();
    });
}

function atualiza(deltaTime) {
    let limiteCima = 0
    let limiteBaixo = canvas.height
    let limiteEsq = 0
    let limiteDir = canvas.width

    player.mov_player(limiteCima, limiteBaixo, limiteEsq, limiteDir)
    controlarPlayers()

    // 2. Processa o temporizador das armas (passando o deltaTime em milissegundos)
    let disparosFeitos = sistemaArmas.updateWeapons(deltaTime, player, listaDeInimigos);

    // 3. Se alguma arma disparou, criamos o projétil físico no index.js
    disparosFeitos.forEach(tiro => {
        if (tiro.target) {
            // Calcula a direção exata do canhão do jogador até o inimigo alvo
            let dx = tiro.target.x - (player.x + player.w / 2);
            let dy = tiro.target.y - (player.h / 2 + player.y);
            let distancia = Math.sqrt(dx * dx + dy * dy);

            if (distancia > 0) {
                tirosNaTela.push({
                    x: player.x + player.w / 2, // Sai do meio do jogador
                    y: player.y + player.h / 2,
                    vx: (dx / distancia) * tiro.projectileSpeed, // Velocidade X proporcional
                    vy: (dy / distancia) * tiro.projectileSpeed, // Velocidade Y proporcional
                    type: tiro.projectileType,
                    damage: tiro.damage
                });
            }
        }
    });
    // =================== ATENÇÃO =======>  João: muita geometria complexa, depois eu irei ver melhor sobre isso;

    // 4. Move os tiros que já estão voando pelo mapa
    tirosNaTela.forEach(tiro => {
        tiro.x += tiro.vx * (deltaTime / 1000);
        tiro.y += tiro.vy * (deltaTime / 1000);
    });

    // 5. Limpa os tiros que saíram da tela para não travar o computador
    tirosNaTela = tirosNaTela.filter(tiro =>
        tiro.x >= 0 && tiro.x <= canvas.width &&
        tiro.y >= 0 && tiro.y <= canvas.height
    );
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