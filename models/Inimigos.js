const TIPOS_INIMIGOS = {
    acaro: { 
        id: "acaro", 
        nome: "Ácaro-Vermelho", 
        largura: 35, 
        altura: 35, 
        velocidade: 2.5, 
        vida: 15, 
        dano: 5, 
        xp: 5, 
        knockbackResistencia: 0.1, 
        img: "../Img/acaro.png", 
        frames: 10, 
        tempoFrame: 70 
    },
    broca: { 
        id: "broca", 
        nome: "Broca-do-Café", 
        largura: 55, altura: 55, 
        velocidade: 1.5, 
        vida: 35, 
        dano: 10, 
        xp: 10, 
        knockbackResistencia: 0.5, 
        img: "../Img/broca.png", 
        frames: 3, 
        tempoFrame: 150 
    },
    bichoMineiro: { 
        id: "bichoMineiro", 
        nome: "Bicho-Mineiro", 
        largura: 105, 
        altura: 105, 
        velocidade: 1.2, 
        vida: 20, 
        dano: 0, 
        xp: 8, 
        knockbackResistencia: 0.3, 
        img: "../Img/bichoMineiro.png", 
        frames: 4, 
        tempoFrame: 200 
    },
    larva: { 
        id: "larva",
        nome: "Larva Mineira",  
        largura: 35, 
        altura: 20, 
        velocidade: 3.5, 
        vida: 1, 
        dano: 3, 
        xp: 2, 
        knockbackResistencia: 0, 
        img: "../Img/larva.png", 
        frames: 5, 
        tempoFrame: 100 
    },
    ninfa: { 
        id: "ninfa",
        nome: "Ninfa",  
        largura: 75, 
        altura: 50, 
        velocidade: 3.5, 
        vida: 20, 
        dano: 10, 
        xp: 17, 
        knockbackResistencia: 0, 
        img: "../Img/ninfa.png", 
        frames: 3, 
        tempoFrame: 10 
    },
    cigarraBoss: { 
        id: "boss", 
        nome: "Quesada Gigas", // Atualizado!
        largura: 160, 
        altura: 160, 
        velocidade: 1.0, 
        vida: 1500, 
        dano: 20, 
        xp: 500, 
        knockbackResistencia: 1.0, 
        img: "../Img/boss_sheet.png", 
        frames: 8, 
        tempoFrame: 150 
    }
};

// ==========================================
// 10. CLASSE INIMIGO UNIFICADA
// ==========================================
class Inimigo {
    constructor(x, y, w, h, imgCaminho, configuracao, jogo) {
        if (imgCaminho && typeof imgCaminho === "object") {
            this.jogo = configuracao;      
            configuracao = imgCaminho;     
            imgCaminho = configuracao.img; 
        } else {
            this.jogo = jogo;
        }

        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        
        configuracao = configuracao || {};
        
        this.img = new Image();
        this.img.onerror = () => {
            console.error(`[Erro de Sprite] Falha ao carregar a imagem em: ${this.img.src}`);
        };
        
        let caminhoFinal = imgCaminho || configuracao.img;
        if (caminhoFinal && typeof caminhoFinal === "string" && caminhoFinal.trim() !== "") {
            this.img.src = caminhoFinal; 
        }

        this.estado = "ativo"; 
        this.particulas = [];  

        this.atualizarHitbox();

        this.nome = configuracao.nome || "Praga Comum";
        this.velocidadeBase = configuracao.velocidade || 2;
        this.danoContato = configuracao.dano || 1;
        this.xpRecompensa = configuracao.xp || 5;

        this.totalFrames = configuracao.frames || 1; 
        this.frameAtual = 0;                         
        this.tempoPorFrame = configuracao.tempoFrame || 150; 
        this.timerAnimacao = 0;                      
        this.timerHabilidade = 0; 
        this.viradoParaEsquerda = false;             

        this.knockbackResistencia = configuracao.knockbackResistencia || 0;
        this.velKnockbackX = 0;
        this.velKnockbackY = 0;

        let multiplicadorCoop = 1;
        if (this.jogo && (this.jogo.temDoisJogadores || (this.jogo.jogadores && this.jogo.jogadores.length > 1))) {
            multiplicadorCoop = 1.8; 
        }
        
        this.vidaMaxima = Math.round((configuracao.vida || 10) * multiplicadorCoop);
        this.vidaAtual = this.vidaMaxima;
        this.alvo = null; 

        this.timerAtaqueBoss = 2000; 
        this.centroAlvoX = typeof canvas !== "undefined" ? canvas.width / 2 : 400;
        this.centroAlvoY = typeof canvas !== "undefined" ? canvas.height * 0.35 : 200;
    }

