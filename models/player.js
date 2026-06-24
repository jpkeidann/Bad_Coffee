class Player extends Obj{
    speed = 8
    dirX = 0
    dirY = 0

    mov_player(limiteCima, limiteBaixo, limiteEsq, limiteDir){
        // normalizar diagonal
        let dx = this.dirX
        let dy = this.dirY

        if (dx !== 0 && dy !== 0) {
            dx *= 0.8
            dy *= 0.8
        }

        // aplicar movimento direto
        this.x += dx * this.speed
        this.y += dy * this.speed

        // limites Y
        if (this.y < limiteCima - 60) {
            this.y = limiteCima - 60
        } else if (this.y > limiteBaixo - 30) {
            this.y = limiteBaixo - 30
        }

        // limites X
        if (this.x < limiteEsq) {
            this.x = limiteEsq
        } else if (this.x > limiteDir - this.w) {
            this.x = limiteDir - this.w
        }
    }

    colid(objeto) {
        if ((this.x + this.hitbox.x < objeto.x + objeto.hitbox.x + objeto.hitbox.w) &&
            (this.x + this.hitbox.x + this.hitbox.w > objeto.x + objeto.hitbox.x) &&
            (this.y + this.hitbox.y < objeto.y + objeto.hitbox.y + objeto.hitbox.h) &&
            (this.y + this.hitbox.y + this.hitbox.h > objeto.y + objeto.hitbox.y)) {
            return true
        } else {
            return false
        }
    }
}