class Inimigo {
    constructor(x, y, w, h, imgCaminho, configuracao, jogo) {
      
        
        this.jogo = jogo; 

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

    desenhar(contexto) {
        // Garante que a imagem foi carregada antes de tentar desenhar na tela
        if (this.img.complete) {
            contexto.drawImage(this.img, this.x, this.y, this.w, this.h);
        }
    }


    // 2. O LOOP PRINCIPAL (Roda a cada frame do jogo)
    atualizarI() {
        // Encontra quem está mais perto
        this.definirAlvoMaisProximo();

        // Se houver um jogador vivo na tela, persegue ele
        if (this.alvo) {
            // Calcula a distância nos eixos X e Y
            let dx = this.alvo.x - this.x;
            let dy = this.alvo.y - this.y;
            
            // Teorema de Pitágoras para saber a distância real em linha reta
            let distancia = Math.sqrt(dx * dx + dy * dy);

            if (distancia > 0) {
                // Normaliza o vetor (faz o inimigo não andar mais rápido na diagonal)
                let direcaoX = dx / distancia;
                let direcaoY = dy / distancia;

                // Move o inimigo em direção ao Café
                this.x += direcaoX * this.velocidadeBase;
                this.y += direcaoY * this.velocidadeBase;
            }

            // DETECÇÃO DE TOQUE: Se encostar no jogador (distância menor que 20 pixels)
            if (distancia < 20) {
                this.atacarAlvo();
            }
        }
    }

    // 3. INTELIGÊNCIA ARTIFICIAL (Quem eu devo atacar?)
    definirAlvoMaisProximo() {
        let jogadores = this.jogo.jogadores; // Pega a lista de jogadores ativos

        // Se todos morreram, não faz nada
        if (jogadores.length === 0) {
            this.alvo = null;
            return;
        }

        let menorDistancia = Infinity; // Começa com um número infinito
        let jogadorMaisPerto = null;

        // Roda um teste para cada jogador na tela
        for (let jogador of jogadores) {
            let dx = jogador.x - this.x;
            let dy = jogador.y - this.y;
            let distancia = Math.sqrt(dx * dx + dy * dy);

            // Se esse jogador estiver mais perto que o anterior, ele vira o novo alvo
            if (distancia < menorDistancia) {
                menorDistancia = distancia;
                jogadorMaisPerto = jogador;
            }
        }

        // Define quem o inimigo vai caçar neste frame
        this.alvo = jogadorMaisPerto;  
    }

    // 4. SISTEMA DE COMBATE (Tomar Dano)
    tomarDano(quantidade) {
        this.vidaAtual -= quantidade;
        
        // Se a vida zerar, ele morre
        if (this.vidaAtual <= 0) {
            this.morrer();
        }
    }

    // 5. SISTEMA DE COMBATE (Dar Dano no Café)
    atacarAlvo() {
        /* TRAVA DE SEGURANÇA (typeof): 
           Checa se o alvo existe e se ele REALMENTE tem uma função chamada 'receberDano'.
           Isso evita que o jogo trave (crash) caso o jogador morra ou suma da tela 
           exatamente no mesmo milissegundo em que o inimigo encostou nele.
        */
        if (this.alvo && typeof this.alvo.receberDano === "function") {
            this.alvo.receberDano(this.danoContato);
        }
    }

    // 6. SISTEMA DE XP DIRETO (Sem dropar nada no chão)
    morrer() {
        // Envia o XP direto para o gerenciador da barra de XP do jogo
        this.jogo.barraXP.adicionarXP(this.xpRecompensa);
        
        // Avisa o jogo para apagar esse inimigo da memória
        this.jogo.removerInimigo(this);
    }
    
    desenhar(contexto) {
        // Se a imagem carregou e não está quebrada, desenha ela
        if (this.img.complete && this.img.naturalWidth !== 0) {
            contexto.drawImage(this.img, this.x, this.y, this.w, this.h);
        } else {
            // MODO DEBUG: Se a imagem falhar, desenha um quadrado vermelho para você ver que ele existe!
            contexto.fillStyle = "red";
            contexto.fillRect(this.x, this.y, this.w, this.h);
        }
    }
    
}