class Game {
    constructor() {
        this.gameState = new GameState();
        this.contentLoader = new ContentLoader();
        this.eventSystem = new EventSystem(this.gameState, this.contentLoader);
        window.game = this;
        this.init();
    }

    async init() {
        await this.contentLoader.loadAllContent();
        this.setupUI();
        this.setupEventListeners();
    }

    setupUI() {
        this.renderSpaces();
        this.renderPreparations();
        this.renderProjects();
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
                        const achievement = {
                            ...item.achievement,
                            id: `${item.id}_${Date.now()}`,
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
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 3000);
    }

    renderSpaces() {
        const container = document.getElementById('spaces-grid');
        if (!container) return;
        container.innerHTML = this.contentLoader.spaces.map(space => this.createCardHTML(space)).join('');
    }

    renderPreparations() {
        const container = document.getElementById('research-grid');
        if (!container) return;
        container.innerHTML = this.contentLoader.preparations.map(prep => this.createCardHTML(prep)).join('');
    }

    renderProjects() {
        const container = document.getElementById('projects-grid');
        if (!container) return;
        container.innerHTML = this.contentLoader.projects.map(project => this.createCardHTML(project)).join('');
    }

    createCardHTML(item) {
        // 计算每个属性的标签类型
        const effectsHTML = item.effects ? Object.entries(item.effects).map(([stat, value]) => {
            let tagClass = '';
            switch(stat) {
                case 'theory': tagClass = 'theory-tag'; break;
                case 'social': tagClass = 'social-tag'; break;
                case 'confusion': tagClass = 'confusion-tag'; break;
                case 'funding': tagClass = 'funding-tag'; break;
            }
            const sign = value > 0 ? '+' : '';
            return `<span class="stat-tag ${tagClass}">${stat} ${sign}${value}</span>`;
        }).join('') : '';

        return `
            <div class="card" data-id="${item.id}">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <div class="stats">
                    ${effectsHTML}
                </div>
            </div>
        `;
    }
}

// 当页面加载完成后初始化游戏
window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});