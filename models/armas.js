const catalogoGlobal = [
    // --- ARMAS ---
    { id: 'p320', name: 'Pistola P320', type: 'weapon', maxLevel: 5, cooldown: 1000, damage: 15, projectileSpeed: 400, projectileType: 'bullet', shootBehavior: 'sequence', projectileCount: 1, imgSrc: "../img/armas/P320.png", bulletImgSrc: "../img/bala.png", effectW: 80, effectH: 40 },
    { id: 'mp5', name: 'Metralhadora MP5', type: 'weapon', maxLevel: 5, cooldown: 700, damage: 5, projectileSpeed: 700, projectileType: 'bullet', shootBehavior: 'sequence', projectileCount: 3, imgSrc: "../img/armas/mp5.png", bulletImgSrc: "../img/bala.png", effectW: 70, effectH: 35 },
    { id: 'ks_23', name: 'Escopeta KS-23', type: 'weapon', maxLevel: 5, cooldown: 1500, damage: 30, projectileSpeed: 250, projectileType: 'pellet', shootBehavior: 'cone', projectileCount: 3, imgSrc: "../img/armas/kS-23.png", bulletImgSrc: "../img/bala.png", effectW: 80, effectH: 30 },
    
    // Sabre de luz e Adaga com hideEffect: true para não piscarem na mão
    { id: 'lightsaber', name: 'Sabre de luz', type: 'weapon', maxLevel: 5, cooldown: 3000, damage: 40, projectileSpeed: 150, projectileType: 'force', shootBehavior: 'boomerang', projectileCount: 1, imgSrc: "../img/armas/lightsaber.png", bulletImgSrc: "../img/armas/lightsaber.png", hideEffect: true, 
      throwRange: 250,  // Distância máxima que o sabre viaja para longe de você
      throwTime: 1200,  // Tempo total (em milissegundos) que ele leva para ir e voltar
      spinSpeed: 20     // Velocidade do giro da lâmina
    },
{ id: 'dagger', name: 'Adaga', type: 'weapon', maxLevel: 5, cooldown: 1500, damage: 7, projectileSpeed: 350, projectileType: 'spin', shootBehavior: 'orbit', projectileCount: 1, imgSrc: "../img/armas/adaga.png", bulletImgSrc: "../img/armas/adaga.png", hideEffect: true, 
    orbitRadius: 90, spinSpeed: 4, orbitDuration: 3000 },
    { id: 'gjallahorn', name: 'Gjallahorn', type: 'weapon', maxLevel: 5, cooldown: 5000, damage: 60, projectileSpeed: 350, projectileType: 'big_boom', shootBehavior: 'sequence', projectileCount: 1, imgSrc: "../img/armas/gjhallahorn.png", bulletImgSrc: "../img/TiroGjahllahorn.png", effectW: 90, effectH: 45 },

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

        // --- NOVO: SISTEMA DE DANO CRÍTICO ---
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
                // Aplica a melhora real nos atributos da arma/item
              
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

    updateWeapons(deltaTime, playerPos, enemiesList) {
        let weaponsThatFired = [];

        this.weapons.forEach(weapon => {
            weapon.timer += deltaTime;

            if (weapon.timer >= weapon.cooldown) {
                weapon.timer = 0;

                // --- NOVO: CÁLCULO DE CRÍTICO ---
                let isCrit = Math.random() < this.critChance;
                let finalDamage = weapon.damage;
                if (isCrit) {
                    finalDamage = Math.floor(finalDamage * this.critMultiplier);
                }

if (weapon.timer >= weapon.cooldown) {
                let targetEnemy = null;
           
                // 1. O 'orbit' já não está nesta lista, por isso não procura inimigos!
                if (['sequence', 'cone', 'boomerang'].includes(weapon.shootBehavior)) {
                    targetEnemy = this.findClosestEnemy(playerPos, enemiesList);
                }

                // 2. A arma atira se tiver um inimigo alvo, OU se for a Adaga ('orbit')
                if (targetEnemy || weapon.shootBehavior === 'orbit') {
                    weapon.timer = 0;
                }}

                weaponsThatFired.push({
                    id: weapon.id,
                    projectileType: weapon.projectileType,
                    projectileSpeed: weapon.projectileSpeed,
                    damage: finalDamage,
                    isCritical: isCrit,
                    target: targetEnemy,
                    shootBehavior: weapon.shootBehavior,
                    bulletImgSrc: weapon.bulletImgSrc
                });
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

    applyChoice(chosenItem) {
        const inventory = chosenItem.type === 'weapon' ? this.weapons : this.items;
        const existing = inventory.find(i => i.id === chosenItem.id);

        if (!existing) {
            const newItem = { ...chosenItem, level: 1, timer: 0 };
            inventory.push(newItem);

            if (chosenItem.type === 'passive') {
                this.executePassiveBuff(chosenItem.id);
            }
            return;
        }

        existing.level++;

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
                existing.damage += 7;
                existing.cooldown -= 60;
                existing.projectileSpeed += 150;
            }
        } else if (chosenItem.type === 'passive') {
            this.executePassiveBuff(existing.id);
        }
    }

    executePassiveBuff(id) {
        if (id === 'seringa') {
            this.baseMoveSpeedMultiplier += 0.05;
        } else if (id === 'armadura') {
            this.baseArmor += 4;
        } else if (id === 'leite') {
            this.baseRegen += 1;
        } else if (id === 'casca') {
            this.baseMaxHealth += 25;
        }
    }
}
