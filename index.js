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