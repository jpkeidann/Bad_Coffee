const CONFIG_INIMIGOS = {
    ACARO:   { nome: "Ácaro-Vermelho", imagem: "spr_acaro", vida: 10, dano: 2, vel: 4.0, knockback: 1.5, w: 16, h: 16, xp: 5 },
    BROCA:   { nome: "Broca-do-Café",  imagem: "spr_broca",  vida: 45, dano: 8, vel: 1.5, knockback: 0.2, w: 32, h: 32, xp: 15 },
    MINEIRO: { nome: "Bicho-Mineiro",  imagem: "spr_mineiro",vida: 25, dano: 3, vel: 2.0, knockback: 1.0, w: 28, h: 28, xp: 20 },
    LARVA:   { nome: "Larva Mineira",  imagem: "spr_larva",  vida: 5,  dano: 4, vel: 2.5, knockback: 2.0, w: 12, h: 12, xp: 2 },
    BOSS:    { nome: "Rainha Cigarra", imagem: "spr_boss",   vida: 1500,dano:20, vel: 1.0, knockback: 0.0, w:128, h:128, xp: 500 }
};

class Inimigo{
    constructor() {
        this.ativo = false; // Começa desligado no estoque
    }

    //o Spawner vai chamar essa função para resetar o inimigo
    nascer(tipo, x, y) {
        this.nome = tipo.nome;
        this.imagem = tipo.imagem;
        this.vidaMax = tipo.vida;
        this.vidaAtual = tipo.vida;
        this.dano = tipo.dano;
        this.velocidade = tipo.vel;
        this.knockbackResist = tipo.knockback;
        this.w = tipo.w;
        this.h = tipo.h;
        this.xp_drop = tipo.xp;
        this.x = x;
        this.y = y;
        this.ativo = true;
        this.tempoUltimoAtaque = 0; // Para uso do Bicho-Mineiro/Boss
    }

    atualizar(jogador_x, JSON_y, tempoAtual, pool) {
        if (!this.ativo) return;

        // Movimentação super rápida (evita processamento desnecessário)
        let dx = jogador_x - this.x;
        let dy = JSON_y - this.y;
        
        // Teorema de Pitágoras rápido
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 1) {
            this.x += (dx / dist) * this.velocidade;
            this.y += (dy / dist) * this.velocidade;
        }

        // LÓGICA ESPECÍFICA POR NOME (Evitar criar subclasses)
        if (this.nome === "Bicho-Mineiro" && tempoAtual - this.tempoUltimoAtaque > 3000) {
            pool.spawnar(CONFIG_INIMIGOS.LARVA, this.x, this.y); // Cospe larva
            this.tempoUltimoAtaque = tempoAtual;
        }
    }

    tomarDano(quantidade, forcaKnockback) {
        if (!this.ativo) return;

        this.vidaAtual -= quantidade;
        this.x -= forcaKnockback * this.knockbackResist; // Recuo simplificado

        if (this.vidaAtual <= 0) {
            this.morrer();
        }
    }

    morrer() {
        this.ativo = false; // Desliga o inimigo (volta pro estoque)
        xp_jogador += this.xp_drop; // Dá o XP direto pro João computar
    }
}

class SistemaDeSpawnOtimizado {
    constructor(tamanhoMaximoPool = 300) {
        this.poolDeInimigos = [];
        this.intervaloSpawn = 1500; // 1.5 segundos
        this.tempoUltimoSpawn = 0;

        // PRE-ALOCAÇÃO: Cria todos os objetos vazios no início do jogo
        for (let i = 0; i < tamanhoMaximoPool; i++) {
            this.poolDeInimigos.push(new InimigoOtimizado());
        }
    }

    // Procura um inimigo que está "morto/inativo" no estoque e revive ele
    spawnar(tipoConfig, x, y) {
        let inimigoDisponivel = this.poolDeInimigos.find(inimigo => !inimigo.ativo);

        // Se achou um objeto livre no estoque, recicla ele
        if (inimigoDisponivel) {
            inimigoDisponivel.nascer(tipoConfig, x, y);
        } else {
            // Anti-crash: Se o pool lotar, avisa o João para aumentar o tamanhoMaximoPool
            console.warn("Pool de inimigos lotou! Aumente o tamanho máximo.");
        }
    }

    // Lógica de sorteio de bordas igual à anterior, mas sem dar "new"
    atualizarGerador(tempoAtual, jogador_x, jogador_y) {
        if (tempoAtual - this.tempoUltimoSpawn > this.intervaloSpawn) {
            let pos = this.sortearPosicaoNasBordas();
            
            let chance = Math.random();
            let tipoSelecionado = CONFIG_INIMIGOS.ACARO; // Padrão

            if (chance > 0.7 && chance <= 0.9) tipoSelecionado = CONFIG_INIMIGOS.BROCA;
            else if (chance > 0.9) tipoSelecionado = CONFIG_INIMIGOS.MINEIRO;

            this.spawnar(tipoSelecionado, pos.x, pos.y);
            this.tempoUltimoSpawn = tempoAtual;
        }

        // Atualiza apenas os inimigos que estão ativos na tela
        for (let i = 0; i < this.poolDeInimigos.length; i++) {
            if (this.poolDeInimigos[i].ativo) {
                this.poolDeInimigos[i].atualizar(jogador_x, jogador_y, tempoAtual, this);
            }
        }
    }
}