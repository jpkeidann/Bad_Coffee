const catalogoGlobal = [
    // --- ARMAS ---
    { id: 'p320', name: 'Pistola P320', type: 'weapon', maxLevel: 5, cooldown: 1000, damage: 15, projectileSpeed: 400, projectileType: 'bullet', shootBehavior: 'sequence', projectileCount: 1, imgSrc: "../img/armas/P320.png" },
    { id: 'mp5', name: 'Metralhadora MP5', type: 'weapon', maxLevel: 5, cooldown: 700, damage: 5, projectileSpeed: 700, projectileType: 'bullet', shootBehavior: 'sequence', projectileCount: 3, imgSrc: "../img/armas/mp5.png" },
    { id: 'ks_23', name: 'Escopeta KS-23', type: 'weapon', maxLevel: 5, cooldown: 1500, damage: 30, projectileSpeed: 250, projectileType: 'pellet', shootBehavior: 'cone', projectileCount: 3, imgSrc: "../img/armas/kS-23.png" },
    { id: 'lightsaber', name: 'Sabre de luz', type: 'weapon', maxLevel: 5, cooldown: 3000, damage: 40, projectileSpeed: 150, projectileType: 'force', shootBehavior: 'slash', projectileCount: 1, imgSrc: "../img/armas/Lightsaber.png" },
    { id: 'gjallahorn', name: 'Gjallahorn', type: 'weapon', maxLevel: 5, cooldown: 5000, damage: 60, projectileSpeed: 350, projectileType: 'big_boom', shootBehavior: 'sequence', projectileCount: 1, imgSrc: "../img/armas/gjhallahorn.png" },
    { id: 'dagger', name: 'Adaga', type: 'weapon', maxLevel: 5, cooldown: 950, damage: 7, projectileSpeed: 350, projectileType: 'spin', shootBehavior: 'orbit', projectileCount: 1, imgSrc: "../img/armas/dagger.png" },
    
    // --- ITENS (ACESSÓRIOS) ---
    { id: 'seringa', name: 'Adrenalina', type: 'passive', maxLevel: 5, description: 'O café fica mais rápido.', imgSrc: "../img/itens/seringa.png" },
    { id: 'armadura', name: 'Armadura', type: 'passive', maxLevel: 5, description: 'Faz o café ficar mais resistente.', imgSrc: "../img/itens/armadura.png" },
    { id: 'leite', name: 'Leite', type: 'passive', maxLevel: 5, description: 'Faz o café ter um regen maior.', imgSrc: "../img/itens/leite.png" },
    { id: 'casca', name: 'Casca de Café', type: 'passive', maxLevel: 5, description: 'Faz o café ter mais vida.', imgSrc: "../img/itens/casca.png" }
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

        // Usamos "while" em vez de "if" para o caso de o jogador ganhar muito XP de uma vez só
        if (this.currentXp >= this.xpNeeded) {
            this.currentXp -= this.xpNeeded;
            this.level++;

            // MATEMÁTICA PROGRESSIVA (Estilo Vampire Survivors):
            // Nível 1 precisa de 20 XP. Nível 2 precisará de 50 XP. Nível 3 precisará de 65 XP...
            this.xpNeeded = Math.floor(20 + (this.level * 15));

            console.log(`Subiu para o Nível ${this.level}! Próxima meta: ${this.xpNeeded} XP`);

            // Mantém o retorno original para abrir o menu de escolhas do Abel
            return {
                leveledUp: true,
                choices: this.generateChoices()
            };
        }
        return { leveledUp: false, choices: [] };
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

                let targetEnemy = null;
                if (['sequence', 'cone', 'slash', 'orbit'].includes(weapon.shootBehavior)) {
                    targetEnemy = this.findClosestEnemy(playerPos, enemiesList);
                }

                weaponsThatFired.push({
                    id: weapon.id,
                    projectileType: weapon.projectileType,
                    projectileSpeed: weapon.projectileSpeed,
                    damage: finalDamage,
                    isCritical: isCrit, // Sinaliza para o index.js desenhar o tiro de forma diferente se quiser
                    target: targetEnemy
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

// Quando for rodar no navegador usando tag <script>, não precisamos do module.exports. 
// Mas se o João precisar puxar isso no Node ou Bundler:
if (typeof module !== 'undefined') {
    module.exports = { GameSystem, catalogoGlobal };
}