    atualizarHitbox() {
        this.hitbox = {
            x: this.w * 0.1, y: this.h * 0.1, 
            w: this.w * 0.8, h: this.h * 0.8  
        };
    }

    mudarTamanho(novaLargura, novaAltura) {
        this.w = novaLargura;
        this.h = novaAltura;
        this.atualizarHitbox();
    }

    receberKnockback(origemX, broomY, forca) {
        if (this.knockbackResistencia >= 1) return;
        let dx = this.x - origemX;
        let dy = this.y - broomY;
        let distancia = Math.sqrt(dx * dx + dy * dy);
        if (distancia > 0) {
            let forcaReal = forca * (1 - this.knockbackResistencia);
            this.velKnockbackX = (dx / distancia) * forcaReal;
            this.velKnockbackY = (dy / distancia) * forcaReal;
        }
    }

    verificarColisaoComAlvo() {
        if (!this.alvo) return false;

        let pEsq = this.alvo.x + (this.alvo.hitbox ? this.alvo.hitbox.x : 0);
        let pDir = pEsq + (this.alvo.hitbox ? this.alvo.hitbox.w : this.alvo.w);
        let pTopo = this.alvo.y + (this.alvo.hitbox ? this.alvo.hitbox.y : 0);
        let pBase = pTopo + (this.alvo.hitbox ? this.alvo.hitbox.h : this.alvo.h);

        let iEsq = this.x + this.hitbox.x;
        let iDir = iEsq + this.hitbox.w;
        let iTopo = this.y + this.hitbox.y;
        let iBase = iTopo + this.hitbox.h;

        return (iEsq < pDir && iDir > pEsq && iTopo < pBase && iBase > pTopo);
    }

