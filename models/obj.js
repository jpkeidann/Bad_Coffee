class Obj {
    constructor(x, y, w, h, a) {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.a = a
        this.img = new Image()
        this.img.src = a

        this.hitbox = {
            x: 0,
            y: 0,
            w: w,
            h: h
        }
    }
    
}

module.exports = Obj