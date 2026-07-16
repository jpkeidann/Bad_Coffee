// - effectW / effectH: tamanho do sprite da arma exibido na mão ao atirar
// - projectileW / projectileH: tamanho do projétil/bala desenhado na tela
const tamanhoIconeEscolha = 45; // Tamanho (px) do ícone na tela de escolha de armas (menu de level up)

const catalogoGlobal = [
    // --- ARMAS ---
    { id: 'p320', name: 'Pistola P320', type: 'weapon', maxLevel: 5, cooldown: 1250, damage: 12, projectileSpeed: 400, projectileType: 'bullet', shootBehavior: 'sequence', projectileCount: 1, imgSrc: "../Img/armas/p320.png", bulletImgSrc: "../Img/bala.png", effectW: 32, effectH: 18, projectileW: 24, projectileH: 24, somDisparo: "../sound/p320 shot.mp3" },
    { id: 'mp5', name: 'Metralhadora MP5', type: 'weapon', maxLevel: 5, cooldown: 900, damage: 3, projectileSpeed: 600, projectileType: 'bullet', shootBehavior: 'sequence', projectileCount: 3, imgSrc: "../Img/armas/mp5.png", bulletImgSrc: "../Img/bala.png", effectW: 51, effectH: 24, projectileW: 36, projectileH: 36, somDisparo: "../sound/mp5 shot.mp3" },
    { id: 'ks_23', name: 'Escopeta KS-23', type: 'weapon', maxLevel: 5, cooldown: 1750, damage: 8, projectileSpeed:2000, projectileType: 'pellet', shootBehavior: 'cone', projectileCount: 3, imgSrc: "../Img/armas/KS-23.png", bulletImgSrc: "../Img/bala.png", effectW: 66, effectH: 17, projectileW: 48, projectileH: 36, somDisparo: "../sound/ks shot.mp3" },

    // Sabre de luz e Adaga com hideEffect: true para não piscarem na mão
    {
        id: 'lightsaber', name: 'Sabre de luz', type: 'weapon', maxLevel: 5, cooldown: 3000, damage: 20, projectileSpeed: 150, projectileType: 'force', shootBehavior: 'boomerang', projectileCount: 1, imgSrc: "../Img/armas/lightsaber.png", bulletImgSrc: "../Img/armas/lightsaber.png", hideEffect: true,
        throwRange: 500,  // Distância máxima que o sabre viaja para longe de você
        throwTime: 1200,  // Tempo total (em milissegundos) que ele leva para ir e voltar
        spinSpeed: 20,    // Velocidade do giro da lâmina
        projectileW: 120, projectileH: 14,
        somDisparo: "../sound/lightsaber.mp3"
    },
    {
        id: 'dagger', name: 'Adaga', type: 'weapon', maxLevel: 5, cooldown: 3100, damage: 3, projectileSpeed: 350, projectileType: 'spin', shootBehavior: 'orbit', projectileCount: 1, imgSrc: "../Img/armas/adaga.png", bulletImgSrc: "../Img/armas/adaga.png", hideEffect: true,
        orbitRadius: 150, spinSpeed: 2, orbitDuration: 3100,
        projectileW: 87, projectileH: 51
    },
    {
        id: 'gjallahorn', name: 'Gjallahorn', type: 'weapon', maxLevel: 5, cooldown: 7000, damage: 50, projectileSpeed: 400, projectileType: 'big_boom', shootBehavior: 'sequence', projectileCount: 1, imgSrc: "../Img/armas/gjahllahorn.png", bulletImgSrc: "../Img/tiroGjahllahorn.png", effectW: 106, effectH: 38, projectileW: 100, projectileH: 40,
        somDisparo: "../sound/gjalahorn fire.mp3",
        somMidair: "../sound/gjalahorn midair.mp3",
        somExplosao: "../sound/gjalahorn kaboom.mp3"
    },

    // --- ITENS (ACESSÓRIOS) Continuam iguais ---
    { id: 'seringa', name: 'Adrenalina', type: 'passive', maxLevel: 5, description: 'O café fica mais rápido.', imgSrc: "../Img/seringa.png" },
    { id: 'armadura', name: 'Armadura', type: 'passive', maxLevel: 5, description: 'Faz o café ficar mais resistente.', imgSrc: "../Img/armadura.png" },
    { id: 'leite', name: 'Leite', type: 'passive', maxLevel: 5, description: 'Faz o café ter um regen maior.', imgSrc: "../Img/milk.png" },
    { id: 'casca', name: 'Casca de Café', type: 'passive', maxLevel: 5, description: 'Faz o café ter mais vida.', imgSrc: "../Img/casca.png" }
];

