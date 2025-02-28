class EventSystem {
    constructor(gameState, contentLoader) {
        this.gameState = gameState;
        this.contentLoader = contentLoader;
        this.currentEvent = null;
        this.lastEventDay = 0;
        this.isEventActive = false; // 添加标志防止重复触发
    }

    checkForRandomEvent() {
        // 如果已经有事件在显示，直接返回
        if (this.isEventActive) return;
        
        // 确保至少间隔3天才会触发新事件
        if (this.gameState.days - this.lastEventDay < 3) {
            return;
        }

        // 20%概率触发事件
        if (Math.random() < 0.2) {
            const events = this.contentLoader.events;
            if (!events || events.length === 0) return;

            // 先清除可能存在的旧事件
            this.clearExistingEvents();

            const randomEvent = events[Math.floor(Math.random() * events.length)];
            
            // 创建事件弹窗
            const dialog = document.createElement('div');
            dialog.className = 'event-dialog-overlay';
            dialog.innerHTML = `
                <div class="event-dialog">
                    <div class="event-content">
                        <h2>${randomEvent.name}</h2>
                        <p>${randomEvent.description}</p>
                        <div class="event-choices">
                            ${randomEvent.choices.map((choice, index) => `
                                <button class="event-choice" onclick="game.eventSystem.handleChoice(${index})">
                                    ${choice.text}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(dialog);
            this.isEventActive = true;
            
            // 添加动画类
            requestAnimationFrame(() => {
                dialog.querySelector('.event-dialog').classList.add('show');
            });

            this.currentEvent = randomEvent;
            this.lastEventDay = this.gameState.days;
        }
    }

    clearExistingEvents() {
        // 清除所有现有的事件弹窗
        const existingDialogs = document.querySelectorAll('.event-dialog-overlay');
        existingDialogs.forEach(dialog => dialog.remove());
    }

    handleChoice(choiceIndex) {
        if (!this.currentEvent || !this.isEventActive) return;

        const choice = this.currentEvent.choices[choiceIndex];
        if (!choice) return;

        // 应用选择的效果
        if (choice.result.effects) {
            this.gameState.updateStats(choice.result.effects);
        }

        // 添加成就
        if (choice.result.achievement) {
            this.gameState.addAchievement(choice.result.achievement);
        }

        // 更新弹窗内容显示结果
        const dialog = document.querySelector('.event-dialog');
        if (dialog) {
            dialog.innerHTML = `
                <div class="event-content">
                    <h2>${this.currentEvent.name}</h2>
                    <p>${choice.result.description}</p>
                    <button class="event-continue" onclick="game.eventSystem.closeEvent()">继续</button>
                </div>
            `;
        }
    }

    closeEvent() {
        const overlay = document.querySelector('.event-dialog-overlay');
        if (overlay) {
            const dialog = overlay.querySelector('.event-dialog');
            dialog.classList.remove('show');
            
            // 等待动画结束后移除元素
            setTimeout(() => {
                overlay.remove();
                this.isEventActive = false;
                this.currentEvent = null;
            }, 300);
        }
    }
}