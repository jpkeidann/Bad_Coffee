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

let player = new Player(200, 200, 128, 128, "../img/images.jpg")

function desenha() {
    player.des_player()
}

function atualiza() {
    let limiteCima = 0
    let limiteBaixo = canvas.height
    let limiteEsq = 0
    let limiteDir = canvas.width

    player.mov_player(limiteCima, limiteBaixo, limiteEsq, limiteDir)
}

function main() {
    des.clearRect(0, 0, canvas.width, canvas.height)
    desenha()
    atualiza()

    requestAnimationFrame(main)
}

main()