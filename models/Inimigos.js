// =======================================================
// ARQUIVO: models/Inimigos.js
// =======================================================

const TIPOS_INIMIGOS = {
    acaro: { 
        id: "acaro", 
        nome: "Ácaro-Vermelho",
        velocidade: 2.5, 
        vida: 15, 
        dano: 5, 
        xp: 5, 
        knockbackResistencia: 0.1, 
        img: "../img/acaro.png" 
    },
    broca: { 
        id: "broca", 
        nome: "Broca-do-Café",
        velocidade: 1.5, 
        vida: 35, 
        dano: 10, 
        xp: 10, 
        knockbackResistencia: 0.5, 
        img: "../img/broca.png" },
    bichoMineiro: { 
        id: "bichoMineiro", 
        nome: "Bicho-Mineiro", 
        velocidade: 1.2, 
        vida: 20, 
        dano: 0, 
        xp: 8, 
        knockbackResistencia: 0.3, 
        img: "../img/bicho_mineiro.png" 
    },
    larva: { 
        id: "larva", 
        nome: "Larva Mineira", 
        velocidade: 3.5, 
        vida: 1, 
        dano: 3, 
        xp: 1, 
        knockbackResistencia: 0, 
        img: "../img/larva.png" },
    cigarraBoss: { 
        id: "boss", 
        nome: "A Grande Cigarra", 
        velocidade: 1.0, 
        vida: 1500, 
        dano: 20, 
        xp: 500, 
        knockbackResistencia: 1.0, 
        img: "../img/cigarra_boss.png" }
};

class Inimigo {
    constructor(x, y, w, h, imgCaminho, configuracao, jogo) {
        this.jogo = jogo; 
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.img = new Image();
        this.img.src = imgCaminho || configuracao.img || ""; 

        this.hitbox = {
            x: w * 0.1, y: h * 0.1, 
            w: w * 0.8, h: h * 0.8  
        };

        this.nome = configuracao.nome || "Praga Comum";
        this.velocidadeBase = configuracao.velocidade || 2;
        this.vidaMaxima = configuracao.vida || 10;
        this.danoContato = configuracao.dano || 1;
        this.xpRecompensa = configuracao.xp || 5;

        // Sistema de Knockback
        this.knockbackResistencia = configuracao.knockbackResistencia || 0;
        this.velKnockbackX = 0;
        this.velKnockbackY = 0;

        if (this.jogo.temDoisJogadores) {
            this.vidaMaxima = Math.round(this.vidaMaxima * 1.7);
        }
        
        this.vidaAtual = this.vidaMaxima;
        this.alvo = null; 
    }

    receberKnockback(origemX, origemY, forca) {
        if (this.knockbackResistencia >= 1) return; // Imune (ex: Boss)
        let dx = this.x - origemX;
        let dy = this.y - origemY;
        let distancia = Math.sqrt(dx * dx + dy * dy);
        if (distancia > 0) {
            let forcaReal = forca * (1 - this.knockbackResistencia);
            this.velKnockbackX = (dx / distancia) * forcaReal;
            this.velKnockbackY = (dy / distancia) * forcaReal;
        }
    }

    atualizarI(listaInimigos, tirosInimigosNaTela, deltaTime) {
        // Aplica o Knockback antes de andar
        this.x += this.velKnockbackX;
        this.y += this.velKnockbackY;
        this.velKnockbackX *= 0.85; // Fricção
        this.velKnockbackY *= 0.85;

        this.definirAlvoMaisProximo();

        if (this.alvo && this.velKnockbackX < 0.5 && this.velKnockbackY < 0.5) {
            let dx = this.alvo.x - this.x;
            let dy = this.alvo.y - this.y;
            let distancia = Math.sqrt(dx * dx + dy * dy);

            // Comportamento padrão: ir para cima
            if (distancia > 0) {
                this.x += (dx / distancia) * this.velocidadeBase;
                this.y += (dy / distancia) * this.velocidadeBase;
            }

            // SOLID BLOCKING COM O PLAYER
            if (this.alvo.colid(this)) {
                this.atacarAlvo(); 
                let pEsq = this.alvo.x + this.alvo.hitbox.x;
                let pDir = pEsq + this.alvo.hitbox.w;
                let pTopo = this.alvo.y + this.alvo.hitbox.y;
                let pBase = pTopo + this.alvo.hitbox.h;
                let iEsq = this.x + this.hitbox.x;
                let iDir = iEsq + this.hitbox.w;
                let iTopo = this.y + this.hitbox.y;
                let iBase = iTopo + this.hitbox.h;

                let overlapX = Math.min(pDir - iEsq, iDir - pEsq);
                let overlapY = Math.min(pBase - iTopo, iBase - pTopo);

                if (overlapX < overlapY) {
                    let centroAlvoX = pEsq + this.alvo.hitbox.w / 2;
                    let centroInimigoX = iEsq + this.hitbox.w / 2;
                    if (centroInimigoX > centroAlvoX) this.x += overlapX;
                    else this.x -= overlapX;
                } else {
                    let centroAlvoY = pTopo + this.alvo.hitbox.h / 2;
                    let centroInimigoY = iTopo + this.hitbox.h / 2;
                    if (centroInimigoY > centroAlvoY) this.y += overlapY;
                    else this.y -= overlapY;
                }
            }
        }

        // COLISÃO INIMIGO VS INIMIGO (Anti-Amontoamento)
        if (listaInimigos) {
            for (let outro of listaInimigos) {
                if (outro === this) continue; 
                let centroAx = this.x + this.w / 2; let centroAy = this.y + this.h / 2;
                let centroBx = outro.x + outro.w / 2; let centroBy = outro.y + outro.h / 2;
                let ex = centroAx - centroBx; let ey = centroAy - centroBy;
                let distInimigos = Math.sqrt(ex * ex + ey * ey);
                let distanciaMinima = (this.hitbox.w + outro.hitbox.w) * 0.65;

                if (distInimigos < distanciaMinima) {
                    if (distInimigos === 0) {
                        this.x += (Math.random() - 0.5) * 4; this.y += (Math.random() - 0.5) * 4;
                        continue;
                    }
                    let forcaRepulsao = (distanciaMinima - distInimigos) / distanciaMinima;
                    this.x += (ex / distInimigos) * forcaRepulsao * this.velocidadeBase * 0.5;
                    this.y += (ey / distInimigos) * forcaRepulsao * this.velocidadeBase * 0.5;
                }
            }
        }
    }

