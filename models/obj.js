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

    des_player() {
        if (this.img.src !== this.a) {
            this.img.src = this.a
        }

        des.drawImage(this.img, this.x, this.y, this.w, this.h)
    }
}

