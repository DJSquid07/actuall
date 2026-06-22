// Game State
const game = {
    money: 0,
    level: 1,
    xp: 0,
    xpNeeded: 5000,
    clickValue: 1,
    perSecond: 0,
    multiplier: 1,
    enemiesDefeated: 0,
    mathSolved: 0,
    totalDebt: 1000000,
    
    // Feature unlocks at levels
    unlockedFeatures: {
        battle: false,
        math: false
    },

    // Upgrades
    upgrades: [
        // Basic upgrades (available from start)
        {
            id: 'click-damage',
            name: '⚔️ Better Clicks',
            description: 'Increase click value by 1',
            cost: 50,
            baseCost: 50,
            income: 0,
            clickBonus: 1,
            count: 0,
            unlockedAtLevel: 1,
            category: 'click'
        },
        {
            id: 'coin-multiplier',
            name: '🎯 Multiplier Boost',
            description: 'Increase all earnings by 1.1x',
            cost: 100,
            baseCost: 100,
            income: 0,
            multiplierBonus: 0.1,
            count: 0,
            unlockedAtLevel: 2,
            category: 'multiplier'
        },
        {
            id: 'peasant-worker',
            name: '👨‍🌾 Peasant Worker',
            description: 'Generates 1 drachma per second',
            cost: 250,
            baseCost: 250,
            income: 1,
            count: 0,
            unlockedAtLevel: 3,
            category: 'generator'
        },
        {
            id: 'merchant',
            name: '🏪 Greek Merchant',
            description: 'Generates 5 drachma per second',
            cost: 1000,
            baseCost: 1000,
            income: 5,
            count: 0,
            unlockedAtLevel: 4,
            category: 'generator'
        },
        // Unlocked at Level 5
        {
            id: 'warrior',
            name: '⚔️ Trained Warrior',
            description: 'Generates 15 drachma per second + Unlocks Battle Arena',
            cost: 5000,
            baseCost: 5000,
            income: 15,
            count: 0,
            unlockedAtLevel: 5,
            category: 'generator'
        },
        {
            id: 'temple',
            name: '🏛️ Temple of Athena',
            description: 'Generates 50 drachma per second',
            cost: 15000,
            baseCost: 15000,
            income: 50,
            count: 0,
            unlockedAtLevel: 6,
            category: 'generator'
        },
        {
            id: 'scholar',
            name: '📚 Scholar Guild',
            description: 'Generates 100 drachma per second',
            cost: 50000,
            baseCost: 50000,
            income: 100,
            count: 0,
            unlockedAtLevel: 7,
            category: 'generator'
        },
        {
            id: 'forge',
            name: '⚒️ Bronze Forge',
            description: 'Generates 250 drachma per second',
            cost: 150000,
            baseCost: 150000,
            income: 250,
            count: 0,
            unlockedAtLevel: 8,
            category: 'generator'
        },
        {
            id: 'navy',
            name: '⛵ Trade Navy',
            description: 'Generates 500 drachma per second',
            cost: 500000,
            baseCost: 500000,
            income: 500,
            count: 0,
            unlockedAtLevel: 9,
            category: 'generator'
        },
        // Unlocked at Level 10
        {
            id: 'oracle',
            name: '🔮 Oracle\'s Wisdom',
            description: 'Generates 1000 drachma per second + Unlocks Math Challenges',
            cost: 1500000,
            baseCost: 1500000,
            income: 1000,
            count: 0,
            unlockedAtLevel: 10,
            category: 'generator'
        }
    ],

    // Battle system
    currentEnemy: null,
    battleActive: false,
    enemyList: [
        { name: 'Minotaur', hp: 100, reward: 1000 },
        { name: 'Medusa', hp: 150, reward: 2000 },
        { name: 'Hydra', hp: 200, reward: 3500 },
        { name: 'Cyclops', hp: 250, reward: 5000 },
        { name: 'Chimera', hp: 300, reward: 7500 }
    ],

    // Math questions
    mathQuestions: [
        { q: '12 + 8 = ?', a: 20, reward: 500 },
        { q: '15 * 3 = ?', a: 45, reward: 750 },
        { q: '100 / 4 = ?', a: 25, reward: 600 },
        { q: '7 * 8 + 4 = ?', a: 60, reward: 800 },
        { q: '144 / 12 = ?', a: 12, reward: 700 },
        { q: '25 + 75 - 50 = ?', a: 50, reward: 650 },
        { q: '9 * 9 = ?', a: 81, reward: 900 },
        { q: '200 / 5 = ?', a: 40, reward: 700 },
        { q: '13 * 6 = ?', a: 78, reward: 850 },
        { q: '50 - 32 + 15 = ?', a: 33, reward: 600 }
    ]
};

