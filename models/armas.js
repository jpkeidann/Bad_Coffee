// armas.js
class GameSystem {


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

    updateWeapons(deltaTime) {
        let weaponsThatFired = [];

        this.weapons.forEach(weapon => {
            weapon.timer += deltaTime;

            if (weapon.timer >= weapon.cooldown) {
                weapon.timer = 0;

                // CALCULANDO O DANO FINAL: Multiplica o dano da arma pelo dano base do jogador
                const finalDamage = weapon.damage * this.baseDamageMultiplier;

                // Enviamos para a engine um objeto pronto com tudo o que ela precisa para criar o tiro
                weaponsThatFired.push({
                    id: weapon.id,
                    projectileType: weapon.projectileType,
                    projectileSpeed: weapon.projectileSpeed,
                    damage: finalDamage
                });
            }
        });

        return weaponsThatFired;
    }

    // Aplica a escolha feita na interface
    applyChoice(chosenItem) {
        const inventory = chosenItem.type === 'weapon' ? this.weapons : this.items;
        const existing = inventory.find(i => i.id === chosenItem.id);

        if (existing) {
            existing.level++;

            // Exemplo de como cada arma pode evoluir de forma diferente ao subir de nível
            if (existing.id === 'p320') {
                existing.damage += 5;        // P320 ganha +5 de dano por nível
                existing.cooldown -= 50;     // Atira um pouco mais rápido
            } else if (existing.id === 'shotgun') {
                existing.damage += 12;       // Escopeta ganha muito mais dano
            }
        } else {
            // Se for uma arma nova, copia todas as propriedades únicas vindas do catálogo (globalPool)
            const newItem = { ...chosenItem, level: 1, timer: 0 };
            inventory.push(newItem);
        }
    }
}