    atualizarI(listaInimigos, tirosInimigosNaTela, deltaTime) {
        this.timerAnimacao += deltaTime;
        if (this.timerAnimacao >= this.tempoPorFrame) {
            this.timerAnimacao = 0;
            this.frameAtual = (this.frameAtual + 1) % this.totalFrames;
        }

        // Comportamento especial do Boss (Atualizado para Quesada Gigas)
        if (this.nome === "Quesada Gigas") {
            this.executarComportamentoBoss(deltaTime);
            return; 
        }

        if (this.nome === "Bicho-Mineiro" && this.jogo && typeof this.jogo.spawnarLarvas === "function") {
            this.timerHabilidade += deltaTime;
            if (this.timerHabilidade >= 4000) { 
                this.timerHabilidade = 0;
                this.jogo.spawnarLarvas(this.x, this.y, 1);
            }
        }

        this.x += this.velKnockbackX;
        this.y += this.velKnockbackY;
        this.velKnockbackX *= 0.85; 
        this.velKnockbackY *= 0.85;

        this.definirAlvoMaisProximo();

        if (this.alvo && Math.abs(this.velKnockbackX) < 0.5 && Math.abs(this.velKnockbackY) < 0.5) {
            let dx = this.alvo.x - this.x;
            let dy = this.alvo.y - this.y;
            let distancia = Math.sqrt(dx * dx + dy * dy);

            if (dx < 0) this.viradoParaEsquerda = true;
            else if (dx > 0) this.viradoParaEsquerda = false;

            if (distancia > 0) {
                this.x += (dx / distancia) * this.velocidadeBase;
                this.y += (dy / distancia) * this.velocidadeBase;
            }

            if (this.verificarColisaoComAlvo()) {
                this.atacarAlvo(); 
                
                let pEsq = this.alvo.x + (this.alvo.hitbox ? this.alvo.hitbox.x : 0);
                let pDir = pEsq + (this.alvo.hitbox ? this.alvo.hitbox.w : this.alvo.w);
                let pTopo = this.alvo.y + (this.alvo.hitbox ? this.alvo.hitbox.y : 0);
                let pBase = pTopo + (this.alvo.hitbox ? this.alvo.hitbox.h : this.alvo.h);

                let iEsq = this.x + this.hitbox.x; 
                let iDir = iEsq + this.hitbox.w;
                let iTopo = this.y + this.hitbox.y; 
                let iBase = iTopo + this.hitbox.h;

                let overlapX = Math.min(pDir - iEsq, iDir - pEsq);
                let overlapY = Math.min(pBase - iTopo, iBase - pTopo);

                if (overlapX < overlapY) {
                    let centroAlvoX = pEsq + (this.alvo.hitbox ? this.alvo.hitbox.w : this.alvo.w) / 2;
                    let centroInimigoX = iEsq + this.hitbox.w / 2;
                    if (centroInimigoX > centroAlvoX) this.x += overlapX; else this.x -= overlapX;
                } else {
                    let centroAlvoY = pTopo + (this.alvo.hitbox ? this.alvo.hitbox.h : this.alvo.h) / 2;
                    let centroInimigoY = iTopo + this.hitbox.h / 2;
                    if (centroInimigoY > centroAlvoY) this.y += overlapY; else this.y -= overlapY;
                }
            }
        }

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

    executarComportamentoBoss(deltaTime) {
        // --- 1. SE ESTIVER NO ESTADO DE SURGIMENTO ---
        if (this.estado === "surgindo") {
            this.timerSurgimento += deltaTime;

            // Spawna poeira e detritos de terra ao redor da base do Boss
            if (Math.random() < 0.6) {
                this.particulas.push({
                    x: this.x + this.w / 2 + (Math.random() - 0.5) * this.w * 0.5,
                    y: this.y + this.h * 0.8,
                    vx: (Math.random() - 0.5) * 6,
                    vy: -Math.random() * 5 - 3,
                    size: Math.random() * 8 + 4,
                    cor: Math.random() < 0.5 ? "#8B5A2B" : "#5C3A21", 
                    vida: 600 
                });
            }

            // Atualiza as partículas do efeito
            this.particulas.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.25; 
                p.vida -= deltaTime;
            });
            this.particulas = this.particulas.filter(p => p.vida > 0);

            // Finaliza o surgimento e ativa o Boss
            if (this.timerSurgimento >= this.tempoSurgimentoTotal) {
                this.estado = "ativo";
                this.particulas = [];
            }
            return; 
        }

        // --- 2. SE ESTIVER ATIVO (COMPORTAMENTO PADRÃO) ---
        this.definirAlvoMaisProximo();

        if (typeof canvas !== "undefined") {
            this.centroAlvoX = (canvas.width / 2) - (this.w / 2);
            this.centroAlvoY = canvas.height * 0.2;
        }

        let dx = this.centroAlvoX - this.x;
        let dy = this.centroAlvoY - this.y;
        let distCentro = Math.sqrt(dx * dx + dy * dy);

        if (distCentro > 5) {
            this.x += (dx / distCentro) * (this.velocidadeBase * 2);
            this.y += (dy / distCentro) * (this.velocidadeBase * 2);
        }

        // VERIFICAÇÃO DE HITBOX: Causa dano instantâneo no jogador ao toque
        if (this.alvo && this.verificarColisaoComAlvo()) {
            this.atacarAlvo();
            
            // Empurra levemente o player para trás para evitar acumulo absurdo de frames de dano
            if (this.alvo.receberKnockback && typeof this.alvo.receberKnockback === "function") {
                this.alvo.receberKnockback(this.x + this.w / 2, this.y + this.h / 2, 8);
            }
        }

