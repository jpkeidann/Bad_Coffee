// ==================== CATÁLOGO DE PRAGAS ====================
const TIPOS_INIMIGOS = {
    acaro: { id: "acaro", nome: "Ácaro-Vermelho", largura: 35, altura: 35, velocidade: 2.5, vida: 15, dano: 5, xp: 5, knockbackResistencia: 0.1, img: "Img/acaro.png", frames: 10, tempoFrame: 70 },
    broca: { id: "broca", nome: "Broca-do-Café", largura: 55, altura: 55, velocidade: 1.5, vida: 35, dano: 10, xp: 10, knockbackResistencia: 0.5, img: "Img/broca.png", frames: 5, tempoFrame: 150 },
    bichoMineiro: { id: "bichoMineiro", nome: "Bicho-Mineiro", largura: 125, altura: 125, velocidade: 1.2, vida: 20, dano: 0, xp: 8, knockbackResistencia: 0.3, img: "Img/bichoMineiro.png", frames: 4, tempoFrame: 200 },
    larva: { id: "larva", nome: "Larva Mineira", largura: 35, altura: 20, velocidade: 3.5, vida: 1, dano: 3, xp: 1, knockbackResistencia: 0, img: "Img/larva.png", frames: 5, tempoFrame: 100 },
    cigarraBoss: { id: "boss", nome: "A Grande Cigarra", largura: 160, altura: 160, velocidade: 1.0, vida: 1500, dano: 20, xp: 500, knockbackResistencia: 1.0, img: "Img/boss_sheet.png", frames: 8, tempoFrame: 150 }
};

// ==================== CLASSE INIMIGO ====================
class Inimigo {
    constructor(x, y, w, h, imgCaminho, configuracao, jogo) {
        // Blindagem para caso os argumentos venham em ordem invertida
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
            console.error(`[Erro de Sprite] Não foi possível carregar a imagem em: ${this.img.src}`);
        };
        
        let caminhoFinal = imgCaminho || configuracao.img;
        if (caminhoFinal && typeof caminhoFinal === "string" && caminhoFinal.trim() !== "") {
            this.img.src = caminhoFinal; 
        }

        this.atualizarHitbox();

        this.nome = configuracao.nome || "Praga Comum";
        this.velocidadeBase = configuracao.velocidade || 2;
        this.danoContato = configuracao.dano || 1;
        this.xpRecompensa = configuracao.xp || 5;

        // Controle de Sprites e Habilidades
        this.totalFrames = configuracao.frames || 1; 
        this.frameAtual = 0;                         
        this.tempoPorFrame = configuracao.tempoFrame || 150; 
        this.timerAnimacao = 0;                      
        this.timerHabilidade = 0; // Usado pelo Bicho-Mineiro para botar larvas
        this.viradoParaEsquerda = false;             

        this.knockbackResistencia = configuracao.knockbackResistencia || 0;
        this.velKnockbackX = 0;
        this.velKnockbackY = 0;

        // --- SISTEMA DE ESCALA DE VIDA PARA 2 JOGADORES ---
        let multiplicadorCoop = 1;
        if (this.jogo && (this.jogo.temDoisJogadores || (this.jogo.jogadores && this.jogo.jogadores.length > 1))) {
            multiplicadorCoop = 1.8; // +80% de HP no multiplayer!
        }
        
        this.vidaMaxima = Math.round((configuracao.vida || 10) * multiplicadorCoop);
        this.vidaAtual = this.vidaMaxima;
        this.alvo = null; 
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

    receberKnockback(origemX, origemY, forca) {
        if (this.knockbackResistencia >= 1) return;
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
        // 1. Atualização dos frames da animação
        this.timerAnimacao += deltaTime;
        if (this.timerAnimacao >= this.tempoPorFrame) {
            this.timerAnimacao = 0;
            this.frameAtual = (this.frameAtual + 1) % this.totalFrames;
        }

        // 2. Habilidade do Bicho-Mineiro: Soltar larvas enquanto caminha
        if (this.nome === "Bicho-Mineiro" && this.jogo && typeof this.jogo.spawnarLarvas === "function") {
            this.timerHabilidade += deltaTime;
            if (this.timerHabilidade >= 4000) { // A cada 4 segundos
                this.timerHabilidade = 0;
                this.jogo.spawnarLarvas(this.x, this.y, 1);
            }
        }

        // 3. Física de Knockback e Movimento
        this.x += this.velKnockbackX;
        this.y += this.velKnockbackY;
        this.velKnockbackX *= 0.85; 
        this.velKnockbackY *= 0.85;

        this.definirAlvoMaisProximo();

        if (this.alvo && Math.abs(this.velKnockbackX) < 0.5 && Math.abs(this.velKnockbackY) < 0.5) {
            let dx = this.alvo.x - this.x;
            let dy = this.alvo.y - this.y;
            let distancia = Math.sqrt(dx * dx + dy * dy);

            if (dx < 0) {
                this.viradoParaEsquerda = true;
            } else if (dx > 0) {
                this.viradoParaEsquerda = false;
            }

            if (distancia > 0) {
                this.x += (dx / distancia) * this.velocidadeBase;
                this.y += (dy / distancia) * this.velocidadeBase;
            }

            if (this.alvo.colid && typeof this.alvo.colid === "function" && this.alvo.colid(this)) {
                this.atacarAlvo(); 
                let pEsq = this.alvo.x + this.alvo.hitbox.x; let pDir = pEsq + this.alvo.hitbox.w;
                let pTopo = this.alvo.y + this.alvo.hitbox.y; let pBase = pTopo + this.alvo.hitbox.h;
                let iEsq = this.x + this.hitbox.x; let iDir = iEsq + this.hitbox.w;
                let iTopo = this.y + this.hitbox.y; let iBase = iTopo + this.hitbox.h;

                let overlapX = Math.min(pDir - iEsq, iDir - pEsq);
                let overlapY = Math.min(pBase - iTopo, iBase - pTopo);

                if (overlapX < overlapY) {
                    let centroAlvoX = pEsq + this.alvo.hitbox.w / 2; let centroInimigoX = iEsq + this.hitbox.w / 2;
                    if (centroInimigoX > centroAlvoX) this.x += overlapX; else this.x -= overlapX;
                } else {
                    let centroAlvoY = pTopo + this.alvo.hitbox.h / 2; let centroInimigoY = iTopo + this.hitbox.h / 2;
                    if (centroInimigoY > centroAlvoY) this.y += overlapY; else this.y -= overlapY;
                }
            }
        }

        // 4. Repulsão entre inimigos para não empilharem
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
            // Bloco de emergência caso a imagem não carregue
            contexto.fillStyle = this.nome === "A Grande Cigarra" ? "purple" : "red";
            contexto.fillRect(this.x, this.y, this.w, this.h);
        }
    }
}