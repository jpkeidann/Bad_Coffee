class Inimigo {
    constructor(x, y, w, h, imgCaminho, configuracao, jogo) {
        this.jogo = jogo; 

        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.img = new Image();
        this.img.src = imgCaminho || ""; // Se não passar imagem, fica vazio para usar o quadrado vermelho

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
    atualizarI() {
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

            if (distancia < 20) {
                this.atacarAlvo();
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