        this.timerAtaqueBoss += deltaTime;
        if (this.timerAtaqueBoss >= 5000) { 
            this.timerAtaqueBoss = 0;
            
            console.log("🔥 BOSS: Invocando ninfas no campo de batalha!");
            
            let centroX = this.x + (this.w / 2);
            let centroY = this.y + (this.h / 2);

            if (this.jogo && typeof this.jogo.spawnarNinfas === "function") {
                this.jogo.spawnarNinfas(centroX, centroY, 6); 
            }
        }
    }

    definirAlvoMaisProximo() {
        if (!this.jogo || !this.jogo.jogadores || this.jogo.jogadores.length === 0) { this.alvo = null; return; }
        let menorDistancia = Infinity; let jogadorMaisPerto = null;
        for (let jogador of this.jogo.jogadores) {
            if (!jogador) continue;
            let dx = jogador.x - this.x; let dy = jogador.y - this.y;
            let distancia = Math.sqrt(dx * dx + dy * dy);
            if (distancia < menorDistancia) { menorDistancia = distancia; jogadorMaisPerto = jogador; }
        }
        this.alvo = Math.abs(this.velKnockbackX) < 1 ? jogadorMaisPerto : this.alvo;  
    }

    tomarDano(quantidade, origemX = this.x, origemY = this.y, forcaKnockback = 3) {
        if (this.estado === "surgindo") return;

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
        if (this.jogo) {
            if (this.jogo.barraXP && typeof this.jogo.barraXP.adicionarXP === "function") {
                this.jogo.barraXP.adicionarXP(this.xpRecompensa);
            } else if (typeof this.jogo.gainXp === "function") {
                this.jogo.gainXp(this.xpRecompensa);
            }

            if (typeof this.jogo.removerInimigo === "function") {
                this.jogo.removerInimigo(this);
            }
        }
    }
    
    desenhar(contexto) {
        // --- 1. COMPORTAMENTO VISUAL DO SURGIMENTO ---
        if (this.estado === "surgindo") {
            let progresso = this.timerSurgimento / this.tempoSurgimentoTotal;

            contexto.fillStyle = "rgba(40, 26, 13, 0.85)";
            contexto.beginPath();
            contexto.ellipse(
                this.x + this.w / 2, 
                this.y + this.h * 0.8, 
                this.w * 0.45 * progresso, 
                this.h * 0.18 * progresso, 
                0, 0, Math.PI * 2
            );
            contexto.fill();

            contexto.save();

            let groundLineY = this.y + this.h * 0.8;
            let clipTopY = this.y - this.h * 2;
            let clipHeight = groundLineY - clipTopY;

            contexto.beginPath();
            contexto.rect(this.x - 100, clipTopY, this.w + 200, clipHeight);
            contexto.clip(); 

            let offsetY = this.h * 0.8 * (1 - progresso);
            let shakeX = (Math.random() - 0.5) * 8 * (1 - progresso);

            contexto.translate(this.x + this.w / 2 + shakeX, this.y + this.h / 2 + offsetY);

            if (this.viradoParaEsquerda) {
                contexto.scale(-1, 1);
            }

            if (this.img.complete && this.img.naturalWidth !== 0) {
                let larguraFrame = this.img.naturalWidth / this.totalFrames;
                let alturaFrame = this.img.naturalHeight;
                let corteX = this.frameAtual * larguraFrame;

                contexto.drawImage(
                    this.img, 
                    corteX, 0, larguraFrame, alturaFrame, 
                    -this.w / 2, -this.h / 2, this.w, this.h   
                );
            } else {
                contexto.fillStyle = "#8e44ad";
                contexto.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
            }

            contexto.restore(); 

            this.particulas.forEach(p => {
                contexto.fillStyle = p.cor;
                contexto.fillRect(p.x, p.y, p.size, p.size);
            });

            return; 
        }

        // --- 2. DESENHO TRADICIONAL (ATIVO) ---
        if (this.img.complete && this.img.naturalWidth !== 0) {
            let larguraFrame = this.img.naturalWidth / this.totalFrames;
            let alturaFrame = this.img.naturalHeight;
            
            let corteX = this.frameAtual * larguraFrame;
            let corteY = 0;

            contexto.save(); 
            contexto.translate(this.x + this.w / 2, this.y + this.h / 2);

            if (this.viradoParaEsquerda) {
                contexto.scale(-1, 1);
            }

            contexto.drawImage(
                this.img, 
                corteX, corteY, larguraFrame, alturaFrame, 
                -this.w / 2, -this.h / 2, this.w, this.h   
            );
            contexto.restore(); 
        } else {
            contexto.fillStyle = this.nome === "Quesada Gigas" ? "#8e44ad" : "#e74c3c"; // Atualizado!
            contexto.fillRect(this.x, this.y, this.w, this.h);
        }
    }
}