// Initialize game
function init() {
    setupUpgrades();
    generateNewEnemy();
    generateNewMath();
    updateUI();
    loadGame();
    
    // Auto-earn per second
    setInterval(autoEarn, 1000);
    
    // Update UI every 100ms
    setInterval(updateUI, 100);
}

// Click to earn money
function click() {
    const earnings = game.clickValue * game.multiplier;
    game.money += earnings;
    game.xp += Math.floor(earnings / 10);
    checkLevelUp();
    updateUI();
}

// Auto-earn passive income
function autoEarn() {
    const earnings = game.perSecond * game.multiplier;
    game.money += earnings;
    game.xp += Math.floor(earnings / 100);
    checkLevelUp();
    saveGame();
}

// Buy upgrade
function buyUpgrade(upgradeId) {
    const upgrade = game.upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;

    if (game.money >= upgrade.cost) {
        game.money -= upgrade.cost;
        upgrade.count++;

        // Apply bonuses
        if (upgrade.clickBonus) {
            game.clickValue += upgrade.clickBonus;
        }
        if (upgrade.multiplierBonus) {
            game.multiplier += upgrade.multiplierBonus;
        }
        if (upgrade.income) {
            game.perSecond += upgrade.income;
        }

        // Increase cost for next purchase
        upgrade.cost = Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.count));

        // Check for special unlocks
        if (upgrade.id === 'warrior' && upgrade.count === 1) {
            game.unlockedFeatures.battle = true;
            showUnlock('Battle Arena Unlocked!', [
                '⚔️ You\'ve unlocked the Battle Arena!',
                'Fight enemies to earn rewards.',
                'Each victory grants 💰 from defeated foes.',
                'Higher level enemies = bigger rewards!'
            ]);
        }

        if (upgrade.id === 'oracle' && upgrade.count === 1) {
            game.unlockedFeatures.math = true;
            showUnlock('Math Challenges Unlocked!', [
                '📚 You\'ve unlocked Math Challenges!',
                'Solve math problems for bonus rewards.',
                'Get the answer right to earn 💰',
                'Difficulty increases with your level!'
            ]);
        }

        showNotification('success', `Purchased: ${upgrade.name}`, `+${upgrade.count}`);
        game.xp += Math.floor(upgrade.cost / 100);
        checkLevelUp();
        updateUI();
        saveGame();
    } else {
        showNotification('error', 'Not enough money!', `Need ${upgrade.cost - game.money} more`);
    }
}

// Level up system
function checkLevelUp() {
    if (game.xp >= game.xpNeeded) {
        game.xp -= game.xpNeeded;
        game.level++;
        game.xpNeeded = Math.floor(game.xpNeeded * 1.2);
        
        showNotification('info', '🎉 LEVEL UP!', `You are now Level ${game.level}!`);
        
        // Check for new unlocks
        checkNewUnlocks();
        updateUI();
        saveGame();
    }
}

// Check for newly available upgrades
function checkNewUnlocks() {
    let newUpgrades = [];
    
    game.upgrades.forEach(upgrade => {
        if (upgrade.unlockedAtLevel <= game.level && !document.querySelector(`[data-upgrade-id="${upgrade.id}"]`)?.classList.contains('unlocked')) {
            newUpgrades.push(upgrade);
        }
    });

    if (newUpgrades.length > 0) {
        const names = newUpgrades.map(u => u.name).join(', ');
        showUnlock('New Upgrades Available!', [
            `You've unlocked: ${names}`,
            'Check the Upgrades section to purchase!'
        ]);
        updateUpgradesUI();
    }
}

// Battle system
function attack() {
    if (!game.currentEnemy || game.battleActive) return;

    game.battleActive = true;
    const damage = (game.clickValue * 2 + game.level) * game.multiplier;
    game.currentEnemy.hp -= damage;

    if (game.currentEnemy.hp <= 0) {
        // Victory!
        const reward = Math.floor(game.currentEnemy.reward * game.multiplier);
        game.money += reward;
        game.xp += Math.floor(reward / 50);
        game.enemiesDefeated++;
        
        showNotification('success', 'Victory!', `Earned ${reward} drachma!`);
        checkLevelUp();
        generateNewEnemy();
    } else {
        document.getElementById('battleMessage').textContent = `Hit for ${Math.floor(damage)} damage!`;
    }

    game.battleActive = false;
    updateUI();
    saveGame();
}

