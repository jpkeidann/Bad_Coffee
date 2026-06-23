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
}

function atualiza() {
    let limiteCima = 0
    let limiteBaixo = canvas.height
    let limiteEsq = 0
    let limiteDir = canvas.width

    player.mov_player(limiteCima, limiteBaixo, limiteEsq, limiteDir)
    controlarPlayers()
}

function main() {
    des.clearRect(0, 0, canvas.width, canvas.height)
    desenha()
    atualiza()

    requestAnimationFrame(main)
}

main()