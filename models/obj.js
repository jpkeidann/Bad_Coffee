class Obj {
    constructor(x, y, w, h, a) {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.a = a
        this.img = new Image()
        this.img.src = a

        this.hitbox = {
            x: 0,
            y: 0,
            w: w,
            h: h
        }
    }
    gameConfig() {
        // Atributos base do jogador (O desenvolvedor de itens pode alterar isso através dos itens dele)
        this.baseDamageMultiplier = 1.0; // 1.0 significa 100% do dano da arma. Se virar 1.2, dá 20% a mais de dano.
        // Sistema de XP estilo Vampire Survivors
        level = 1;
        currentXp = 0;
        xpNeeded = 100; // XP necessário para o próximo nível

        // Inventários separados
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
                projectileType: 'bullet' // Tipo/Visual do projétil
            },
            {
                id: 'mp5',
                name: 'Metralhadora  MP5',
                type: 'weapon',
                level: 1,
                maxLevel: 5,
                cooldown: 700,       // 1 tiro por segundo (1000ms)            // Cronômetro interno
                damage: 5,           // Dano próprio da arma
                projectileSpeed: 700, // Velocidade física da bala na tela
                projectileType: 'bullet' // Tipo/Visual do projétil
            }, {
                id: 'ks_23',
                name: 'Escopeta KS-23',
                type: 'weapon',
                maxLevel: 5,
                cooldown: 1500,         // Bem lenta (1 tiro a cada 2 segundos)
                damage: 30,             // Muito dano
                projectileSpeed: 250,   // Projétil mais pesado e lento
                projectileType: 'buckshot'
            },{
                id: 'lightsaber',
                name: 'sabre de luz',
                type: 'weapon',
                maxLevel: 5,
                cooldown: 2000,         // Bem lenta (1 tiro a cada 2 segundos)
                damage: 40,             // Muito dano
                projectileSpeed: 150,   // Projétil mais pesado e lento
                projectileType: 'force'
            },{
                id: 'gjallahorn',
                name: 'Gjallahorn',
                type: 'weapon',
                maxLevel: 5,
                cooldown: 5000,         // Bem lenta (1 tiro a cada 2 segundos)
                damage: 60,             // Muito dano
                projectileSpeed: 350,   // Projétil mais pesado e lento
                projectileType: 'big_boom'
            },{
                id: 'lance',
                name: 'lanca',
                type: 'weapon',
                maxLevel: 5,
                cooldown: 1550,         // Bem lenta (1 tiro a cada 2 segundos)
                damage: 7,             // Muito dano
                projectileSpeed: 350,   // Projétil mais pesado e lento
                projectileType: 'spear'
            },{
                id: 'dagger',
                name: 'adaga',
                type: 'weapon',
                maxLevel: 5,
                cooldown: 950,         // Bem lenta (1 tiro a cada 2 segundos)
                damage: 7,             // Muito dano
                projectileSpeed: 350,   // Projétil mais pesado e lento
                projectileType: 'spin'
            }
        ];
        items = [];

        // Limites de inventário
        maxWeaponSlots = 3;
        maxItemSlots = 2; // Deixei pronto para o desenvolvedor de itens usar
    }
}

module.exports = Obj