    definirAlvoMaisProximo() {
        let jogadores = this.jogo.jogadores;
        if (!jogadores || jogadores.length === 0) { this.alvo = null; return; }
        let menorDistancia = Infinity;
        let jogadorMaisPerto = null;
        for (let jogador of jogadores) {
            let dx = jogador.x - this.x; let dy = jogador.y - this.y;
            let distancia = Math.sqrt(dx * dx + dy * dy);
            if (distancia < menorDistancia) { menorDistancia = distancia; jogadorMaisPerto = jogador; }
        }
        this.alvo = jogadorMaisPerto;  
    }

    tomarDano(quantidade, origemX = this.x, origemY = this.y, forcaKnockback = 5) {
        this.vidaAtual -= quantidade;
        this.receberKnockback(origemX, origemY, forcaKnockback);
        if (this.vidaAtual <= 0) {
            this.morrer();
        }
    }

    atacarAlvo() {
        if (this.alvo && typeof this.alvo.receberDano === "function" && this.danoContato > 0) {
            this.alvo.receberDano(this.danoContato);
        }
    }

    morrer() {
        this.jogo.barraXP.adicionarXP(this.xpRecompensa);
        this.jogo.removerInimigo(this);
    }
    
    desenhar(contexto) {
        if (this.img.complete && this.img.naturalWidth !== 0) {
            contexto.drawImage(this.img, this.x, this.y, this.w, this.h);
        } else {
            // Placeholder: Boss fica roxo, outros vermelho, atirador azul (para teste)
            contexto.fillStyle = this.nome === "A Grande Cigarra" ? "purple" : "red";
            contexto.fillRect(this.x, this.y, this.w, this.h);
        }
    }
}

// --- CLASSES DERIVADAS ---
class InimigoMelee extends Inimigo {}

class InimigoAtirador extends Inimigo {
    constructor(x, y, w, h, imgCaminho, configuracao, jogo) {
        super(x, y, w, h, imgCaminho, configuracao, jogo);
        this.timerTiro = 0;
        this.distanciaManter = 250; 
    }

    atualizarI(listaInimigos, tirosInimigosNaTela, deltaTime) {
        this.definirAlvoMaisProximo();
        
        // Fica de longe
        if (this.alvo && this.velKnockbackX < 0.5 && this.velKnockbackY < 0.5) {
            let dx = this.alvo.x - this.x; let dy = this.alvo.y - this.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist > this.distanciaManter + 20) {
                this.x += (dx / dist) * this.velocidadeBase; this.y += (dy / dist) * this.velocidadeBase;
            } else if (dist < this.distanciaManter - 20) {
                this.x -= (dx / dist) * this.velocidadeBase; this.y -= (dy / dist) * this.velocidadeBase;
            }

            // Cospe a larva
            this.timerTiro += deltaTime;
            if (this.timerTiro >= 3000) { 
                this.timerTiro = 0;
                let novaLarva = new InimigoMelee(this.x, this.y, 20, 20, "", TIPOS_INIMIGOS.larva, this.jogo);
                listaInimigos.push(novaLarva);
            }
        }
        super.atualizarI(listaInimigos, tirosInimigosNaTela, deltaTime); 
    }
}

class BossCigarra extends Inimigo {
    constructor(x, y, w, h, imgCaminho, configuracao, jogo) {
        super(x, y, w, h, imgCaminho, configuracao, jogo);
        this.timerTiro = 0;
    }

    atualizarI(listaInimigos, tirosInimigosNaTela, deltaTime) {
        super.atualizarI(listaInimigos, tirosInimigosNaTela, deltaTime); 
        
        this.timerTiro += deltaTime;
        if (this.timerTiro >= 1500 && this.alvo) { // Dispara Ninfas
            this.timerTiro = 0;
            let dx = (this.alvo.x + this.alvo.w/2) - (this.x + this.w/2);
            let dy = (this.alvo.y + this.alvo.h/2) - (this.y + this.h/2);
            let angulo = Math.atan2(dy, dx);

            tirosInimigosNaTela.push({
                x: this.x + this.w/2, y: this.y + this.h/2,
                w: 15, h: 15,
                vx: Math.cos(angulo) * 4, vy: Math.sin(angulo) * 4,
                dano: 15, tempoVida: 4000
            });
        }
    }
}