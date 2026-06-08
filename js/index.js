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