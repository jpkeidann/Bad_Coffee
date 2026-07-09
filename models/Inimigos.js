class Inimigo {
    constructor(x, y, w, h, imgCaminho, configuracao, jogo) {
        this.jogo = jogo; 

        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.img = new Image();
        this.img.src = imgCaminho || ""; // Se não passar imagem, fica vazio para usar o quadrado vermelho

         this.hitbox = {
            x: w * 0.1,         
            y: h * 0.1,         
            w: w * 0.8,        
            h: h * 0.8          
        };

        // Configurações básicas 
        this.nome = configuracao.nome || "Praga Comum";
        this.velocidadeBase = configuracao.velocidade || 2;
        this.vidaMaxima = configuracao.vida || 10;
        this.danoContato = configuracao.dano || 1;
        this.xpRecompensa = configuracao.xp || 5;

        if (this.jogo.temDoisJogadores) {
            this.vidaMaxima = Math.round(this.vidaMaxima * 1.7);
        }
        
        this.vidaAtual = this.vidaMaxima;
        this.alvo = null; 
    }

    // 2. O LOOP PRINCIPAL (Roda a cada frame do jogo)
    // ALTERADO: Agora a IA recebe a lista completa de inimigos vivos para se comparar com eles
    atualizarI(listaInimigos) {
        this.definirAlvoMaisProximo();

        if (this.alvo) {
            let dx = this.alvo.x - this.x;
            let dy = this.alvo.y - this.y;
            let distancia = Math.sqrt(dx * dx + dy * dy);

            if (distancia > 0) {
                let direcaoX = dx / distancia;
                let direcaoY = dy / distancia;

                this.x += direcaoX * this.velocidadeBase;
                this.y += direcaoY * this.velocidadeBase;
            }

            // --- 1. SOLID BLOCKING COM O PLAYER (Não passar por cima) ---
            // --- CORREÇÃO DO SOLID BLOCKING ---
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

                // Empurra baseado no centro das HITBOXES (Resolve o bug da imagem_c3b597)
                if (overlapX < overlapY) {
                    let centroAlvoX = pEsq + this.alvo.hitbox.w / 2;
                    let centroInimigoX = iEsq + this.hitbox.w / 2;
                    
                    if (centroInimigoX > centroAlvoX) {
                        this.x += overlapX;
                    } else {
                        this.x -= overlapX;
                    }
                } else {
                    let centroAlvoY = pTopo + this.alvo.hitbox.h / 2;
                    let centroInimigoY = iTopo + this.hitbox.h / 2;
                    
                    if (centroInimigoY > centroAlvoY) {
                        this.y += overlapY;
                    } else {
                        this.y -= overlapY;
                    }
                }
            }
        }

        // --- 2. COLISÃO INIMIGO VS INIMIGO (Anti-Amontoamento) ---
        if (listaInimigos) {
            for (let outro of listaInimigos) {
                if (outro === this) continue; // Não se empurrar consigo mesmo

                // Encontra o ponto central de cada um
                let centroAx = this.x + this.w / 2;
                let centroAy = this.y + this.h / 2;
                let centroBx = outro.x + outro.w / 2;
                let centroBy = outro.y + outro.h / 2;

                let ex = centroAx - centroBx;
                let ey = centroAy - centroBy;
                let distInimigos = Math.sqrt(ex * ex + ey * ey);

                
                let distanciaMinima = (this.hitbox.w + outro.hitbox.w) * 0.65;

                if (distInimigos < distanciaMinima) {
                    // Evita divisão por zero caso nasçam na mesmíssima coordenada
                    if (distInimigos === 0) {
                        this.x += (Math.random() - 0.5) * 4;
                        this.y += (Math.random() - 0.5) * 4;
                        continue;
                    }

                    // Força de empurrão suave proporcional à proximidade
                    let forcaRepulsao = (distanciaMinima - distInimigos) / distanciaMinima;
                    

                    this.x += (ex / distInimigos) * forcaRepulsao * this.velocidadeBase * 0.5;
                    this.y += (ey / distInimigos) * forcaRepulsao * this.velocidadeBase * 0.5;
                }
            }
        }
    }

    definirAlvoMaisProximo() {
        let jogadores = this.jogo.jogadores;
        if (jogadores.length === 0) {
            this.alvo = null;
            return;
        }

        let menorDistancia = Infinity;
        let jogadorMaisPerto = null;

        for (let jogador of jogadores) {
            let dx = jogador.x - this.x;
            let dy = jogador.y - this.y;
            let distancia = Math.sqrt(dx * dx + dy * dy);

            if (distancia < menorDistancia) {
                menorDistancia = distancia;
                jogadorMaisPerto = jogador;
            }
        }
        this.alvo = jogadorMaisPerto;  
    }

    tomarDano(quantidade) {
        this.vidaAtual -= quantidade;
        if (this.vidaAtual <= 0) {
            this.morrer();
        }
    }

    atacarAlvo() {
        if (this.alvo && typeof this.alvo.receberDano === "function") {
            this.alvo.receberDano(this.danoContato);
        }
    }

    morrer() {
        this.jogo.barraXP.adicionarXP(this.xpRecompensa);
        this.jogo.removerInimigo(this);
    }
    
    // --- CORREÇÃO: Função desenhar unificada e com fallback para debug ---
    desenhar(contexto) {
        if (this.img.complete && this.img.naturalWidth !== 0) {
            contexto.drawImage(this.img, this.x, this.y, this.w, this.h);
        } else {
            // Se não tiver imagem, desenha um quadrado vermelho!
            contexto.fillStyle = "red";
            contexto.fillRect(this.x, this.y, this.w, this.h);
        }
    }
}