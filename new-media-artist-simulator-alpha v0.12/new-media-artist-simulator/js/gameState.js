class GameState {
    constructor() {
        this.stats = {
            theory: 0,
            social: 0,
            confusion: 0,
            funding: 0
        };
        this.days = 1;
        this.achievements = [];
        this.history = [];
        
        // 初始化时从localStorage加载保存的数据
        this.loadGameState();
    }

    updateStats(effects) {
        if (!effects) return;
        
        Object.entries(effects).forEach(([stat, value]) => {
            if (this.stats.hasOwnProperty(stat)) {
                this.stats[stat] += value;
                // 确保数值在0-100范围内
                this.stats[stat] = Math.max(0, Math.min(100, this.stats[stat]));
            }
        });
        
        this.updateUI();
        this.saveGameState();
    }

    addAchievement(achievement) {
        if (!achievement) return;

        // 确保achievement有id属性
        if (!achievement.id && achievement.name) {
            achievement.id = achievement.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        }

        // 检查是否已存在相同id的成就
        const existingAchievement = this.achievements.find(a => a.id === achievement.id);
        
        if (!existingAchievement) {
            // 添加时间戳和天数
            achievement.timestamp = Date.now();
            achievement.dayObtained = this.days;
            
            this.achievements.push(achievement);
            this.showAchievementNotification(achievement);
            this.updateAchievementsList();
            this.saveGameState();
        }
    }

    addHistoryEvent(event) {
        const historyEvent = {
            ...event,
            day: this.days,
            timestamp: Date.now()
        };
        
        this.history.push(historyEvent);
        this.saveGameState();
    }

    incrementDay() {
        this.days++;
        const daysElement = document.getElementById('days');
        if (daysElement) {
            daysElement.textContent = this.days;
        }
        this.saveGameState();
    }

    updateUI() {
        // 更新状态显示
        Object.entries(this.stats).forEach(([stat, value]) => {
            const element = document.getElementById(`stat-${stat}`);
            if (element) {
                element.textContent = Math.floor(value);
            }
        });

        // 更新天数显示
        const daysElement = document.getElementById('days');
        if (daysElement) {
            daysElement.textContent = this.days;
        }
    }

    updateAchievementsList() {
        const container = document.getElementById('achievements-list');
        if (!container) return;
        
        // 按时间戳降序排序，最新的在前面
        const sortedAchievements = [...this.achievements]
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        container.innerHTML = sortedAchievements.map(achievement => `
            <div class="achievement-card">
                <h3>${achievement.name}</h3>
                <p>${achievement.description}</p>
                <small>获得于第 ${achievement.dayObtained} 天</small>
            </div>
        `).join('');
    }

    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-content">
                <h3>新成就解锁！</h3>
                <h4>${achievement.name}</h4>
                <p>${achievement.description}</p>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 添加显示动画
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // 3秒后移除
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 3000);
    }

    saveGameState() {
        const gameState = {
            stats: this.stats,
            days: this.days,
            achievements: this.achievements,
            history: this.history
        };
        localStorage.setItem('gameState', JSON.stringify(gameState));
    }

    loadGameState() {
        const savedState = localStorage.getItem('gameState');
        if (savedState) {
            try {
                const gameState = JSON.parse(savedState);
                this.stats = gameState.stats || this.stats;
                this.days = gameState.days || 1;
                this.achievements = gameState.achievements || [];
                this.history = gameState.history || [];
                
                this.updateUI();
                this.updateAchievementsList();
            } catch (e) {
                console.error('Failed to load game state:', e);
                // 如果加载失败，保持初始状态
            }
        }
    }

    resetGameState() {
        localStorage.removeItem('gameState');
        this.stats = {
            theory: 0,
            social: 0,
            confusion: 0,
            funding: 0
        };
        this.days = 1;
        this.achievements = [];
        this.history = [];
        
        this.updateUI();
        this.updateAchievementsList();
    }

    exportProfile() {
        return {
            days: this.days,
            stats: this.stats,
            achievements: this.achievements,
            history: this.history
        };
    }
    setupEventListeners() {
        // 导出按钮事件
        document.getElementById('export-button')?.addEventListener('click', () => {
            const profile = this.gameState.exportProfile();
            console.log('导出游戏数据:', profile);
        });

        // 为所有卡片添加点击事件
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', (e) => {
                const cardId = card.dataset.id;
                
                // 根据卡片所在的容器确定类型
                const container = card.closest('#spaces-grid, #research-grid, #projects-grid');
                if (!container) return;

                let item;
                switch (container.id) {
                    case 'spaces-grid':
                        item = this.contentLoader.spaces.find(s => s.id === cardId);
                        break;
                    case 'research-grid':
                        item = this.contentLoader.preparations.find(p => p.id === cardId);
                        break;
                    case 'projects-grid':
                        item = this.contentLoader.projects.find(p => p.id === cardId);
                        break;
                }

                if (item) {
                    // 检查是否满足要求
                    if (item.requirements) {
                        const canExecute = Object.entries(item.requirements).every(([stat, required]) => {
                            return this.gameState.stats[stat] >= required;
                        });
                        
                        if (!canExecute) {
                            // 显示要求不满足的提示
                            this.showRequirementsNotification(item.requirements);
                            return;
                        }
                    }

                    // 更新状态
                    if (item.effects) {
                        this.gameState.updateStats(item.effects);
                    }
                    
                    // 添加成就
                    if (item.achievement) {
                        // 为成就添加唯一ID
                        const achievement = {
                            ...item.achievement,
                            id: `${item.id}_achievement_${Date.now()}`,
                            source: item.name,
                            dayObtained: this.gameState.days
                        };
                        this.gameState.addAchievement(achievement);
                    }
                    
                    // 播放点击动画
                    card.classList.add('card-clicked');
                    setTimeout(() => card.classList.remove('card-clicked'), 200);

                    // 记录历史
                    this.gameState.addHistoryEvent({
                        type: container.id.replace('-grid', ''),
                        name: item.name,
                        effects: item.effects
                    });

                    // 增加天数
                    this.gameState.incrementDay();

                    // 检查是否触发随机事件
                    this.eventSystem.checkForRandomEvent();
                }
            });
        });
    }

    showRequirementsNotification(requirements) {
        const notification = document.createElement('div');
        notification.className = 'requirements-notification';
        notification.innerHTML = `
            <div class="requirements-content">
                <h3>要求不满足</h3>
                <p>你需要达到以下要求：</p>
                <ul>
                    ${Object.entries(requirements).map(([stat, value]) => `
                        <li>${stat}: ${value}</li>
                    `).join('')}
                </ul>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 添加显示动画
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // 3秒后移除
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 3000);
    }

}