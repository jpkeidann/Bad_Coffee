const catalogoGlobal = [
    // --- ARMAS ---
    { id: 'p320', name: 'Pistola P320', type: 'weapon', maxLevel: 5, cooldown: 1000, damage: 15, projectileSpeed: 400, projectileType: 'bullet', shootBehavior: 'sequence', projectileCount: 1, imgSrc: "../Img/armas/p320.png", bulletImgSrc: "../Img/bala.png", effectW: 96, effectH: 54},
    { id: 'mp5', name: 'Metralhadora MP5', type: 'weapon', maxLevel: 5, cooldown: 700, damage: 5, projectileSpeed: 700, projectileType: 'bullet', shootBehavior: 'sequence', projectileCount: 3, imgSrc: "../Img/armas/mp5.png", bulletImgSrc: "../Img/bala.png", effectW: 32, effectH: 15 },
    { id: 'ks_23', name: 'Escopeta KS-23', type: 'weapon', maxLevel: 5, cooldown: 1500, damage: 30, projectileSpeed: 250, projectileType: 'pellet', shootBehavior: 'cone', projectileCount: 3, imgSrc: "../Img/armas/KS-23.png", bulletImgSrc: "../Img/bala.png", effectW: 44, effectH: 11 },

    // Sabre de luz e Adaga com hideEffect: true para não piscarem na mão
    {
        id: 'lightsaber', name: 'Sabre de luz', type: 'weapon', maxLevel: 5, cooldown: 3000, damage: 40, projectileSpeed: 150, projectileType: 'force', shootBehavior: 'boomerang', projectileCount: 1, imgSrc: "../Img/armas/lightsaber.png", bulletImgSrc: "../Img/armas/lightsaber.png", hideEffect: true,
        throwRange: 250,  // Distância máxima que o sabre viaja para longe de você
        throwTime: 1200,  // Tempo total (em milissegundos) que ele leva para ir e voltar
        spinSpeed: 20     // Velocidade do giro da lâmina
    },
    {
        id: 'dagger', name: 'Adaga', type: 'weapon', maxLevel: 5, cooldown: 3100, damage: 7, projectileSpeed: 350, projectileType: 'spin', shootBehavior: 'orbit', projectileCount: 1, imgSrc: "../Img/armas/adaga.png", bulletImgSrc: "../Img/armas/adaga.png", hideEffect: true,
        orbitRadius: 110, spinSpeed: 2, orbitDuration: 3100
    },
    { id: 'gjallahorn', name: 'Gjallahorn', type: 'weapon', maxLevel: 5, cooldown: 5000, damage: 60, projectileSpeed: 350, projectileType: 'big_boom', shootBehavior: 'sequence', projectileCount: 1, imgSrc: "../Img/armas/gjahllahorn.png", bulletImgSrc: "../Img/tiroGjahllahorn.png", effectW: 53, effectH: 19 },

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
        this.baseRegen = 1; // Alterado para 0              
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
                        existing.cooldown -= 60;
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
        return shuffled.slice(0, 3);
    }

    // AGORA RECEBE UM ARRAY DE JOGADORES ATIVOS
    updateWeapons(deltaTime, jogadoresAtivos, enemiesList) {
        let weaponsThatFired = [];

        this.weapons.forEach(weapon => {
            weapon.timer += deltaTime;

            if (weapon.timer >= weapon.cooldown) {
                let alguemAtirou = false; // Só reseta o tempo se pelo menos um atirar

                // Faz o cálculo para cada jogador vivo na tela
                jogadoresAtivos.forEach(atirador => {
                    let isCrit = Math.random() < this.critChance;
                    let finalDamage = weapon.damage;
                    if (isCrit) finalDamage = Math.floor(finalDamage * this.critMultiplier);

                    let targetEnemy = null;

                    // O tiro busca o inimigo mais perto de QUEM está a atirar
                    if (['sequence', 'cone', 'boomerang'].includes(weapon.shootBehavior)) {
                        targetEnemy = this.findClosestEnemy(atirador, enemiesList);
                    }

                    if (targetEnemy || weapon.shootBehavior === 'orbit') {
                        alguemAtirou = true;
                        weaponsThatFired.push({
                            atirador: atirador, // Guarda de quem o tiro saiu!
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
        else if (id === 'armadura') this.baseArmor += 4;
        else if (id === 'leite') this.baseRegen += 1;
        else if (id === 'casca') this.baseMaxHealth += 25;

        // Aplica os buffs aos dois jogadores, se eles existirem
        let listaJogadores = [];
        if (typeof player !== 'undefined') listaJogadores.push(player);
        if (typeof jogador2 !== 'undefined') listaJogadores.push(jogador2);

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