class GameSystem {
    constructor() {
        // --- ATRIBUTOS GLOBAIS DE SOBREVIVÊNCIA DO CAFÉ ---
        this.baseMaxHealth = 100;
        this.baseArmor = 0;
        this.baseRegen = 1;             
        this.baseMoveSpeedMultiplier = 1.0;

        // -- SISTEMA DE DANO CRÍTICO ---
        this.critChance = 0.05;      // 5% de chance de dar crítico
        this.critMultiplier = 1.5;   // Multiplicador de dano , Crítico dá 150% do dano

        // Sistema de Progressão
        this.level = 1;
        this.currentXp = 0;
        this.xpNeeded = 20;

        // O jogador começa com a P320
        this.weapons = [{ ...catalogoGlobal.find(item => item.id === 'p320'), level: 1, timer: 0 }];
        this.items = [];

        // Limites de inventário
        this.maxWeaponSlots = 3;
        this.maxItemSlots = 2;
    }

    gainXp(amount) {
        this.currentXp += amount;

        if (this.currentXp >= this.xpNeeded) {
            this.currentXp -= this.xpNeeded;
            this.level++;

            this.xpNeeded = Math.floor(20 + (this.level * 15));

            console.log(`Subiu para o Nível ${this.level}!`);

            // Ativa o estado de Menu no jogo passando as duas opções sorteadas
            window.ativarMenuLevelUp(this.generateChoices());
        }
    }

    // Função que gerencia o inventário ao clicar em uma carta
    buyItem(chosenItem) {
        let isWeapon = chosenItem.type === 'weapon';
        let targetArray = isWeapon ? this.weapons : this.items;
        let maxSlots = isWeapon ? this.maxWeaponSlots : this.maxItemSlots;

        // Verifica se o item já existe no inventário
        let existing = targetArray.find(item => item.id === chosenItem.id);

        if (existing) {
            if (existing.level < existing.maxLevel) {
                existing.level++;

                // === AQUI ACONTECE A MAGIA DO UPGRADE! ===
                if (chosenItem.type === 'weapon') {
                    if (existing.id === 'p320') {
                        existing.damage += 5;
                        existing.cooldown -= 50;
                    } else if (existing.id === 'ks_23') {
                        existing.damage += 12;
                    } else if (existing.id === 'mp5') {
                        existing.damage += 1;
                        existing.cooldown -= 25;
                    } else if (existing.id === 'lightsaber') {
                        existing.damage += 15;
                        existing.cooldown -= 75;
                        existing.projectileSpeed += 100;
                    } else if (existing.id === 'gjallahorn') {
                        existing.damage += 20;
                        existing.cooldown -= 125;
                        existing.projectileSpeed += 150;
                    } else if (existing.id === 'dagger') {
                        // Upgrade da Adaga!
                        existing.damage += 7;
                        existing.projectileSpeed += 150;
                        existing.projectileCount = (existing.projectileCount || 1) + 1; // +1 Adaga!
                        existing.spinSpeed = (existing.spinSpeed || 4) + 1.5; // Gira mais rápido!
                    }
                } else if (chosenItem.type === 'passive') {
                    this.executePassiveBuff(existing.id);
                }
                // ==========================================

                return true; // Sucesso
            }
            return false; // Nível Máximo alcançado
        }

        // Se não existe, tenta adicionar num slot vazio
        if (targetArray.length < maxSlots) {
            let clonedItem = { ...chosenItem, level: 1, timer: 0 };
            targetArray.push(clonedItem);

            if (!isWeapon) {
                this.executePassiveBuff(clonedItem.id);
            }
            return true;
        }

        return false; // Sem espaço no inventário
    }
    generateChoices() {
        const availableChoices = catalogoGlobal.filter(poolItem => {
            const alreadyHas = this.weapons.find(w => w.id === poolItem.id) || this.items.find(i => i.id === poolItem.id);

            if (alreadyHas) {
                return alreadyHas.level < poolItem.maxLevel;
            } else {
                if (poolItem.type === 'weapon' && this.weapons.length >= this.maxWeaponSlots) return false;
                if (poolItem.type === 'passive' && this.items.length >= this.maxItemSlots) return false;
                return true;
            }
        });

        const shuffled = [...availableChoices].sort(() => 0.5 - Math.random());
        const sorteados = shuffled.slice(0, 3);

        // Rótulos amigáveis dos atributos de arma que podem aparecer no comparativo
        const rotulosArma = {
            damage: 'Dano',
            cooldown: 'Cooldown (ms)',
            projectileSpeed: 'Velocidade do Projétil',
            projectileCount: 'Qtd. de Projéteis',
            spinSpeed: 'Velocidade de Giro'
        };

        // Espelha ESTRITAMENTE os deltas de upgrade aplicados dentro de buyItem() para cada arma
        const upgradesArma = {
            p320: { damage: 5, cooldown: -50 },
            ks_23: { damage: 12 },
            mp5: { damage: 1, cooldown: -25 },
            lightsaber: { damage: 15, cooldown: -75, projectileSpeed: 100 },
            gjallahorn: { damage: 20, cooldown: -125, projectileSpeed: 150 },
            dagger: { damage: 7, projectileSpeed: 150, projectileCount: 1, spinSpeed: 1.5 }
        };

        // Espelha ESTRITAMENTE os efeitos aplicados dentro de executePassiveBuff() para cada item passivo
        const buffsPassivo = {
            seringa: { atributo: 'baseMoveSpeedMultiplier', label: 'Velocidade', delta: 0.05 },
            armadura: { atributo: 'baseArmor', label: 'Armadura', delta: 10 },
            leite: { atributo: 'baseRegen', label: 'Regeneração', delta: 2 },
            casca: { atributo: 'baseMaxHealth', label: 'Vida Máxima', delta: 25 }
        };

        // Monta o objeto "comparativo" de cada carta sorteada, pronto para a tela de escolha exibir
        return sorteados.map(item => {
            let comparativo;

            if (item.type === 'weapon') {
                const existente = this.weapons.find(w => w.id === item.id);

                if (!existente) {
                    // Primeira vez adquirindo: mostra os atributos base do catalogoGlobal
                    const atributos = Object.keys(rotulosArma)
                        .filter(chave => item[chave] !== undefined)
                        .map(chave => ({ label: rotulosArma[chave], valor: item[chave] }));

                    comparativo = { tipo: 'novaArma', atributos };
                } else {
                    // Upgrade de arma existente: mostra só as diferenças, iguais às de buyItem()
                    const deltas = upgradesArma[item.id] || {};
                    const mudancas = Object.keys(deltas).map(chave => ({
                        label: rotulosArma[chave] || chave,
                        delta: deltas[chave]
                    }));

                    comparativo = { tipo: 'upgradeArma', nivelAtual: existente.level, mudancas };
                }
            } else if (item.type === 'passive') {
                const buff = buffsPassivo[item.id];
                const antes = buff ? this[buff.atributo] : undefined;
                const depois = buff ? antes + buff.delta : undefined;

                comparativo = { tipo: 'passivo', label: buff ? buff.label : item.name, antes, depois };
            }

            return { ...item, comparativo };
        });
    }

