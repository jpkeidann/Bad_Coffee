const TIPOS_INIMIGOS = {
    acaro: { 
        id: "acaro", 
        nome: "Ácaro-Vermelho", 
        largura: 72, 
        altura: 57, 
        velocidade: 3, 
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
        largura: 96, altura: 63, 
        velocidade: 1.2, 
        vida: 35, 
        dano: 10, 
        xp: 10, 
        knockbackResistencia: 0.5, 
        img: "../Img/broca.png", 
        frames: 11, 
        tempoFrame: 150
    },
    bichoMineiro: {
        id: "bichoMineiro",
        nome: "Bicho-Mineiro",
        largura: 104,
        altura: 64,
        velocidade: 1.5,
        vida: 20,
        dano: 0,
        xp: 20,
        knockbackResistencia: 0.3,
        img: "../Img/bichoMineiro.png",
        frames: 4,
        tempoFrame: 200,
        distanciaDeAndar: 400 // px que ele anda antes de parar de vez e começar a spawnar larvas
    },
    larva: { 
        id: "larva",
        nome: "Larva Mineira",  
        largura: 44, 
        altura: 13, 
        velocidade: 4, 
        vida: 1, 
        dano: 3, 
        xp: 1, 
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
        velocidade: 2, // estava faltando: antes caía no padrão 2 do construtor. Mude aqui pra deixar a ninfa mais rápida/lenta.
        vida: 20,
        dano: 10,
        xp: 16,
        knockbackResistencia: 0,
        img: "../Img/ninfa.png",
        frames: 3,
        tempoFrame: 100,

        // --- Animação de nascimento (a ninfa sai cavando a terra) ---
        // Toca UMA vez, com a ninfa parada, antes dela começar a andar atrás do jogador.
        imgSpawn: "../Img/ninfa_cavando.png",
        framesSpawn: 7,        // ninfa_cavando.png tem 7 quadros
        tempoFrameSpawn: 180,  // ms por quadro -> 7 x 180 = 1,26s de animação. Mude aqui pra deixar mais rápido/lento.
        spawnEspelhado: true   // ninfa_cavando.png está virado ao contrário do ninfa.png, então é desenhado espelhado
    },
    cigarraBoss: {
        id: "boss",
        nome: "Quesada Gigas",
        largura: 160,
        altura: 160,
        velocidade: 1.0,
        vida: 1500,
        dano: 20,
        xp: 0,
        knockbackResistencia: 1.0,
        img: "../Img/quesadagigas.png",
        frames: 1,
        tempoFrame: 150,

        // --- Invocação de ninfas ---
        intervaloSpawnNinfas: 8000, // ms entre uma leva de ninfas e a próxima. AUMENTE pra spawnar menos vezes, DIMINUA pra spawnar mais.
        ninfasPorLeva: 9            // quantas ninfas nascem de uma vez
    }
};

