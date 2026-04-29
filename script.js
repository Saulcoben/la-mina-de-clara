// Estado del juego
let game = {
    gold: 0,
    gems: 0,
    goldPerClick: 1,
    goldPerSecond: 0,
    costs: {
        pickaxe: 10,
        miner: 50,
        drill: 500
    },
    owned: {
        pickaxe: 0,
        miner: 0,
        drill: 0
    }
};

// Configuración
const GEM_CHANCE = 0.05; // 5% chance

// Elementos del DOM
const goldDisplay = document.getElementById('gold-display');
const gemDisplay = document.getElementById('gem-display');
const gpsDisplay = document.getElementById('gps-display');
const mineTarget = document.getElementById('mine-target');
const miningArea = document.getElementById('mining-area');

const btnUpgradePickaxe = document.getElementById('upgrade-pickaxe');
const btnBuyMiner = document.getElementById('buy-miner');
const btnBuyDrill = document.getElementById('buy-drill');
const btnReset = document.getElementById('reset-btn');

const costPickaxeDisplay = document.getElementById('cost-pickaxe');
const costMinerDisplay = document.getElementById('cost-miner');
const costDrillDisplay = document.getElementById('cost-drill');

// Funciones de actualización de UI
function updateUI() {
    goldDisplay.textContent = Math.floor(game.gold);
    gemDisplay.textContent = game.gems;
    gpsDisplay.textContent = game.goldPerSecond;

    costPickaxeDisplay.textContent = game.costs.pickaxe;
    costMinerDisplay.textContent = game.costs.miner;
    costDrillDisplay.textContent = game.costs.drill;

    // Actualizar botones (habilitar/deshabilitar)
    btnUpgradePickaxe.disabled = game.gold < game.costs.pickaxe;
    btnBuyMiner.disabled = game.gold < game.costs.miner;
    btnBuyDrill.disabled = game.gold < game.costs.drill;
}

// Cargar y Guardar
function saveGame() {
    localStorage.setItem('minaDeClaraSave', JSON.stringify(game));
}

function loadGame() {
    const saved = localStorage.getItem('minaDeClaraSave');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            // Fusionar para asegurar que hay compatibilidad si añadimos nuevas propiedades
            game = { ...game, ...parsed };
        } catch (e) {
            console.error('Error loading save', e);
        }
    }
    updateUI();
}

// Lógica de Minado
function createFloatingText(x, y, text, type) {
    const el = document.createElement('div');
    el.classList.add('floating-text', type);
    el.textContent = text;
    
    // Posición relativa al área de minado
    const rect = miningArea.getBoundingClientRect();
    const xPos = x - rect.left - 20 + (Math.random() * 40 - 20); // algo de aleatoriedad
    const yPos = y - rect.top - 20;

    el.style.left = `${xPos}px`;
    el.style.top = `${yPos}px`;

    miningArea.appendChild(el);

    // Limpiar el DOM después de la animación
    setTimeout(() => {
        el.remove();
    }, 1000);
}

mineTarget.addEventListener('click', (e) => {
    // Sumar oro
    game.gold += game.goldPerClick;
    
    // Solo mostramos texto flotante si no es click simulado (para no sobrecargar)
    if(e.isTrusted) {
        createFloatingText(e.clientX, e.clientY, `+${game.goldPerClick}`, 'gold');
    } else {
        // Fallback for simulated clicks if needed, maybe to center of mine
        const rect = mineTarget.getBoundingClientRect();
        createFloatingText(rect.left + rect.width/2, rect.top + rect.height/2, `+${game.goldPerClick}`, 'gold');
    }

    // Chance de gema
    if (Math.random() < GEM_CHANCE) {
        game.gems += 1;
        if(e.isTrusted) {
            createFloatingText(e.clientX, e.clientY, '+1 💎', 'gem');
        } else {
            const rect = mineTarget.getBoundingClientRect();
            createFloatingText(rect.left + rect.width/2, rect.top + rect.height/2, '+1 💎', 'gem');
        }
    }

    updateUI();
});

// Compras
function buyItem(item, costMultiplier) {
    if (game.gold >= game.costs[item]) {
        game.gold -= game.costs[item];
        game.owned[item]++;
        
        // Aumentar costo (1.15x es estándar en incrementales)
        game.costs[item] = Math.ceil(game.costs[item] * costMultiplier);
        
        return true;
    }
    return false;
}

btnUpgradePickaxe.addEventListener('click', () => {
    if (buyItem('pickaxe', 1.5)) {
        game.goldPerClick += 1;
        updateUI();
    }
});

btnBuyMiner.addEventListener('click', () => {
    if (buyItem('miner', 1.15)) {
        game.goldPerSecond += 1;
        updateUI();
    }
});

btnBuyDrill.addEventListener('click', () => {
    if (buyItem('drill', 1.15)) {
        game.goldPerSecond += 10;
        updateUI();
    }
});

btnReset.addEventListener('click', () => {
    if(confirm('¿Estás seguro de que quieres borrar todo tu progreso? ¡Esto no se puede deshacer!')) {
        localStorage.removeItem('minaDeClaraSave');
        location.reload();
    }
});

// Game Loop (Ingresos pasivos)
setInterval(() => {
    if (game.goldPerSecond > 0) {
        // Añadir oro en incrementos más pequeños para UI fluida, pero calculando por segundo.
        game.gold += game.goldPerSecond / 10; 
        updateUI();
    }
}, 100);

// Auto-guardado cada 5 segundos
setInterval(() => {
    saveGame();
}, 5000);

// Iniciar
loadGame();