// Math challenge system
function solveMath() {
    const input = parseInt(document.getElementById('mathAnswer').value);
    const feedback = document.getElementById('mathFeedback');
    
    if (isNaN(input)) {
        feedback.textContent = 'Please enter a number!';
        feedback.style.color = '#FF6B6B';
        return;
    }

    if (input === game.currentMathQuestion.a) {
        const reward = Math.floor(game.currentMathQuestion.reward * game.multiplier);
        game.money += reward;
        game.xp += Math.floor(reward / 25);
        game.mathSolved++;
        
        feedback.textContent = `✓ Correct! +${reward} drachma!`;
        feedback.style.color = '#4CAF50';
        
        showNotification('success', 'Math Correct!', `+${reward} drachma`);
        checkLevelUp();
        
        setTimeout(() => {
            generateNewMath();
            document.getElementById('mathAnswer').value = '';
            feedback.textContent = '';
        }, 1000);
    } else {
        feedback.textContent = `✗ Wrong! The answer was ${game.currentMathQuestion.a}`;
        feedback.style.color = '#FF6B6B';
        
        setTimeout(() => {
            generateNewMath();
            document.getElementById('mathAnswer').value = '';
            feedback.textContent = '';
        }, 2000);
    }

    updateUI();
    saveGame();
}

// Generate new enemy
function generateNewEnemy() {
    const levelIndex = Math.min(Math.floor((game.level - 1) / 3), game.enemyList.length - 1);
    const baseEnemy = game.enemyList[levelIndex];
    
    game.currentEnemy = {
        name: baseEnemy.name,
        hp: Math.floor(baseEnemy.hp * (1 + game.level * 0.2)),
        maxHp: Math.floor(baseEnemy.hp * (1 + game.level * 0.2)),
        reward: Math.floor(baseEnemy.reward * (1 + game.level * 0.15))
    };
}

// Generate new math question
function generateNewMath() {
    const randomQuestion = game.mathQuestions[Math.floor(Math.random() * game.mathQuestions.length)];
    game.currentMathQuestion = { ...randomQuestion };
    document.getElementById('mathQuestion').textContent = game.currentMathQuestion.q;
}

// Setup upgrades display
function setupUpgrades() {
    updateUpgradesUI();
}

// Update upgrades UI
function updateUpgradesUI() {
    const container = document.getElementById('upgradesContainer');
    container.innerHTML = '';

    game.upgrades.forEach(upgrade => {
        const isUnlocked = upgrade.unlockedAtLevel <= game.level;
        const canAfford = game.money >= upgrade.cost;

        const card = document.createElement('div');
        card.className = `upgrade-card ${!isUnlocked ? 'locked' : ''} ${!canAfford ? 'disabled' : ''}`;
        card.setAttribute('data-upgrade-id', upgrade.id);
        card.classList.add('unlocked');

        let innerHtml = `
            <div class="upgrade-name">${upgrade.name}</div>
            <div style="font-size: 0.9em; margin: 8px 0; color: #666;">${upgrade.description}</div>
        `;

        if (isUnlocked) {
            innerHtml += `
                <div class="upgrade-cost">Cost: ${upgrade.cost.toLocaleString()} 💰</div>
                ${upgrade.income > 0 ? `<div class="upgrade-income">+${upgrade.income} drachma/sec</div>` : ''}
                ${upgrade.clickBonus ? `<div class="upgrade-income">+${upgrade.clickBonus} click value</div>` : ''}
                ${upgrade.multiplierBonus ? `<div class="upgrade-income">+${(upgrade.multiplierBonus * 100).toFixed(0)}% multiplier</div>` : ''}
                <div class="upgrade-count">Owned: ${upgrade.count}</div>
                <button onclick="buyUpgrade('${upgrade.id}')" style="width: 100%; margin-top: 10px; padding: 8px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Buy</button>
            `;
        } else {
            innerHtml += `
                <div class="unlock-badge">🔒 Unlock at Level ${upgrade.unlockedAtLevel}</div>
            `;
        }

        card.innerHTML = innerHtml;
        container.appendChild(card);
    });
}

// Show unlock notification
function showUnlock(title, items) {
    const guideBox = document.getElementById('guideBox');
    const guideContent = document.getElementById('guideContent');
    
    guideContent.innerHTML = `
        <ul>
            ${items.map(item => `<li>${item}</li>`).join('')}
        </ul>
    `;

    guideBox.style.display = 'block';
    guideBox.classList.add('new-unlock');
    
    setTimeout(() => {
        guideBox.classList.remove('new-unlock');
        setTimeout(() => {
            guideBox.style.display = 'none';
        }, 5000);
    }, 500);
}

// Tab switching
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

// Notifications
function showNotification(type, title, message) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <strong>${title}</strong>
        <div class="message">${message}</div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Format large numbers
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.floor(num).toString();
}