// ==========================================
// 1. CLASSE INIMIGO UNIFICADA
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

        // --- Animação de nascimento (opcional, vem do TIPOS_INIMIGOS) ---
        // Se o tipo do inimigo tiver uma "imgSpawn", ele nasce no estado "spawnando":
        // fica parado tocando essa animação uma única vez e só depois começa a andar.
        // Quem não tiver imgSpawn continua nascendo direto no estado "ativo", como antes.
        this.imgSpawn = null;
        this.totalFramesSpawn = configuracao.framesSpawn || 1;
        this.tempoPorFrameSpawn = configuracao.tempoFrameSpawn || 120;
        this.spawnEspelhado = configuracao.spawnEspelhado === true;
        this.timerSpawn = 0;

        if (configuracao.imgSpawn) {
            this.imgSpawn = new Image();
            this.imgSpawn.onerror = () => {
                // Se o spritesheet de nascimento falhar, o inimigo entra direto no jogo
                // em vez de ficar parado e invisível esperando uma animação que não existe.
                console.error(`[Erro de Sprite] Falha ao carregar a animação de spawn em: ${this.imgSpawn.src}`);
                this.estado = "ativo";
            };
            this.imgSpawn.src = configuracao.imgSpawn;

            this.estado = "spawnando";
            this.frameAtual = 0;
        }

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

        // --- Efeito visual de "flash" ao tomar dano ---
        this.duracaoFlashDano = 100;   // Tempo (ms) que o inimigo fica com opacidade reduzida ao levar dano. Mude aqui se precisar ajustar.
        this.opacidadeFlashDano = 0.35; // Opacidade aplicada durante o flash (1 = normal, 0 = invisível)
        this.timerFlashDano = 0;       // Contador interno, não mexer diretamente

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
        // Enquanto a animação de nascimento não acabar, o i20nimigo fica parado:
        // não persegue o jogador, não empurra os outros e não causa dano por contato.
        if (this.estado === "spawnando") {
            this.atualizarAnimacaoDeSpawn(deltaTime);
            return;
        }

        this.timerAnimacao += deltaTime;
        if (this.timerAnimacao >= this.tempoPorFrame) {
            this.timerAnimacao = 0;
            this.frameAtual = (this.frameAtual + 1) % this.totalFrames;
        }

        // Conta o tempo do flash de dano (independente do resto, funciona pra qualquer inimigo, incluindo Boss)
        if (this.timerFlashDano > 0) {
            this.timerFlashDano -= deltaTime;
            if (this.timerFlashDano < 0) this.timerFlashDano = 0;
        }

        // Comportamento especial do Boss (Atualizado para Quesada Gigas)
        if (this.nome === "Quesada Gigas") {
            this.executarComportamentoBoss(deltaTime);
            return; 
        }

        // Bicho-Mineiro: anda até TIPOS_INIMIGOS.bichoMineiro.distanciaParaMinerar px
        // (contados logo abaixo, junto do movimento) e então para DE VEZ, ficando
        // parado ali e soltando larvas periodicamente.
        if (this.nome === "Bicho-Mineiro") {
            if (this.distanciaAndada === undefined) this.distanciaAndada = 0;
            if (this.paradoSpawnando === undefined) this.paradoSpawnando = false;

            if (this.paradoSpawnando && this.jogo ) {
                this.timerHabilidade += deltaTime;
                if (this.timerHabilidade >= 3500) {
                    this.timerHabilidade = 0;
                    this.jogo.spawnarLarvas(this.x, this.y, 1);
                }
            }
        }

        this.x += this.velKnockbackX;
        this.y += this.velKnockbackY;
        this.velKnockbackX *= 0.85; 
        this.velKnockbackY *= 0.85;

        this.definirAlvoMaisProximo();

        let bichoMineiroParado = this.nome === "Bicho-Mineiro" && this.paradoSpawnando;

        if (this.alvo && Math.abs(this.velKnockbackX) < 0.5 && Math.abs(this.velKnockbackY) < 0.5 && !bichoMineiroParado) {
            let dx = this.alvo.x - this.x;
            let dy = this.alvo.y - this.y;
            let distancia = Math.sqrt(dx * dx + dy * dy);

            if (dx < 0) this.viradoParaEsquerda = true;
            else if (dx > 0) this.viradoParaEsquerda = false;

            if (distancia > 0) {
                let passoX = (dx / distancia) * this.velocidadeBase;
                let passoY = (dy / distancia) * this.velocidadeBase;
                this.x += passoX;
                this.y += passoY;

                if (this.nome === "Bicho-Mineiro") {
                    this.distanciaAndada += Math.hypot(passoX, passoY);
                    if (this.distanciaAndada >= (TIPOS_INIMIGOS.bichoMineiro.distanciaDeAndar || 300)) {
                        this.paradoSpawnando = true;
                        this.timerHabilidade = 0; // já solta a primeira larva contando a partir de agora
                    }
                }
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

    // Toca a animação de nascimento UMA vez (sem loop). Quando o último quadro
    // termina, o inimigo passa para "ativo" e volta a usar o spritesheet normal de andar.
    atualizarAnimacaoDeSpawn(deltaTime) {
        // O flash de dano continua rodando: a ninfa já pode levar tiro enquanto cava,
        // então o jogador precisa ver o hit registrando.
        if (this.timerFlashDano > 0) {
            this.timerFlashDano -= deltaTime;
            if (this.timerFlashDano < 0) this.timerFlashDano = 0;
        }

        // Já nasce olhando pro jogador mais próximo, pra não ter uma virada
        // brusca no instante em que ela começa a andar.
        this.definirAlvoMaisProximo();
        if (this.alvo) {
            this.viradoParaEsquerda = (this.alvo.x - this.x) < 0;
        }

        this.timerSpawn += deltaTime;
        this.frameAtual = Math.floor(this.timerSpawn / this.tempoPorFrameSpawn);

        if (this.frameAtual >= this.totalFramesSpawn) {
            this.frameAtual = 0;
            this.timerAnimacao = 0;
            this.estado = "ativo";
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
            } // Atualizado!

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

        // VERIFICAÇÃO DE HITBOX:
        if (this.alvo && this.verificarColisaoComAlvo()) {
            this.atacarAlvo();
            
            // Empurra levemente o player para trás para evitar acumulo absurdo de frames de dano
            if (this.alvo.receberKnockback && typeof this.alvo.receberKnockback === "function") {
                this.alvo.receberKnockback(this.x + this.w / 2, this.y + this.h / 2, 8);
            }
        }

        // Invocação de ninfas. Os dois números (intervalo e quantidade) ficam
        // em TIPOS_INIMIGOS.cigarraBoss, lá no topo deste arquivo.
        let configBoss = TIPOS_INIMIGOS.cigarraBoss;
        let intervaloEntreLevas = configBoss.intervaloSpawnNinfas || 5000;

        this.timerAtaqueBoss += deltaTime;
        if (this.timerAtaqueBoss >= intervaloEntreLevas) {
            this.timerAtaqueBoss = 0;

            if (this.jogo && typeof this.jogo.spawnarNinfas === "function") {
                this.jogo.spawnarNinfas(configBoss.ninfasPorLeva || 9);
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
        this.timerFlashDano = this.duracaoFlashDano; // Ativa o flash de opacidade ao levar dano
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
    
    // Desenha um quadro da animação de nascimento (ex: a ninfa saindo da terra).
    desenharAnimacaoDeSpawn(contexto) {
        if (!this.imgSpawn || !this.imgSpawn.complete || this.imgSpawn.naturalWidth === 0) return;

        let larguraFrame = this.imgSpawn.naturalWidth / this.totalFramesSpawn;
        let alturaFrame = this.imgSpawn.naturalHeight;

        // Trava no último quadro por segurança, caso o timer passe do fim antes da troca de estado
        let quadro = Math.min(this.frameAtual, this.totalFramesSpawn - 1);

        contexto.save();
        contexto.translate(this.x + this.w / 2, this.y + this.h / 2);

        // O spritesheet de nascimento pode estar virado ao contrário do spritesheet
        // de andar — é o caso do ninfa_cavando.png. Quando spawnEspelhado é true a
        // virada é invertida, pra que os dois terminem apontando pro mesmo lado e a
        // ninfa não "dê um flip" no instante em que começa a andar.
        let precisaVirar = this.spawnEspelhado ? !this.viradoParaEsquerda : this.viradoParaEsquerda;
        if (precisaVirar) contexto.scale(-1, 1);

        if (this.timerFlashDano > 0) {
            contexto.globalAlpha = this.opacidadeFlashDano;
        }

        contexto.drawImage(
            this.imgSpawn,
            quadro * larguraFrame, 0, larguraFrame, alturaFrame,
            -this.w / 2, -this.h / 2, this.w, this.h
        );
        contexto.restore();
    }

    desenhar(contexto) {
        // --- 0. ANIMAÇÃO DE NASCIMENTO (ninfa saindo da terra) ---
        if (this.estado === "spawnando") {
            this.desenharAnimacaoDeSpawn(contexto);
            return;
        }

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

            // Flash de dano: reduz a opacidade enquanto timerFlashDano estiver ativo
            if (this.timerFlashDano > 0) {
                contexto.globalAlpha = this.opacidadeFlashDano;
            }

            contexto.drawImage(
                this.img,
                corteX, corteY, larguraFrame, alturaFrame,
                -this.w / 2, -this.h / 2, this.w, this.h
            );
            contexto.restore();
        } else {
            contexto.save();
            if (this.timerFlashDano > 0) {
                contexto.globalAlpha = this.opacidadeFlashDano;
            }
            contexto.fillStyle = this.nome === "Quesada Gigas" ? "#8e44ad" : "#e74c3c"; // Atualizado!
            contexto.fillRect(this.x, this.y, this.w, this.h);
            contexto.restore();
        }
    }
}
