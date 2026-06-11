// armas.js

class GameSystem {

    constructor() {


        // --- NOVO: ATRIBUTOS GLOBAIS DE SOBREVIVÊNCIA DO CAFÉ ---
        this.baseMaxHealth = 100;          // Modificado pela CASCA (+Vida Máxima)
        this.baseArmor = 0;                // Modificado pela ARMADURA (+Resistência)
        this.baseRegen = 5;                // Modificado pelo LEITE (+Regeneração de Vida)
        this.baseMoveSpeedMultiplier = 1.0; // Caso queira usar a SERINGA para andar mais rápido também!

        // CORREÇÃO: Adicionado o 'this.' em todas as variáveis abaixo
        this.level = 1;
        this.currentXp = 0;
        this.xpNeeded = 100;

        this.weapons = [
            {
                id: 'p320',
                name: 'Pistola P320',
                type: 'weapon',
                level: 1,
                maxLevel: 5,
                cooldown: 1000,       // 1 tiro por segundo (1000ms)
                timer: 0,             // Cronômetro interno
                damage: 15,           // Dano próprio da arma
                projectileSpeed: 400, // Velocidade física da bala na tela
                projectileType: 'bullet', // Tipo/Visual do projétil
                shootBehavior: 'sequence',
                projectileCount: 1
            },
            {
                id: 'mp5',
                name: 'Metralhadora  MP5',
                type: 'weapon',
                level: 1,
                maxLevel: 5,
                cooldown: 700,
                damage: 5,
                projectileSpeed: 700,
                projectileType: 'bullet',
                shootBehavior: 'sequence',
                projectileCount: 3          // Dispara 1 projéteis de uma vez só
            }, {
                id: 'ks_23',
                name: 'Escopeta KS-23',
                type: 'weapon',
                maxLevel: 5,
                cooldown: 1500,
                damage: 30,
                projectileSpeed: 250,
                projectileType: 'pellet',
                shootBehavior: 'cone',      // Atira várias balas espalhadas em formato de cone
                projectileCount: 3          // Dispara 3 projéteis de uma vez só
            }, {
                id: 'lightsaber',
                name: 'sabre de luz',
                type: 'weapon',
                maxLevel: 5,
                cooldown: 3000,
                damage: 40,
                projectileSpeed: 150,
                projectileType: 'force',
                shootBehavior: 'slash',
                projectileCount: 1
            }, {
                id: 'gjallahorn',
                name: 'Gjallahorn',
                type: 'weapon',
                maxLevel: 5,
                cooldown: 5000,
                damage: 60,
                projectileSpeed: 350,
                projectileType: 'big_boom',
                shootBehavior: 'sequence',
                projectileCount: 1
            }, {
                id: 'dagger',
                name: 'adaga',
                type: 'weapon',
                maxLevel: 5,
                cooldown: 950,
                damage: 7,
                projectileSpeed: 350,
                projectileType: 'spin',
                shootBehavior: 'orbit',
                projectileCount: 1
            }
        ];
        this.items = [];

        // Limites de inventário
        this.maxWeaponSlots = 3;
        this.maxItemSlots = 2;
    }
    // Gerencia o ganho de XP e avanço de nível
    gainXp(amount, globalPool) {
        this.currentXp += amount;

        // Se passar de 100%, upa de nível
        if (this.currentXp >= this.xpNeeded) {
            this.currentXp -= this.xpNeeded; // Mantém a sobra do XP
            this.level++;
            this.xpNeeded = this.level * 100; // O próximo nível vai precisar de mais XP

            return {
                leveledUp: true,
                choices: this.generateChoices(globalPool)
            };
        }

        return { leveledUp: false, choices: [] };
    }

    // Gera as opções de escolha respeitando os limites de espaços do inventário
    generateChoices(globalPool) {
        const availableChoices = globalPool.filter(poolItem => {
            // Procura se o jogador já possui essa arma ou item
            const alreadyHas = this.weapons.find(w => w.id === poolItem.id) ||
                this.items.find(i => i.id === poolItem.id);

            if (alreadyHas) {
                // Se já tem, só oferece se não estiver no nível máximo
                return alreadyHas.level < poolItem.maxLevel;
            } else {
                // Se NÃO tem, verifica se ainda há espaço livre no inventário correspondente
                if (poolItem.type === 'weapon' && this.weapons.length >= this.maxWeaponSlots) {
                    return false; // Inventário de armas cheio! Não oferece armas novas.
                }
                if (poolItem.type === 'passive' && this.items.length >= this.maxItemSlots) {
                    return false; // Inventário de itens cheio! Não oferece itens novos.
                }
                return true;
            }
        });

        // Embaralha todas as opções válidas e pega 3 delas
        const shuffled = [...availableChoices].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3);
    }

    updateWeapons(deltaTime, playerPos, enemiesList) {
        let weaponsThatFired = [];

        this.weapons.forEach(weapon => {
            weapon.timer += deltaTime;


            if (weapon.timer >= weapon.cooldown) {
                weapon.timer = 0;



                let targetEnemy = null;
                if (['sequence', 'cone', 'slash', 'orbit'].includes(weapon.shootBehavior)) {
                    targetEnemy = this.findClosestEnemy(playerPos, enemiesList);
                }

                // let targetEnemy = null;

                // // Armas que precisam de mira (sequence e cone) buscam o alvo
                // if (weapon.shootBehavior === 'sequence' || weapon.shootBehavior === 'cone' || weapon.shootBehavior === 'slash'  || weapon.shootBehavior === 'espetar' || weapon.shootBehavior === 'orbit') {
                //     targetEnemy = this.findClosestEnemy(playerPos, enemiesList);
                // }

                // Enviamos para a engine um objeto pronto com tudo o que ela precisa para criar o tiro
                weaponsThatFired.push({
                    id: weapon.id,
                    projectileType: weapon.projectileType,
                    projectileSpeed: weapon.projectileSpeed,
                    damage: finalDamage,
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

    // Aplica a escolha feita na interface
    applyChoice(chosenItem) {
        const inventory = chosenItem.type === 'weapon' ? this.weapons : this.items;
        const existing = inventory.find(i => i.id === chosenItem.id);

        // Se o item NÃO existe no inventário, cria ele no nível 1
        if (!existing) {
            existing = { ...chosenItem, level: 1, timer: 0 };
            inventory.push(existing);

            if (chosenItem.type === 'passive') {
                this.executePassiveBuff(chosenItem.id);
            }
            return;
        }

        existing.level++;

        // Exemplo de como cada arma pode evoluir de forma diferente ao subir de nível
        if (chosenItem.type === 'weapon') {
            if (existing.id === 'p320') {
                existing.damage += 5;        // P320 ganha +5 de dano por nível
                existing.cooldown -= 50;     // Atira um pouco mais rápido
            } else if (existing.id === 'ks_23') {
                existing.damage += 12;       // Escopeta ganha muito mais dano
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

    // --- SEUS NOVOS ITENS TEMÁTICOS DE CAFÉ ---
    executePassiveBuff(id) {
        if (id === 'seringa') {
            this.baseMoveSpeedMultiplier += 0.05;   // Opcional: Dá +5% de velocidade de movimento ao boneco
        } else if (id === 'armadura') {
            this.baseArmor += 4;                    // +4 de Armadura (reduz dano fixo recebido)
        } else if (id === 'leite') {
            this.baseRegen += 1;                    // +1 de vida recuperada por segundo
        } else if (id === 'casca') {
            this.baseMaxHealth += 25;               // Aumenta a vida máxima do café em +25 pontos
        }
    }
}