    updateWeapons(deltaTime, jogadoresAtivos, enemiesList) {
        let weaponsThatFired = [];

        this.weapons.forEach(weapon => {
            weapon.timer += deltaTime; // Conta o tempo da arma UMA ÚNICA VEZ

            if (weapon.timer >= weapon.cooldown) {
                let alguemAtirou = false;

                // Usa a SUA variável original que veio do index.js
                jogadoresAtivos.forEach(atirador => {
                    let isCrit = Math.random() < this.critChance;
                    let finalDamage = weapon.damage;
                    if (isCrit) finalDamage = Math.floor(finalDamage * this.critMultiplier);

                    let targetEnemy = null;

                    if (['sequence', 'cone', 'boomerang'].includes(weapon.shootBehavior)) {
                        targetEnemy = this.findClosestEnemy(atirador, enemiesList);
                    }

                    if (targetEnemy || weapon.shootBehavior === 'orbit') {
                        alguemAtirou = true;
                        weaponsThatFired.push({
                            atirador: atirador,
                            id: weapon.id,
                            projectileType: weapon.projectileType,
                            projectileSpeed: weapon.projectileSpeed,
                            damage: finalDamage,
                            isCritical: isCrit,
                            target: targetEnemy,
                            shootBehavior: weapon.shootBehavior,
                            bulletImgSrc: weapon.bulletImgSrc,
                            projectileCount: weapon.projectileCount,
                            spinSpeed: weapon.spinSpeed
                        });
                    }
                });

                if (alguemAtirou) {
                    weapon.timer = 0;
                }
            }
        });

        return weaponsThatFired;
    }

    findClosestEnemy(playerPos, enemiesList) {
        if (!enemiesList || enemiesList.length === 0) return null;

        let closestEnemy = null;
        let shortestDistance = Infinity;

        enemiesList.forEach(enemy => {
            let dx = enemy.x - playerPos.x;
            let dy = enemy.y - playerPos.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < shortestDistance) {
                shortestDistance = distance;
                closestEnemy = enemy;
            }
        });

        return closestEnemy;
    }


    executePassiveBuff(id) {
        if (id === 'seringa') this.baseMoveSpeedMultiplier += 0.05;
        else if (id === 'armadura') this.baseArmor += 10; 
        else if (id === 'leite') this.baseRegen += 2; 
        else if (id === 'casca') this.baseMaxHealth += 25; 

        // Aplica os buffs aos dois jogadores, se eles existirem
        let listaJogadores = [];
        if (typeof player !== 'undefined') listaJogadores.push(player);
        if (typeof player2 !== 'undefined') listaJogadores.push(player2);

        listaJogadores.forEach(p => {
            p.speed = 6 * this.baseMoveSpeedMultiplier;
            p.armadura = this.baseArmor;
            p.regen = this.baseRegen;

            let diferencaVida = this.baseMaxHealth - p.vidaMaxima;
            p.vidaMaxima = this.baseMaxHealth;
            if (diferencaVida > 0) p.vidaAtual += diferencaVida;
        });
    }
}


