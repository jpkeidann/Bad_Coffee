class Player extends Obj {
    constructor(x, y, w, h, imagemCaminho) {
        // Envia os dados para a classe pai (Obj) carregar a imagem e posições base
        super(x, y, w, h, imagemCaminho); 
        
        this.speed = 6;          // Velocidade base (Será aumentada pelo item SERINGA)
        this.dirX = 0;
        this.dirY = 0;

        this.vidaMaxima = 100;   // Vida máxima base (Será aumentada pelo item CASCA)
        this.vidaAtual = 100;
        this.regen = 0;          // Regeneração de vida por segundo (Ativada pelo item LEITE)
        this.armadura = 0;       // Redução de dano fixo recebido (Ativada pelo item ARMADURA)

        // Cria uma caixa de colisão menor que o sprite para ficar justo contra os inimigos do Davi
        this.hitbox = {
            x: 25, 
            y: 25,
            w: this.w - 50,
            h: this.h - 50
        };
    }

    // --- DESENHO DO PERSONAGEM ---
    des_player() {
        // Verifica se a imagem herdada de Obj já foi carregada
        if (this.img && this.img.complete) {
            des.drawImage(this.img, this.x, this.y, this.w, this.h);
        } else {
            // Fallback: Desenha um quadrado marrom (grão de café) provisório caso a imagem falhe
            des.fillStyle = "#4a2c11";
            des.fillRect(this.x, this.y, this.w, this.h);
        }

        //Descomente as linhas abaixo se quiserem enxergar a Hitbox vermelha piscando
        /*
        des.strokeStyle = "red";
        des.lineWidth = 2;
        des.strokeRect(this.x + this.hitbox.x, this.y + this.hitbox.y, this.hitbox.w, this.hitbox.h);
        */
    }

    mov_player(limiteCima, limiteBaixo, limiteEsq, limiteDir) {
        let dx = this.dirX;
        let dy = this.dirY;

        // Correção de velocidade diagonal (Normalização matemática)
        // Sem isso, se apertar W e D juntos ele anda 40% mais rápido!
        if (dx !== 0 && dy !== 0) {
            dx *= 0.7071;
            dy *= 0.7071;
        }

        // Aplica o movimento multiplicando pela velocidade modificável
        this.x += dx * this.speed;
        this.y += dy * this.speed;

        if (this.y < limiteCima) this.y = limiteCima;
        if (this.y > limiteBaixo - this.h) this.y = limiteBaixo - this.h;
        if (this.x < limiteEsq) this.x = limiteEsq;
        if (this.x > limiteDir - this.w) this.x = limiteDir - this.w;
    }

    // Adicione esta chamada dentro da função atualiza() do seu index.js
    atualizarMecanicas(deltaTime) {
        if (this.vidaAtual > 0 && this.vidaAtual < this.vidaMaxima) {
            // Adiciona vida de forma suave baseada no tempo decorrido do frame
            this.vidaAtual += this.regen * (deltaTime / 1000);
            
            // Impede a vida de ultrapassar o teto máximo
            if (this.vidaAtual > this.vidaMaxima) {
                this.vidaAtual = this.vidaMaxima;
            }
        }
    }

    receberDano(quantidade) {
        // Reduz o dano baseado na armadura comprada, mas garante que leve pelo menos 1 de dano
        let danoFinal = quantidade - this.armadura;
        if (danoFinal < 1) danoFinal = 1;

        this.vidaAtual -= danoFinal;
        if (this.vidaAtual < 0) this.vidaAtual = 0; // Evita bugs de vida negativa
    }

    colid(objeto) {
        let meuX = this.x + this.hitbox.x;
        let meuY = this.y + this.hitbox.y;

        // Se o inimigo também tiver uma estrutura de hitbox customizada
        let objX = objeto.hitbox ? objeto.x + objeto.hitbox.x : objeto.x;
        let objY = objeto.hitbox ? objeto.y + objeto.hitbox.y : objeto.y;
        let objW = objeto.hitbox ? objeto.hitbox.w : objeto.w;
        let objH = objeto.hitbox ? objeto.hitbox.h : objeto.h;

        return (meuX < objX + objW &&
                meuX + this.hitbox.w > objX &&
                meuY < objY + objH &&
                meuY + this.hitbox.h > objY);
    }

    desenharBarraVida(contexto) {
        if (this.vidaAtual <= 0) return; // Se morreu, oculta a barra

        let larguraBarra = this.w * 0.6; // A barra oculpa 60% do tamanho do boneco
        let alturaBarra = 6;
        let barraX = this.x + (this.w - larguraBarra) / 2; // Centraliza perfeitamente
        let barraY = this.y - 14; // Renderiza acima do chapéu do grão de café

        // 1. Fundo da barra baleado (Preto)
        contexto.fillStyle = "#1e1e1e";
        contexto.fillRect(barraX, barraY, larguraBarra, alturaBarra);

        // 2. Proporção do preenchimento
        let proporcao = this.vidaAtual / this.vidaMaxima;
        let larguraVida = larguraBarra * proporcao;

        // 3. Cor dinâmica baseada no estado de saúde do grão
        if (proporcao > 0.5) {
            contexto.fillStyle = "#2ecc71"; // Verde Saudável
        } else if (proporcao > 0.2) {
            contexto.fillStyle = "#f1c40f"; // Amarelo Alerta
        } else {
            contexto.fillStyle = "#e74c3c"; // Vermelho Crítico
        }

        // 4. Pinta a vida atual e a borda preta fina
        contexto.fillRect(barraX, barraY, larguraVida, alturaBarra);
        contexto.strokeStyle = "#000000";
        contexto.lineWidth = 1;
        contexto.strokeRect(barraX, barraY, larguraBarra, alturaBarra);
    }
    
    desenharHitbox(contexto) {
        contexto.strokeStyle = "lime"; // Cor verde para destacar bem
        contexto.lineWidth = 2;        // Espessura da linha
        
        // Desenha o retângulo usando a posição atual do player + o deslocamento da hitbox
        contexto.strokeRect(
            this.x + this.hitbox.x, 
            this.y + this.hitbox.y, 
            this.hitbox.w, 
            this.hitbox.h
        );
    }
};