// Update UI
function updateUI() {
    // Money
    document.getElementById('playerMoney').textContent = formatNumber(game.money);
    document.getElementById('statsMoneyDisplay').textContent = formatNumber(game.money);
    
    // Debt and progress
    const remaining = Math.max(0, game.totalDebt - game.money);
    document.getElementById('remainingDebt').textContent = formatNumber(remaining);
    const progress = Math.min(100, (game.money / game.totalDebt) * 100);
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('progressFill').textContent = Math.floor(progress) + '%';
    document.getElementById('percentComplete').textContent = Math.floor(progress);

    // Level and XP
    document.getElementById('currentLevel').textContent = game.level;
    document.getElementById('currentXP').textContent = formatNumber(game.xp);
    document.getElementById('nextLevelXP').textContent = formatNumber(game.xpNeeded);
    const xpProgress = (game.xp / game.xpNeeded) * 100;
    document.getElementById('levelProgressBar').style.width = xpProgress + '%';

    // Stats
    document.getElementById('clickValue').textContent = formatNumber(game.clickValue);
    document.getElementById('perClickDisplay').textContent = formatNumber(game.clickValue * game.multiplier);
    document.getElementById('perSecondDisplay').textContent = formatNumber(game.perSecond * game.multiplier);
    document.getElementById('multiplierDisplay').textContent = game.multiplier.toFixed(1);
    document.getElementById('enemiesDefeated').textContent = game.enemiesDefeated;
    document.getElementById('mathSolved').textContent = game.mathSolved;

    // Battle UI
    if (game.currentEnemy) {
        document.getElementById('enemyName').textContent = game.currentEnemy.name;
        document.getElementById('enemyHP').textContent = Math.max(0, game.currentEnemy.hp);
        document.getElementById('enemyMaxHP').textContent = game.currentEnemy.maxHp;
        const healthPercent = (game.currentEnemy.hp / game.currentEnemy.maxHp) * 100;
        document.getElementById('enemyHealthBar').style.width = Math.max(0, healthPercent) + '%';
    }

    // Check battle and math unlocks
    const battleTabBtn = document.getElementById('battleTabBtn');
    const mathTabBtn = document.getElementById('mathTabBtn');
    const battleLocked = document.getElementById('battleLocked');
    const battleContent = document.getElementById('battleContent');
    const mathLocked = document.getElementById('mathLocked');
    const mathContent = document.getElementById('mathContent');

    if (game.unlockedFeatures.battle) {
        battleTabBtn.classList.remove('locked');
        battleLocked.style.display = 'none';
        battleContent.style.display = 'block';
    } else {
        battleTabBtn.classList.add('locked');
        battleLocked.style.display = 'flex';
        battleContent.style.display = 'none';
    }

    if (game.unlockedFeatures.math) {
        mathTabBtn.classList.remove('locked');
        mathLocked.style.display = 'none';
        mathContent.style.display = 'block';
    } else {
        mathTabBtn.classList.add('locked');
        mathLocked.style.display = 'flex';
        mathContent.style.display = 'none';
    }
}

// Save game to localStorage
function saveGame() {
    const saveData = {
        money: game.money,
        level: game.level,
        xp: game.xp,
        xpNeeded: game.xpNeeded,
        clickValue: game.clickValue,
        perSecond: game.perSecond,
        multiplier: game.multiplier,
        enemiesDefeated: game.enemiesDefeated,
        mathSolved: game.mathSolved,
        unlockedFeatures: game.unlockedFeatures,
        upgrades: game.upgrades.map(u => ({
            id: u.id,
            count: u.count,
            cost: u.cost
        }))
    };
    localStorage.setItem('olympusDebtSave', JSON.stringify(saveData));
}

// Load game from localStorage
function loadGame() {
    const saveData = localStorage.getItem('olympusDebtSave');
    if (saveData) {
        const data = JSON.parse(saveData);
        game.money = data.money || 0;
        game.level = data.level || 1;
        game.xp = data.xp || 0;
        game.xpNeeded = data.xpNeeded || 5000;
        game.clickValue = data.clickValue || 1;
        game.perSecond = data.perSecond || 0;
        game.multiplier = data.multiplier || 1;
        game.enemiesDefeated = data.enemiesDefeated || 0;
        game.mathSolved = data.mathSolved || 0;
        game.unlockedFeatures = data.unlockedFeatures || { battle: false, math: false };

        // Restore upgrades
        if (data.upgrades) {
            data.upgrades.forEach(savedUpgrade => {
                const upgrade = game.upgrades.find(u => u.id === savedUpgrade.id);
                if (upgrade) {
                    upgrade.count = savedUpgrade.count;
                    upgrade.cost = savedUpgrade.cost;
                }
            });
        }

        updateUI();
        setupUpgrades();
    }
}

// Start the game
window.addEventListener('DOMContentLoaded', init);
