// main.js - 主要游戏逻辑
console.log('🎨 新媒体艺术家模拟器启动中...');

// 全局变量
let gameState;
let contentLoader;
let eventSystem;
let tutorialShown = false;

// 初始化游戏
document.addEventListener('DOMContentLoaded', async function() {
    console.log('📊 初始化游戏状态...');
    
    // 重置防重复标志
    isShowingPlayerSetup = false;
    
    try {
        // 显示加载状态
        showLoading();
        
        // 添加最大加载时间限制
        const maxLoadTime = 15000; // 15秒
        const startTime = Date.now();
        
        // 初始化游戏状态
        console.log('🔄 创建GameState实例...');
        gameState = new GameState();
        window.gameState = gameState; // 确保全局可访问
        console.log('✅ 游戏状态初始化完成:', gameState);
        
        // 初始化内容加载器
        console.log('🔄 创建ContentLoader实例...');
        contentLoader = new ContentLoader();
        window.contentLoader = contentLoader; // 确保全局可访问
        
        try {
            console.log('🔄 开始加载内容...');
            await contentLoader.loadAllContent();
            console.log('✅ 内容加载完成');
        } catch (loadError) {
            console.error('⚠️ 内容加载失败，但继续游戏:', loadError);
            // 显示警告但不阻止游戏运行
            showNotification('内容加载失败，使用默认数据', 'warning');
        }
        
        // 检查是否超时
        const loadTime = Date.now() - startTime;
        if (loadTime > maxLoadTime) {
            console.warn('⚠️ 加载时间过长，强制继续');
            showNotification('加载时间过长，已强制继续', 'warning');
        }
        
        // 初始化事件系统
        try {
            eventSystem = new EventSystem(gameState);
            window.eventSystem = eventSystem; // 也添加到全局访问
            console.log('✅ 事件系统初始化完成');
        } catch (eventError) {
            console.error('⚠️ 事件系统初始化失败:', eventError);
            eventSystem = null; // 设置为null，游戏可以继续
        }
        
        // 初始化界面
        console.log('🔄 初始化界面...');
        initializeUI();
        console.log('✅ 界面初始化完成');
        
        // 确保数据加载完成后再次更新界面
        setTimeout(() => {
            console.log('🔄 最终界面更新...');
            updateStatsDisplay();
            loadCards();
            updateCardsAvailability();
        }, 1000);
        
        // 隐藏加载状态
        hideLoading();
        
        // 强制隐藏加载状态（备用机制）
        setTimeout(() => {
            const loadingElement = document.getElementById('loading-overlay');
            if (loadingElement && loadingElement.style.display !== 'none') {
                console.log('🔧 强制隐藏加载状态');
                loadingElement.style.display = 'none';
                loadingElement.classList.add('hidden');
            }
        }, 2000);
        
        // 检查是否是第一次启动
        const isFirstTime = !localStorage.getItem('hasPlayedBefore');
        if (isFirstTime) {
            // 第一次启动显示开场动画
            showIntroAnimation();
            localStorage.setItem('hasPlayedBefore', 'true');
            
            // 动画结束后检查新手引导
            setTimeout(() => {
                checkTutorial();
            }, 10500);
        } else {
            // 不是第一次启动，直接检查新手引导
            checkTutorial();
        }
        
        console.log('🎉 游戏启动完成！');
        
    } catch (error) {
        console.error('❌ 游戏初始化失败:', error);
        hideLoading();
        
        // 即使初始化失败，也要尝试显示基本界面
        try {
            document.body.innerHTML = `
                <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
                    <h1 style="color: #f44336;">游戏初始化失败</h1>
                    <p>详细错误: ${error.message}</p>
                    <button onclick="location.reload()" style="padding: 10px 20px; font-size: 16px; background: #2196f3; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        重新加载
                    </button>
                </div>
            `;
        } catch (fallbackError) {
            console.error('❌ 连备用界面都无法显示:', fallbackError);
        }
    }
});

// 供外部调用的初始化函数
function initializeGame() {
    console.log('🔄 外部调用游戏初始化...');
    // 触发DOMContentLoaded事件的逻辑已经在上面处理了
    // 如果需要手动重新初始化，可以调用相关函数
    if (gameState && contentLoader) {
        console.log('✅ 游戏已经初始化完成');
        return Promise.resolve();
    } else {
        console.log('⚠️ 游戏尚未初始化，请等待...');
        return new Promise((resolve) => {
            const checkInit = setInterval(() => {
                if (gameState && contentLoader) {
                    clearInterval(checkInit);
                    resolve();
                }
            }, 100);
        });
    }
}

// 显示加载状态
function showLoading() {
    console.log('🔄 显示加载状态');
    const loadingElement = document.getElementById('loading-overlay');
    if (loadingElement) {
        loadingElement.style.display = 'flex';
        loadingElement.classList.remove('hidden');
    } else {
        console.warn('⚠️ 找不到加载元素 #loading-overlay');
    }
}

// 隐藏加载状态
function hideLoading() {
    console.log('✅ 隐藏加载状态');
    
    // 尝试隐藏所有可能的加载元素
    const loadingSelectors = [
        '#loading-overlay',
        '#loading',
        '.loading-overlay',
        '.loading'
    ];
    
    let hiddenCount = 0;
    
    loadingSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.style.display = 'none';
            element.classList.add('hidden');
            hiddenCount++;
        });
    });
    
    console.log(`🔧 隐藏了 ${hiddenCount} 个加载元素`);
    
    // 如果没有找到任何加载元素，检查所有包含"loading"的元素
    if (hiddenCount === 0) {
        const allElements = document.querySelectorAll('*');
        allElements.forEach(element => {
            if (element.id && element.id.includes('loading')) {
                console.log(`🔍 找到可能的加载元素: #${element.id}`);
                element.style.display = 'none';
                element.classList.add('hidden');
            }
            if (element.className && element.className.includes('loading')) {
                console.log(`🔍 找到可能的加载元素: .${element.className}`);
                element.style.display = 'none';
                element.classList.add('hidden');
            }
        });
    }
}

// 初始化界面
function initializeUI() {
    console.log('🎨 初始化用户界面...');
    
    // 更新数值显示
    updateStatsDisplay();
    
    // 加载并显示卡片
    loadCards();
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 初始化日志系统
    initializeActionLog();
    
    // 初始化成就时间线
    updateAchievementsTimeline();
}

// 绑定事件监听器
function bindEventListeners() {
    console.log('🔗 绑定事件监听器...');
    
    // 艺术家档案按钮
    const artistProfileBtn = document.getElementById('artist-profile');
    if (artistProfileBtn) {
        console.log('✅ 找到艺术家档案按钮，正在绑定事件...');
        // 移除可能存在的旧事件监听器
        artistProfileBtn.replaceWith(artistProfileBtn.cloneNode(true));
        const newArtistProfileBtn = document.getElementById('artist-profile');
        newArtistProfileBtn.addEventListener('click', function(e) {
            console.log('🖱️ 艺术家档案按钮被点击');
            e.preventDefault();
            showArtistProfile();
        });
        console.log('✅ 艺术家档案按钮事件绑定完成');
    } else {
        console.error('❌ 找不到艺术家档案按钮 #artist-profile');
    }
    
    // 重新开始艺术家生涯按钮
    const restartCareerBtn = document.getElementById('restart-career');
    if (restartCareerBtn) {
        console.log('✅ 找到重新开始艺术家生涯按钮，正在绑定事件...');
        // 移除可能存在的旧事件监听器
        restartCareerBtn.replaceWith(restartCareerBtn.cloneNode(true));
        const newRestartCareerBtn = document.getElementById('restart-career');
        newRestartCareerBtn.addEventListener('click', function(e) {
            console.log('🖱️ 重新开始艺术家生涯按钮被点击');
            e.preventDefault();
            handleRestartCareer();
        });
        console.log('✅ 重新开始艺术家生涯按钮事件绑定完成');
    } else {
        console.error('❌ 找不到重新开始艺术家生涯按钮 #restart-career');
    }
    
    // 随机抽奖按钮
    const quickStartBtn = document.getElementById('quick-start');
    if (quickStartBtn) {
        console.log('✅ 找到随机抽奖按钮，正在绑定事件...');
        // 移除可能存在的旧事件监听器
        quickStartBtn.replaceWith(quickStartBtn.cloneNode(true));
        const newQuickStartBtn = document.getElementById('quick-start');
        newQuickStartBtn.addEventListener('click', function(e) {
            console.log('🖱️ 随机抽奖按钮被点击');
            e.preventDefault();
            handleQuickStart();
        });
        console.log('✅ 随机抽奖按钮事件绑定完成');
    } else {
        console.error('❌ 找不到随机抽奖按钮 #quick-start');
    }
    
    // 新手引导相关
    bindTutorialEvents();
    
    // 卡片点击事件委托
    bindCardEvents();
    
    console.log('🎉 所有事件监听器绑定完成');
    
    // 初始化状态摘要显示
    updateStatusSummary();
}

// 绑定卡片事件
function bindCardEvents() {
    const actionColumns = document.querySelector('.action-columns');
    if (actionColumns) {
        actionColumns.addEventListener('click', handleCardClick);
    }
}

// 处理卡片点击
function handleCardClick(event) {
    console.log('🖱️ 卡片点击事件触发', event.target);
    
    const card = event.target.closest('.card');
    if (!card) {
        console.log('⚠️ 未找到卡片元素');
        return;
    }
    
    console.log('🃏 找到卡片:', card);
    
    // 检查游戏是否完全初始化
    if (!gameState || !contentLoader) {
        console.error('❌ 游戏尚未完全初始化');
        showNotification('游戏正在初始化中，请稍后再试', 'warning');
        return;
    }
    
    if (card.classList.contains('disabled')) {
        console.log('⚠️ 卡片被禁用');
        showNotification('该选项的要求尚未满足', 'warning');
        return;
    }
    
    const cardId = card.dataset.id;
    const cardType = card.dataset.type;
    
    console.log('📝 卡片信息:', { cardId, cardType });
    
    if (cardId && cardType) {
        console.log('🎯 准备执行动作:', cardType, cardId);
        
        // 添加点击反馈
        card.style.transform = 'scale(0.95)';
        card.style.transition = 'transform 0.1s ease';
        setTimeout(() => {
            card.style.transform = '';
        }, 100);
        
        executeAction(cardType, cardId);
    } else {
        console.error('❌ 卡片缺少必要的数据属性');
        showNotification('卡片数据错误，请刷新页面', 'error');
    }
}

// 执行动作
function executeAction(category, actionId) {
    console.log(`🎯 执行动作: ${category} - ${actionId}`);
    
    if (!gameState) {
        console.error('❌ GameState 未初始化');
        showNotification('游戏状态未初始化，请刷新页面', 'error');
        return;
    }
    
    if (!contentLoader) {
        console.error('❌ ContentLoader 未初始化');
        showNotification('内容加载器未初始化，请刷新页面', 'error');
        return;
    }
    
    try {
        const success = gameState.executeAction(category, actionId);
        
        if (success) {
            console.log('✅ 动作执行成功');
            
            // 获取动作数据
            const actionData = contentLoader.getActionData(category, actionId);
            
            // 显示动作日志
            if (actionData) {
                showActionLog(actionData, category, 'success');
                showNotification(`执行成功: ${actionData.name}`, 'success');
            }
            
            // 更新界面
            updateStatsDisplay();
            updateCardsAvailability();
            updateAchievementsTimeline();
            
            // 检查成就
            checkAchievements();
            
        } else {
            console.log('⚠️ 动作执行失败');
            showActionLog(null, category, 'error', '操作失败 - 数值不足');
            showNotification('无法执行该操作，可能是数值不足', 'warning');
        }
        
    } catch (error) {
        console.error('❌ 执行动作失败:', error);
        showNotification('操作执行失败: ' + error.message, 'error');
    }
}

// 加载卡片
function loadCards() {
    console.log('🃏 加载游戏卡片...');
    
    // 加载各类型卡片
    loadCardsOfType('spaces', 'spaces-cards');
    loadCardsOfType('preparations', 'preparations-cards');
    loadCardsOfType('projects', 'projects-cards');
    loadCardsOfType('income', 'income-cards');
}

// 加载指定类型的卡片
function loadCardsOfType(type, containerId) {
    console.log(`🎯 加载卡片类型: ${type} → ${containerId}`);
    
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`❌ 找不到容器: ${containerId}`);
        return;
    }
    
    const content = contentLoader.getContent(type);
    if (!content) {
        console.error(`❌ 无法获取内容: ${type}`);
        container.innerHTML = '<div class="error-message">内容加载失败</div>';
        return;
    }
    
    // 创建卡片 - 所有JSON文件都是直接的数组结构
    const items = content;
    
    if (!Array.isArray(items)) {
        console.error(`❌ 内容格式错误，期望数组但得到:`, typeof items);
        container.innerHTML = '<div class="error-message">内容格式错误</div>';
        return;
    }
    
    // 排序：可点击的卡片在前，不可点击的在后
    const sortedItems = items.sort((a, b) => {
        const canClickA = gameState.canExecuteAction(type, a.id);
        const canClickB = gameState.canExecuteAction(type, b.id);
        
        // 可点击的排在前面
        if (canClickA && !canClickB) return -1;
        if (!canClickA && canClickB) return 1;
        
        // 如果都可点击或都不可点击，按原顺序
        return 0;
    });
    
    container.innerHTML = '';
    
    sortedItems.forEach(item => {
        const card = createCardElement(item, type);
        container.appendChild(card);
    });
    
    console.log(`✅ 已加载 ${sortedItems.length} 个 ${type} 卡片`);
}

// 创建卡片元素
function createCardElement(data, type) {
    console.log(`🃏 创建卡片: ${data.name} (${type})`, data);
    
    if (!data.id || !data.name) {
        console.error('❌ 卡片数据缺少必要字段:', data);
        return null;
    }
    
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = data.id;
    card.dataset.type = type;
    
    console.log(`📝 设置卡片属性: id=${data.id}, type=${type}`);
    
    // 卡片标题
    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = data.name;
    card.appendChild(title);
    
    // 卡片描述
    const description = document.createElement('div');
    description.className = 'card-description';
    description.textContent = data.description;
    card.appendChild(description);
    
    // 效果标签
    if (data.effects) {
        const effectsContainer = document.createElement('div');
        effectsContainer.className = 'card-effects';
        
        Object.entries(data.effects).forEach(([stat, value]) => {
            if (value !== 0) {
                const effect = document.createElement('span');
                effect.className = `effect ${value > 0 ? 'positive' : 'negative'}`;
                effect.style.borderColor = getStatColor(stat);
                effect.textContent = `${formatStatName(stat)} ${value > 0 ? '+' : ''}${value}`;
                effectsContainer.appendChild(effect);
            }
        });
        
        card.appendChild(effectsContainer);
    }

    // 需求显示
    if (data.requirements) {
        const requirementsContainer = document.createElement('div');
        requirementsContainer.className = 'requirements';
        
        Object.entries(data.requirements).forEach(([stat, value]) => {
            if (value > 0) {
                const requirement = document.createElement('span');
                requirement.className = 'requirement';
                requirement.style.borderColor = getStatColor(stat);
                requirement.textContent = `需要 ${formatStatName(stat)} ${value}`;
                requirementsContainer.appendChild(requirement);
            }
        });
        
        card.appendChild(requirementsContainer);
    }
    
    // 添加注释
    if (data.common_translation || data.sarcastic_comment) {
        const annotation = document.createElement('div');
        annotation.className = 'card-annotation';
        
        if (data.common_translation) {
            const translation = document.createElement('div');
            translation.className = 'translation';
            translation.textContent = data.common_translation;
            annotation.appendChild(translation);
        }
        
        if (data.sarcastic_comment) {
            const comment = document.createElement('div');
            comment.className = 'sarcastic-comment';
            comment.textContent = data.sarcastic_comment;
            annotation.appendChild(comment);
        }
        
        card.appendChild(annotation);
    }
    
    return card;
}

// 更新数值显示
function updateStatsDisplay() {
    console.log('📊 更新数值显示...');
    
    const stats = gameState.getStats();
    
    // 更新每个数值和进度条
    Object.entries(stats).forEach(([stat, value]) => {
        // 更新数值显示
        const valueElement = document.querySelector(`.stat-value[data-stat="${stat}"]`);
        if (valueElement) {
            valueElement.textContent = value;
        }
        
        // 更新进度条
        const fillElement = document.querySelector(`.stat-fill[data-stat="${stat}"]`);
        if (fillElement) {
            let percentage;
            
            // 专业维度和生存维度使用不同的计算方式
            if (['theory', 'academic', 'paradigm', 'funding'].includes(stat)) {
                // 专业维度：0-200的范围
                percentage = Math.min(100, Math.max(0, (value / 200) * 100));
            } else {
                // 生存维度：-50到100的范围，以50为中性点
                const normalizedValue = (value + 50) / 150; // 将-50~100映射到0~1
                percentage = Math.min(100, Math.max(0, normalizedValue * 100));
            }
            
            fillElement.style.width = `${percentage}%`;
            fillElement.style.backgroundColor = getStatColor(stat);
        } else {
            console.warn(`⚠️ 找不到进度条元素: .stat-fill[data-stat="${stat}"]`);
        }
    });
    
    // 更新状态摘要
    updateStatusSummary();
}

// 更新卡片可用性
function updateCardsAvailability() {
    console.log('🔄 更新卡片可用性...');
    
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        const cardId = card.dataset.id;
        const cardType = card.dataset.type;
        
        try {
            if (gameState.canExecuteAction(cardType, cardId)) {
                card.classList.remove('disabled');
            } else {
                card.classList.add('disabled');
            }
        } catch (error) {
            console.error('检查卡片可用性时出错:', error, { cardId, cardType });
            card.classList.add('disabled');
        }
    });
}

// 更新成就时间线
function updateAchievementsTimeline() {
    console.log('🏆 更新成就时间线...');
    
    const timeline = document.getElementById('achievements-timeline');
    if (!timeline) return;
    
    const achievements = gameState.getAchievements();
    
    // 清空现有内容
    timeline.innerHTML = '';
    
    if (achievements.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = '暂无成就，开始行动吧！';
        timeline.appendChild(emptyMessage);
        return;
    }
    
    // 按时间倒序显示成就
    achievements.reverse().forEach(achievement => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        
        const time = document.createElement('div');
        time.className = 'time';
        time.textContent = `第${achievement.day}天`;
        item.appendChild(time);
        
        const desc = document.createElement('div');
        desc.className = 'achievement';
        desc.textContent = `🏆 ${achievement.name}: ${achievement.description}`;
        item.appendChild(desc);
        
        timeline.appendChild(item);
    });
}

// 检查成就
function checkAchievements() {
    // 这里可以添加成就检查逻辑
    // 目前由gameState内部处理
}

// 重新开始游戏
function restartGame() {
    console.log('🔄 重新开始游戏...');
    
    if (confirm('确定要重新开始吗？当前进度将会丢失。')) {
        try {
            // 确保gameState存在
            if (!gameState) {
                console.error('❌ GameState 未初始化');
                showNotification('游戏状态未初始化，请刷新页面', 'error');
                return;
            }
            
            // 重置游戏状态
            gameState.resetGameState();
            
            // 立即更新界面
            updateStatsDisplay();
            updateCardsAvailability();
            updateAchievementsTimeline();
            loadCards();
            
            // 显示开场动画
            showIntroAnimation();
            
            // 3秒后显示新手引导
            setTimeout(() => {
                showTutorial();
            }, 3000);
            
            showNotification('新的艺术家生涯开始了！', 'success');
            console.log('✅ 游戏重置完成');
            
        } catch (error) {
            console.error('❌ 重置游戏失败:', error);
            showNotification('重置游戏失败: ' + error.message, 'error');
        }
    }
}

// 处理重新开始艺术家生涯
function handleRestartCareer() {
    console.log('🔄 处理重新开始艺术家生涯...');
    
    // 获取当前状态用于确认对话框
    const stats = gameState ? gameState.getStats() : {};
    const day = gameState ? gameState.getDay() : 1;
    const achievements = gameState ? gameState.getAchievements() : [];
    
    // 生成当前状态摘要用于确认
    const currentSummary = generateQuickStatusSummary(stats, achievements.length, day);
    
    const confirmed = confirm(`
🔄 重新开始艺术家生涯

当前状态：${currentSummary.artistType} (第${day}天)
专业指数：${currentSummary.professionalScore}/1000
生存指数：${currentSummary.survivalScore}/1000
获得成就：${achievements.length}项

确定要重新开始吗？当前所有进度将会被清除。
    `);
    
    if (confirmed) {
        try {
            console.log('🗑️ 开始清除当前艺术家状态...');
            
            // 确保gameState存在
            if (!gameState) {
                console.error('❌ GameState 未初始化');
                showNotification('游戏状态未初始化，请刷新页面', 'error');
                return;
            }
            
            // 重置游戏状态
            gameState.resetGameState();
            
            // 清除相关本地存储
            localStorage.removeItem('gameState');
            localStorage.removeItem('playerChoices');
            
            // 立即更新界面
            updateStatsDisplay();
            updateCardsAvailability();
            updateAchievementsTimeline();
            updateStatusSummary();
            loadCards();
            
            showNotification('🌟 新的艺术家生涯开始了！', 'success');
            console.log('✅ 艺术家生涯重置完成');
            
            // 3秒后显示玩家设置
            setTimeout(() => {
                showPlayerSetupQuestions();
            }, 1500);
            
        } catch (error) {
            console.error('❌ 重新开始艺术家生涯失败:', error);
            showNotification('重新开始失败: ' + error.message, 'error');
        }
    }
}

// 更新状态摘要显示
function updateStatusSummary() {
    console.log('📊 更新状态摘要显示...');
    
    const summaryElement = document.getElementById('current-status-summary');
    if (!summaryElement) {
        console.warn('⚠️ 找不到状态摘要元素');
        return;
    }
    
    if (!gameState) {
        summaryElement.innerHTML = '<div class="status-loading">游戏初始化中...</div>';
        return;
    }
    
    try {
        const stats = gameState.getStats();
        const achievements = gameState.getAchievements();
        const day = gameState.getDay();
        
        const summary = generateQuickStatusSummary(stats, achievements.length, day);
        
        summaryElement.innerHTML = `
            <div class="status-summary-content">
                <div class="status-title">📊 当前状态</div>
                <div class="status-type">${summary.artistType}</div>
                <div class="status-scores">
                    <span class="professional-score">专业: ${summary.professionalScore}/1000</span>
                    <span class="survival-score">生存: ${summary.survivalScore}/1000</span>
                </div>
                <div class="status-details">第${day}天 · ${achievements.length}项成就</div>
                <div class="status-comment">${summary.comment}</div>
            </div>
        `;
        
    } catch (error) {
        console.error('❌ 更新状态摘要失败:', error);
        summaryElement.innerHTML = '<div class="status-error">状态获取失败</div>';
    }
}

// 生成快速状态摘要
function generateQuickStatusSummary(stats, achievementCount, day) {
    // 计算总体评分
    const professionalScore = Math.round((stats.theory + stats.academic + stats.paradigm + stats.funding) / 4);
    const survivalScore = Math.round((stats.anxiety + stats.sarcasm + stats.reality + stats.humor) / 4);
    
    // 确定艺术家类型（简化版）
    let artistType = "新手艺术家";
    let comment = "刚刚踏上艺术之路，充满无限可能！";
    
    const avgScore = (professionalScore + survivalScore) / 2;
    
    if (avgScore >= 800) {
        artistType = "传奇艺术家";
        comment = "已达到艺术家的巅峰境界，令人仰望！";
    } else if (avgScore >= 600) {
        artistType = "资深艺术家";
        comment = "在艺术领域已有深厚造诣，备受认可。";
    } else if (avgScore >= 400) {
        artistType = "成熟艺术家";
        comment = "找到了自己的艺术方向，稳步发展中。";
    } else if (avgScore >= 200) {
        artistType = "成长中的艺术家";
        comment = "正在探索自己的艺术道路，潜力无限。";
    } else if (avgScore >= 100) {
        artistType = "初级艺术家";
        comment = "刚刚入门，还在学习基础技能。";
    }
    
    // 根据具体数值添加特色评价
    if (stats.theory >= 600) {
        comment += " 理论功底深厚。";
    }
    if (stats.funding >= 600) {
        comment += " 经济状况良好。";
    }
    if (stats.anxiety >= 600) {
        comment += " 创作充满激情与焦虑。";
    }
    if (stats.humor >= 600) {
        comment += " 作品幽默风趣。";
    }
    
    // 成就相关评价
    if (achievementCount >= 20) {
        comment += " 成就满满！";
    } else if (achievementCount >= 10) {
        comment += " 积累了不少成就。";
    }
    
    return {
        artistType,
        professionalScore: Math.max(0, Math.min(1000, professionalScore)),
        survivalScore: Math.max(0, Math.min(1000, survivalScore)),
        comment
    };
}

// 处理随机抽奖
function handleQuickStart() {
    console.log('🎲 执行随机抽奖...');
    
    // 随机增加一些初始数值
    const randomStats = {
        theory: Math.floor(Math.random() * 20) + 10,
        academic: Math.floor(Math.random() * 20) + 10,
        paradigm: Math.floor(Math.random() * 20) + 10,
        funding: Math.floor(Math.random() * 50) + 25,
        anxiety: Math.floor(Math.random() * 10) + 5,
        sarcasm: Math.floor(Math.random() * 15) + 10,
        reality: Math.floor(Math.random() * 15) + 10,
        humor: Math.floor(Math.random() * 10) + 5
    };
    
    // 应用随机数值
    Object.entries(randomStats).forEach(([stat, value]) => {
        gameState.changeStat(stat, value);
    });
    
    // 更新界面
    updateStatsDisplay();
    updateCardsAvailability();
    
    // 显示抽奖结果
    const resultMessage = Object.entries(randomStats)
        .map(([stat, value]) => `${stat} +${value}`)
        .join(', ');
    
    showNotification(`🎲 抽奖结果: ${resultMessage}`, 'success');
}

// 显示艺术家档案
function showArtistProfile() {
    console.log('🎭 showArtistProfile 函数被调用！');
    console.log('📝 显示艺术家档案...');
    
    if (!gameState) {
        console.error('❌ GameState 未初始化，无法显示艺术家档案');
        showNotification('游戏状态未初始化，请刷新页面', 'error');
        return;
    }
    
    const modal = document.getElementById('artist-profile-modal');
    const profileBody = document.getElementById('artist-profile-body');
    
    if (!modal || !profileBody) {
        console.error('❌ 找不到艺术家档案模态框元素');
        showNotification('无法找到艺术家档案界面元素', 'error');
        return;
    }
    
    try {
        // 获取当前游戏数据
        const stats = gameState.getStats();
        const achievements = gameState.getAchievements();
        const day = gameState.getDay();
        
        console.log('📊 当前游戏数据:', { stats, achievements, day });
        
        // 生成艺术家评价
        const evaluation = generateArtistEvaluation(stats, achievements, day);
        
        // 构建档案内容
        profileBody.innerHTML = `
            <div class="profile-section">
                <h3>🎭 ${evaluation.artistType} (第${day}天)</h3>
                <div class="artist-type-desc">
                    <p><strong>专业指数:</strong> ${evaluation.professionalScore}/1000 | <strong>生存指数:</strong> ${evaluation.survivalScore}/1000</p>
                    ${evaluation.specialAchievements.length > 0 ? `<div class="special-badges">${evaluation.specialAchievements.join(' ')}</div>` : ''}
                </div>
            </div>
            
            <div class="profile-section">
                <h3>📊 八维能力详细解读</h3>
                <div class="dimension-evaluations">
                    <div class="dimension-row">
                        <div class="dimension-item">
                            <div class="dimension-header">
                                <span class="dimension-name">理论深度</span>
                                <span class="dimension-score">${stats.theory || 0}</span>
                            </div>
                            <div class="dimension-level">${evaluation.dimensionEvaluations.theory.level}</div>
                            <div class="dimension-desc">${evaluation.dimensionEvaluations.theory.desc}</div>
                        </div>
                        <div class="dimension-item">
                            <div class="dimension-header">
                                <span class="dimension-name">学术资本</span>
                                <span class="dimension-score">${stats.academic || 0}</span>
                            </div>
                            <div class="dimension-level">${evaluation.dimensionEvaluations.academic.level}</div>
                            <div class="dimension-desc">${evaluation.dimensionEvaluations.academic.desc}</div>
                        </div>
                    </div>
                    
                    <div class="dimension-row">
                        <div class="dimension-item">
                            <div class="dimension-header">
                                <span class="dimension-name">范式突破</span>
                                <span class="dimension-score">${stats.paradigm || 0}</span>
                            </div>
                            <div class="dimension-level">${evaluation.dimensionEvaluations.paradigm.level}</div>
                            <div class="dimension-desc">${evaluation.dimensionEvaluations.paradigm.desc}</div>
                        </div>
                        <div class="dimension-item">
                            <div class="dimension-header">
                                <span class="dimension-name">研究经费</span>
                                <span class="dimension-score">${stats.funding || 0}</span>
                            </div>
                            <div class="dimension-level">${evaluation.dimensionEvaluations.funding.level}</div>
                            <div class="dimension-desc">${evaluation.dimensionEvaluations.funding.desc}</div>
                        </div>
                    </div>
                    
                    <div class="dimension-row">
                        <div class="dimension-item">
                            <div class="dimension-header">
                                <span class="dimension-name">焦虑指数</span>
                                <span class="dimension-score">${stats.anxiety || 0}</span>
                            </div>
                            <div class="dimension-level">${evaluation.dimensionEvaluations.anxiety.level}</div>
                            <div class="dimension-desc">${evaluation.dimensionEvaluations.anxiety.desc}</div>
                        </div>
                        <div class="dimension-item">
                            <div class="dimension-header">
                                <span class="dimension-name">讽刺值</span>
                                <span class="dimension-score">${stats.sarcasm || 0}</span>
                            </div>
                            <div class="dimension-level">${evaluation.dimensionEvaluations.sarcasm.level}</div>
                            <div class="dimension-desc">${evaluation.dimensionEvaluations.sarcasm.desc}</div>
                        </div>
                    </div>
                    
                    <div class="dimension-row">
                        <div class="dimension-item">
                            <div class="dimension-header">
                                <span class="dimension-name">现实感</span>
                                <span class="dimension-score">${stats.reality || 0}</span>
                            </div>
                            <div class="dimension-level">${evaluation.dimensionEvaluations.reality.level}</div>
                            <div class="dimension-desc">${evaluation.dimensionEvaluations.reality.desc}</div>
                        </div>
                        <div class="dimension-item">
                            <div class="dimension-header">
                                <span class="dimension-name">幽默度</span>
                                <span class="dimension-score">${stats.humor || 0}</span>
                            </div>
                            <div class="dimension-level">${evaluation.dimensionEvaluations.humor.level}</div>
                            <div class="dimension-desc">${evaluation.dimensionEvaluations.humor.desc}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="profile-section">
                <h3>📖 艺术家生涯后日谈</h3>
                <div class="epilogue-text">
                    ${evaluation.epilogue.map(line => `<p>${line}</p>`).join('')}
                </div>
            </div>
            
            <div class="profile-section">
                <h3>🏆 成就记录 (${achievements.length}项)</h3>
                <div class="achievements-grid">
                    ${achievements && achievements.length > 0 ? achievements.map(achievement => `
                        <div class="achievement-item">
                            <div class="emoji">🏆</div>
                            <div class="text">
                                <strong>${achievement.name || '未知成就'}</strong><br>
                                ${achievement.description || '暂无描述'}
                            </div>
                            <div class="day">第${achievement.dayObtained || achievement.day || '?'}天</div>
                        </div>
                    `).join('') : '<div class="empty-message">暂无成就，继续探索吧！</div>'}
                </div>
            </div>
            

        `;
        
        // 显示模态框
        modal.classList.remove('hidden');
        console.log('✅ 艺术家档案模态框已显示');
        
        // 绑定关闭按钮事件
        const closeBtn = document.getElementById('close-artist-profile');
        if (closeBtn) {
            closeBtn.onclick = closeArtistProfile;
        }
        
        // 绑定"消失在历史长河中"按钮事件
        const disappearBtn = document.getElementById('disappear-in-history');
        if (disappearBtn) {
            disappearBtn.onclick = disappearInHistory;
        }
        
        // 添加点击外部关闭功能
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeArtistProfile();
            }
        });
        
    } catch (error) {
        console.error('❌ 显示艺术家档案时出错:', error);
        showNotification('显示艺术家档案失败: ' + error.message, 'error');
    }
}

// 关闭艺术家档案
function closeArtistProfile() {
    const modal = document.getElementById('artist-profile-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// 消失在历史长河中
function disappearInHistory() {
    console.log('🌫️ 用户选择消失在历史长河中...');
    
    // 美学化的确认对话框
    const confirmed = confirm(`
🌫️ 消失在历史长河中

你确定要让这位艺术家的故事在此结束吗？

这个选择将会：
• 永久删除当前艺术家的所有记录
• 清除所有成就和数据
• 为新的艺术家让出舞台

一旦选择，就无法撤回。

是否确定？
    `);
    
    if (confirmed) {
        try {
            console.log('🗑️ 开始清除艺术家档案...');
            
            // 关闭档案窗口
            closeArtistProfile();
            
            // 显示消失动画
            showDisappearanceAnimation();
            
            // 延迟清除数据，让动画播放
            setTimeout(() => {
                // 完全清除所有数据
                clearAllGameData();
                
                // 重新开始游戏流程
                startNewArtistJourney();
                
                showNotification('一位艺术家消失在历史长河中，新的故事即将开始...', 'success');
            }, 3000);
            
        } catch (error) {
            console.error('❌ 消失流程执行失败:', error);
            showNotification('无法完成消失流程: ' + error.message, 'error');
        }
    }
}

// 显示消失动画
function showDisappearanceAnimation() {
    // 创建消失动画元素
    const disappearAnimation = document.createElement('div');
    disappearAnimation.id = 'disappear-animation';
    disappearAnimation.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, rgba(0,0,0,0.8), rgba(50,50,50,0.9));
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: center;
        animation: fadeIn 0.5s ease-in;
    `;
    
    disappearAnimation.innerHTML = `
        <div style="text-align: center; color: #ddd;">
            <div style="font-size: 4em; margin-bottom: 20px; animation: float 2s infinite;">🌫️</div>
            <h2 style="margin-bottom: 20px; opacity: 0.8;">艺术家正在消失...</h2>
            <p style="opacity: 0.6;">故事即将重新开始</p>
        </div>
    `;
    
    document.body.appendChild(disappearAnimation);
    
    // 3秒后移除动画
    setTimeout(() => {
        if (disappearAnimation && disappearAnimation.parentNode) {
            disappearAnimation.parentNode.removeChild(disappearAnimation);
        }
    }, 3000);
}

// 清除所有游戏数据
function clearAllGameData() {
    try {
        console.log('🗑️ 清除所有游戏数据...');
        
        // 清除localStorage
        localStorage.removeItem('gameState');
        localStorage.removeItem('hasPlayedBefore');
        localStorage.removeItem('archiveHistory');
        localStorage.removeItem('tutorialCompleted');
        localStorage.removeItem('playerSettings');
        
        // 重置游戏状态
        if (window.gameState) {
            window.gameState.resetGameState();
        }
        
        console.log('✅ 所有游戏数据已清除');
        
    } catch (error) {
        console.error('❌ 清除游戏数据失败:', error);
        throw error;
    }
}

// 开始新的艺术家旅程
function startNewArtistJourney() {
    try {
        console.log('🌱 开始新的艺术家旅程...');
        
        // 显示开场动画
        showIntroAnimation();
        
        // 3秒后显示玩家设定询问
        setTimeout(() => {
            showPlayerSetupQuestions();
        }, 3000);
        
    } catch (error) {
        console.error('❌ 开始新旅程失败:', error);
        throw error;
    }
}

// 防重复调用标志
let isShowingPlayerSetup = false;

// 显示玩家设定询问系统
function showPlayerSetupQuestions() {
    console.log('🎯 显示玩家设定询问系统');
    
    // 防重复调用检查
    if (isShowingPlayerSetup) {
        console.log('⚠️ 玩家设定界面已在显示中，忽略重复调用');
        return;
    }
    
    // 检查是否已经存在模态框，如果存在则移除
    const existingModal = document.getElementById('player-setup-modal');
    if (existingModal) {
        console.log('⚠️ 检测到已存在的玩家设定模态框，正在移除...');
        existingModal.remove();
    }
    
    // 设置标志防止重复调用
    isShowingPlayerSetup = true;
    
    // 创建询问界面
    const setupModal = document.createElement('div');
    setupModal.id = 'player-setup-modal';
    setupModal.className = 'modal';
    setupModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        z-index: 1000;
        display: flex;
        justify-content: center;
        align-items: center;
        animation: fadeIn 0.3s ease-in;
    `;
    
    setupModal.innerHTML = `
        <div class="setup-content" style="
            background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
            padding: 30px;
            border-radius: 15px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            color: #ddd;
            border: 2px solid #444;
        ">
            <h2 style="text-align: center; margin-bottom: 30px; color: #fff;">🎨 创建你的艺术家身份</h2>
            
            <div class="question-section" style="margin-bottom: 25px;">
                <h3>🌟 你的星座是？</h3>
                <div class="options-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; margin-top: 15px;">
                    <button class="option-btn" data-category="zodiac" data-value="earth">🌍 土象星座<br><small>稳重务实</small></button>
                    <button class="option-btn" data-category="zodiac" data-value="fire">🔥 火象星座<br><small>热情创新</small></button>
                    <button class="option-btn" data-category="zodiac" data-value="water">💧 水象星座<br><small>感性直觉</small></button>
                    <button class="option-btn" data-category="zodiac" data-value="air">💨 风象星座<br><small>理性沟通</small></button>
                </div>
            </div>
            
            <div class="question-section" style="margin-bottom: 25px;">
                <h3>🎭 你的艺术创作方向？</h3>
                <div class="options-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; margin-top: 15px;">
                    <button class="option-btn" data-category="direction" data-value="theoretical">📚 理论研究<br><small>深入思考</small></button>
                    <button class="option-btn" data-category="direction" data-value="experimental">⚗️ 实验艺术<br><small>探索创新</small></button>
                    <button class="option-btn" data-category="direction" data-value="social">🌍 社会参与<br><small>关注现实</small></button>
                    <button class="option-btn" data-category="direction" data-value="commercial">💰 商业艺术<br><small>实用导向</small></button>
                </div>
            </div>
            
            <div class="question-section" style="margin-bottom: 25px;">
                <h3>💭 你的创作理念？</h3>
                <div class="options-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; margin-top: 15px;">
                    <button class="option-btn" data-category="philosophy" data-value="critique">🗡️ 社会批判<br><small>揭示问题</small></button>
                    <button class="option-btn" data-category="philosophy" data-value="aesthetic">🌸 美学追求<br><small>艺术本身</small></button>
                    <button class="option-btn" data-category="philosophy" data-value="healing">🌿 治愈人心<br><small>积极影响</small></button>
                    <button class="option-btn" data-category="philosophy" data-value="humor">😄 幽默表达<br><small>轻松愉快</small></button>
                </div>
            </div>
            
            <div class="question-section" style="margin-bottom: 25px;">
                <h3>💪 你的个人特质？</h3>
                <div class="options-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; margin-top: 15px;">
                    <button class="option-btn" data-category="trait" data-value="perfectionist">🎯 完美主义<br><small>追求极致</small></button>
                    <button class="option-btn" data-category="trait" data-value="pragmatic">🔧 实用主义<br><small>讲求效果</small></button>
                    <button class="option-btn" data-category="trait" data-value="intuitive">🔮 直觉敏感<br><small>感知细腻</small></button>
                    <button class="option-btn" data-category="trait" data-value="social">🤝 社交达人<br><small>善于沟通</small></button>
                </div>
            </div>
            
            <div class="setup-actions" style="text-align: center; margin-top: 30px;">
                <button id="confirm-setup" style="
                    background: linear-gradient(135deg, #4a90e2, #357abd);
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 8px;
                    font-size: 1.1em;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                " disabled>
                    🚀 开始艺术家生涯
                </button>
                <p style="margin-top: 15px; font-size: 0.9em; opacity: 0.7;">
                    请完成所有选择后开始游戏
                </p>
            </div>
        </div>
    `;
    
    document.body.appendChild(setupModal);
    
    // 添加安全重置机制 - 如果30秒后界面还在但没有完成设置，自动重置标志
    setTimeout(() => {
        if (isShowingPlayerSetup && document.getElementById('player-setup-modal')) {
            console.log('⚠️ 玩家设定界面超时，自动重置防重复标志');
            isShowingPlayerSetup = false;
        }
    }, 30000);
    
    // 绑定选择事件
    bindSetupEvents();
}

// 绑定设定界面事件
function bindSetupEvents() {
    const setupModal = document.getElementById('player-setup-modal');
    const confirmBtn = document.getElementById('confirm-setup');
    
    if (!setupModal || !confirmBtn) {
        console.error('❌ 找不到玩家设定界面的关键元素');
        isShowingPlayerSetup = false; // 重置标志
        return;
    }
    
    const playerChoices = {};
    
    // 绑定选项按钮事件
    setupModal.addEventListener('click', (event) => {
        if (event.target.classList.contains('option-btn')) {
            const category = event.target.dataset.category;
            const value = event.target.dataset.value;
            
            // 清除同类别的其他选择
            const sameCategory = setupModal.querySelectorAll(`[data-category="${category}"]`);
            sameCategory.forEach(btn => btn.classList.remove('selected'));
            
            // 选中当前选项
            event.target.classList.add('selected');
            playerChoices[category] = value;
            
            // 检查是否所有选择都完成
            const requiredCategories = ['zodiac', 'direction', 'philosophy', 'trait'];
            const allSelected = requiredCategories.every(cat => playerChoices[cat]);
            
            if (allSelected) {
                confirmBtn.disabled = false;
                confirmBtn.style.opacity = '1';
            }
        }
    });
    
    // 确认设定
    confirmBtn.addEventListener('click', () => {
        console.log('📋 玩家选择:', playerChoices);
        
        // 根据选择调整初始数值
        applyPlayerChoices(playerChoices);
        
        // 保存玩家设定
        localStorage.setItem('playerChoices', JSON.stringify(playerChoices));
        localStorage.setItem('hasPlayedBefore', 'true');
        
        // 移除设定界面
        setupModal.remove();
        
        // 重置防重复标志
        isShowingPlayerSetup = false;
        
        // 显示新手引导
        setTimeout(() => {
            showTutorial();
        }, 500);
    });
}

// 根据玩家选择调整初始数值
function applyPlayerChoices(choices) {
    console.log('🎯 应用玩家选择的初始数值调整');
    
    const stats = {
        theory: 100,
        academic: 100,
        paradigm: 100,
        funding: 100,
        anxiety: 100,
        sarcasm: 100,
        reality: 100,
        humor: 100
    };
    
    // 星座影响
    switch (choices.zodiac) {
        case 'earth':
            stats.reality += 30;
            stats.funding += 20;
            stats.anxiety -= 10;
            stats.humor -= 5;
            break;
        case 'fire':
            stats.paradigm += 25;
            stats.humor += 20;
            stats.anxiety += 15;
            stats.theory -= 10;
            break;
        case 'water':
            stats.sarcasm += 25;
            stats.humor += 15;
            stats.anxiety += 20;
            stats.reality -= 10;
            break;
        case 'air':
            stats.theory += 25;
            stats.academic += 20;
            stats.sarcasm += 10;
            stats.funding -= 10;
            break;
    }
    
    // 创作方向影响
    switch (choices.direction) {
        case 'theoretical':
            stats.theory += 40;
            stats.academic += 30;
            stats.funding -= 20;
            stats.humor -= 15;
            break;
        case 'experimental':
            stats.paradigm += 35;
            stats.anxiety += 25;
            stats.reality -= 10;
            stats.funding -= 10;
            break;
        case 'social':
            stats.reality += 35;
            stats.sarcasm += 20;
            stats.theory += 10;
            stats.humor -= 10;
            break;
        case 'commercial':
            stats.funding += 40;
            stats.anxiety -= 15;
            stats.theory -= 20;
            stats.sarcasm -= 10;
            break;
    }
    
    // 创作理念影响
    switch (choices.philosophy) {
        case 'critique':
            stats.sarcasm += 30;
            stats.reality += 25;
            stats.theory += 15;
            stats.humor -= 10;
            break;
        case 'aesthetic':
            stats.theory += 25;
            stats.paradigm += 20;
            stats.funding -= 15;
            stats.sarcasm -= 10;
            break;
        case 'healing':
            stats.humor += 30;
            stats.anxiety -= 20;
            stats.reality += 15;
            stats.sarcasm -= 15;
            break;
        case 'humor':
            stats.humor += 35;
            stats.anxiety -= 25;
            stats.sarcasm += 15;
            stats.theory -= 10;
            break;
    }
    
    // 个人特质影响
    switch (choices.trait) {
        case 'perfectionist':
            stats.theory += 20;
            stats.anxiety += 30;
            stats.funding -= 10;
            stats.humor -= 15;
            break;
        case 'pragmatic':
            stats.funding += 25;
            stats.reality += 20;
            stats.paradigm -= 10;
            stats.humor -= 5;
            break;
        case 'intuitive':
            stats.paradigm += 25;
            stats.sarcasm += 20;
            stats.academic -= 15;
            stats.reality -= 10;
            break;
        case 'social':
            stats.academic += 25;
            stats.humor += 20;
            stats.anxiety -= 15;
            stats.theory -= 10;
            break;
    }
    
    // 确保数值不低于50，不高于300
    Object.keys(stats).forEach(key => {
        stats[key] = Math.max(50, Math.min(300, stats[key]));
    });
    
    // 应用到游戏状态
    if (window.gameState) {
        Object.keys(stats).forEach(key => {
            window.gameState.updateStats({[key]: stats[key] - 100}); // 减去基础值100
        });
    }
    
    console.log('📊 初始数值已调整:', stats);
    showNotification('🎨 你的艺术家身份已设定完成！', 'success');
}

// 生成艺术家评价文本
function generateArtistEvaluation(stats, achievements, day) {
    // 详细的维度评价系统
    const dimensionEvaluations = {
        theory: getTheoryEvaluation(stats.theory),
        academic: getAcademicEvaluation(stats.academic),
        paradigm: getParadigmEvaluation(stats.paradigm),
        funding: getFundingEvaluation(stats.funding),
        anxiety: getAnxietyEvaluation(stats.anxiety),
        sarcasm: getSarcasmEvaluation(stats.sarcasm),
        reality: getRealityEvaluation(stats.reality),
        humor: getHumorEvaluation(stats.humor)
    };
    
    // 计算总体评分
    const professionalScore = (stats.theory + stats.academic + stats.paradigm + stats.funding) / 4;
    const survivalScore = (stats.anxiety + stats.sarcasm + stats.reality + stats.humor) / 4;
    
    // 确定艺术家类型
    const artistType = determineArtistType(stats, achievements.length, day);
    
    // 生成后日谈式评价
    const epilogue = generateEpilogue(stats, achievements.length, day, artistType);
    
    return {
        artistType: artistType,
        professionalScore: Math.round(professionalScore),
        survivalScore: Math.round(survivalScore),
        dimensionEvaluations: dimensionEvaluations,
        epilogue: epilogue,
        specialAchievements: getSpecialAchievements(stats, achievements.length, day)
    };
}

// 理论深度评价
function getTheoryEvaluation(score) {
    if (score >= 800) return { level: "哲学大师", desc: "你的理论造诣已达到可以重新定义艺术本质的高度，各大美术馆争相邀请你做学术讲座。" };
    if (score >= 600) return { level: "理论专家", desc: "你能够熟练运用各种理论框架分析当代艺术现象，是艺术批评界的重要声音。" };
    if (score >= 400) return { level: "学术新秀", desc: "你已经掌握了扎实的理论基础，能够进行有深度的艺术思辨。" };
    if (score >= 200) return { level: "理论学徒", desc: "你正在努力构建自己的理论体系，时常在各种艺术理论中寻找灵感。" };
    if (score >= 100) return { level: "理论小白", desc: "你刚刚开始接触艺术理论，还在为各种抽象概念而头疼。" };
    return { level: "理论恐惧症", desc: "一看到艺术理论就头疼，更愿意用直觉和感受来理解艺术。" };
}

// 学术资本评价
function getAcademicEvaluation(score) {
    if (score >= 800) return { level: "学术教父", desc: "你在学术界的地位无人能撼动，一句话就能决定某个艺术家的命运。" };
    if (score >= 600) return { level: "学术精英", desc: "你拥有强大的学术网络，经常出现在各种重要的艺术活动中。" };
    if (score >= 400) return { level: "学术中坚", desc: "你在学术圈有一定的影响力，偶尔能获得一些重要的展览机会。" };
    if (score >= 200) return { level: "学术边缘人", desc: "你在学术圈的边缘游走，努力寻找自己的学术定位。" };
    if (score >= 100) return { level: "学术局外人", desc: "你对学术体系既向往又排斥，总是在犹豫要不要加入这个游戏。" };
    return { level: "反学术斗士", desc: "你对整个学术体系深感厌恶，决心要用自己的方式颠覆它。" };
}

// 范式突破评价
function getParadigmEvaluation(score) {
    if (score >= 800) return { level: "范式革命家", desc: "你的创作已经开创了全新的艺术范式，后来者都在模仿你的风格。" };
    if (score >= 600) return { level: "前卫先锋", desc: "你的作品总是走在时代前沿，让人看不懂但又深感震撼。" };
    if (score >= 400) return { level: "创新探索者", desc: "你不断尝试新的表达方式，偶尔会有让人眼前一亮的突破。" };
    if (score >= 200) return { level: "保守创新者", desc: "你在传统与创新之间小心翼翼地寻找平衡点。" };
    if (score >= 100) return { level: "传统继承者", desc: "你更愿意在既有的艺术传统中寻找表达的可能性。" };
    return { level: "模仿大师", desc: "你的作品总是让人想起某位著名艺术家，但这也未尝不是一种才能。" };
}

// 研究经费评价
function getFundingEvaluation(score) {
    if (score >= 800) return { level: "资本大亨", desc: "你已经不再为钱发愁，甚至开始资助其他艺术家的创作。" };
    if (score >= 600) return { level: "经费达人", desc: "你深谙各种申请经费的门道，总是能获得足够的创作资金。" };
    if (score >= 400) return { level: "资金管理师", desc: "你学会了如何在有限的资金下实现创作目标。" };
    if (score >= 200) return { level: "经费焦虑者", desc: "你总是在为下一个项目的资金而担忧，但还能勉强维持创作。" };
    if (score >= 100) return { level: "穷困艺术家", desc: "经济问题是你创作路上最大的障碍，但你仍在坚持。" };
    return { level: "破产边缘人", desc: "你已经在考虑是否要放弃艺术去找一份正经工作了。" };
}

// 焦虑指数评价
function getAnxietyEvaluation(score) {
    if (score >= 800) return { level: "焦虑艺术家", desc: "你的焦虑已经成为创作的重要素材，观众能从你的作品中感受到这种情绪的力量。" };
    if (score >= 600) return { level: "高度敏感者", desc: "你对周围的一切都极度敏感，这让你的创作充满了情感张力。" };
    if (score >= 400) return { level: "适度焦虑者", desc: "适度的焦虑让你保持对创作的紧迫感，但还不至于影响正常生活。" };
    if (score >= 200) return { level: "偶尔焦虑者", desc: "你偶尔会因为创作或生活问题而感到焦虑，但很快就能调整过来。" };
    if (score >= 100) return { level: "佛系艺术家", desc: "你总是能保持内心的平静，不容易被外界的变化所影响。" };
    return { level: "超然存在", desc: "你已经达到了一种超脱的境界，仿佛什么都不能让你焦虑。" };
}

// 讽刺值评价
function getSarcasmEvaluation(score) {
    if (score >= 800) return { level: "讽刺大师", desc: "你的每一句话都充满了尖锐的讽刺，让人又爱又怕。你的作品是对当代艺术界最犀利的批判。" };
    if (score >= 600) return { level: "毒舌艺术家", desc: "你总是能一针见血地指出艺术界的荒谬之处，虽然有时会得罪人，但大家都很佩服你的洞察力。" };
    if (score >= 400) return { level: "幽默批判者", desc: "你善于用幽默的方式表达对现实的不满，让人在笑声中思考。" };
    if (score >= 200) return { level: "偶尔毒舌", desc: "你偶尔会说出一些讽刺的话，但大多数时候还是比较温和的。" };
    if (score >= 100) return { level: "温和批评者", desc: "你更愿意用温和的方式表达不同意见，很少使用讽刺的语言。" };
    return { level: "纯真艺术家", desc: "你对世界保持着一颗纯真的心，很少使用讽刺的表达方式。" };
}

// 现实感评价
function getRealityEvaluation(score) {
    if (score >= 800) return { level: "现实主义大师", desc: "你对现实有着深刻的理解和洞察，作品总是能准确反映当代社会的真实面貌。" };
    if (score >= 600) return { level: "社会观察家", desc: "你是一个敏锐的社会观察者，能够捕捉到别人忽视的现实细节。" };
    if (score >= 400) return { level: "现实关注者", desc: "你关注现实问题，但还在寻找表达这些关注的最佳方式。" };
    if (score >= 200) return { level: "现实游离者", desc: "你时常在现实和理想之间游移，还在寻找自己的立场。" };
    if (score >= 100) return { level: "理想主义者", desc: "你更愿意关注理想和美好，对现实的残酷有些抗拒。" };
    return { level: "梦幻艺术家", desc: "你生活在自己构建的艺术世界中，很少考虑现实的限制。" };
}

// 幽默度评价
function getHumorEvaluation(score) {
    if (score >= 800) return { level: "喜剧天才", desc: "你的作品总是能让人会心一笑，即使在讨论严肃话题时也能保持轻松的氛围。" };
    if (score >= 600) return { level: "幽默大师", desc: "你善于在艺术中融入幽默元素，让观众在轻松的氛围中获得深刻的思考。" };
    if (score >= 400) return { level: "风趣艺术家", desc: "你的作品和言谈中经常能见到有趣的元素，让人印象深刻。" };
    if (score >= 200) return { level: "偶尔幽默", desc: "你偶尔会展现出幽默的一面，但大多数时候还是比较严肃的。" };
    if (score >= 100) return { level: "严肃艺术家", desc: "你认为艺术是严肃的事业，很少在作品中使用幽默元素。" };
    return { level: "苦大仇深型", desc: "你的作品总是充满了沉重的情感，很少有轻松的时刻。" };
}

// 确定艺术家类型
function determineArtistType(stats, achievementCount, day) {
    const total = Object.values(stats).reduce((sum, val) => sum + val, 0);
    const avg = total / 8;
    
    if (stats.theory > 600 && stats.academic > 500) return "学院派理论家";
    if (stats.paradigm > 600 && stats.sarcasm > 500) return "前卫批判艺术家";
    if (stats.funding > 700 && stats.reality > 500) return "商业艺术家";
    if (stats.anxiety > 600 && stats.humor < 200) return "焦虑表现主义者";
    if (stats.sarcasm > 700 && stats.humor > 500) return "讽刺幽默大师";
    if (stats.reality > 600 && stats.paradigm > 500) return "社会现实主义艺术家";
    if (avg > 500) return "全能型艺术家";
    if (avg > 300) return "成长中的艺术家";
    return "探索阶段的艺术新人";
}

// 生成后日谈
function generateEpilogue(stats, achievementCount, day, artistType) {
    const epilogues = {
        "学院派理论家": [
            `经过${day}天的学术磨练，你已经成为了艺术理论界的重要声音。`,
            `你的论文被广泛引用，学生们总是为你的课程而疯狂。`,
            `虽然有时会被批评过于学术化，但你坚信理论的力量能够改变艺术的未来。`,
            `在某个静谧的午后，你正在构思下一个改变艺术史的理论框架...`
        ],
        "前卫批判艺术家": [
            `${day}天的创作历程让你成为了艺术界最具争议的声音。`,
            `你的作品总是能引发激烈的讨论，支持者和反对者都同样热情。`,
            `画廊老板既爱又怕你，因为你的作品既能带来关注，也可能带来麻烦。`,
            `你继续用你的方式挑战着艺术界的每一个既定规则...`
        ],
        "商业艺术家": [
            `经过${day}天的摸爬滚打，你已经找到了艺术与商业的完美平衡点。`,
            `你的作品既有艺术价值，又有市场价值，这让你在艺术界独树一帜。`,
            `虽然偶尔会被质疑过于商业化，但你相信艺术需要经济基础才能持续发展。`,
            `你正在计划下一个既能表达自己又能获得成功的项目...`
        ],
        "焦虑表现主义者": [
            `${day}天的创作之路充满了焦虑和挣扎，但这些情绪成为了你最宝贵的创作素材。`,
            `你的作品充满了情感的张力，观众能从中感受到当代人的精神状态。`,
            `虽然创作过程痛苦，但你发现痛苦本身就是一种表达方式。`,
            `在某个失眠的夜晚，你又开始了新的创作，焦虑依然是你最忠实的伙伴...`
        ],
        "讽刺幽默大师": [
            `${day}天的观察和思考让你成为了艺术界最犀利的批评家。`,
            `你的作品总是能让人在笑声中思考，在思考中感到不安。`,
            `你用幽默包装尖锐的批判，让人们在娱乐中接受你的观点。`,
            `你继续用你独特的方式解构着这个荒诞的艺术世界...`
        ],
        "社会现实主义艺术家": [
            `${day}天的社会观察让你成为了当代现实的忠实记录者。`,
            `你的作品总是能准确反映社会的真实面貌，引起广泛的共鸣。`,
            `你相信艺术的社会责任，用作品为那些被忽视的声音发声。`,
            `你正在计划下一个关注社会议题的重要项目...`
        ],
        "全能型艺术家": [
            `经过${day}天的全面发展，你已经成为了艺术界的多面手。`,
            `你在各个方面都有不错的表现，这让你能够应对各种艺术挑战。`,
            `虽然有时会被质疑不够专精，但你相信艺术家应该保持多元化的发展。`,
            `你继续在各个领域探索，寻找属于自己的独特表达方式...`
        ],
        "成长中的艺术家": [
            `${day}天的成长历程虽然还在继续，但你已经找到了自己的发展方向。`,
            `你在各个维度上都有所进步，这让你对未来充满信心。`,
            `虽然还有很多需要学习的地方，但你享受这个成长的过程。`,
            `你正在为成为更好的艺术家而持续努力...`
        ],
        "探索阶段的艺术新人": [
            `虽然只有${day}天的经历，但你已经踏上了艺术家的道路。`,
            `你还在探索自己的风格和方向，每一天都是新的发现。`,
            `虽然经验还不足，但你的热情和好奇心是最宝贵的财富。`,
            `你继续在艺术的海洋中探索，寻找属于自己的岸...`
        ]
    };
    
    return epilogues[artistType] || ["你正在书写属于自己的艺术人生..."];
}

// 获取特殊成就
function getSpecialAchievements(stats, achievementCount, day) {
    const special = [];
    
    if (stats.theory >= 800) special.push("🎓 理论大师");
    if (stats.academic >= 800) special.push("🏛️ 学术权威");
    if (stats.paradigm >= 800) special.push("🚀 范式革命者");
    if (stats.funding >= 800) special.push("💰 财务自由");
    if (stats.anxiety >= 800) special.push("😰 焦虑艺术家");
    if (stats.sarcasm >= 800) special.push("🗡️ 讽刺大师");
    if (stats.reality >= 800) special.push("🌍 现实主义者");
    if (stats.humor >= 800) special.push("😄 幽默天才");
    
    if (achievementCount >= 20) special.push("🏆 成就收集家");
    if (day >= 100) special.push("⏰ 时间大师");
    
    const total = Object.values(stats).reduce((sum, val) => sum + val, 0);
    if (total >= 5000) special.push("🌟 传奇艺术家");
    
    return special;
}

// 开场动画
function showIntroAnimation() {
    console.log('🎬 显示开场动画...');
    
    const introElement = document.getElementById('intro-animation');
    if (!introElement) return;
    
    // 显示开场动画
    introElement.classList.remove('hidden');
    introElement.classList.remove('fade-out');
    
    // 隐藏动画的函数
    const hideAnimation = () => {
        console.log('👆 用户点击开场，开始隐藏动画');
        introElement.classList.add('fade-out');
        
        setTimeout(() => {
            introElement.classList.add('hidden');
            introElement.removeEventListener('click', hideAnimation);
            
            // 根据是否是新用户决定下一步
            const hasPlayedBefore = localStorage.getItem('hasPlayedBefore');
            if (!hasPlayedBefore) {
                // 新用户：显示玩家设定询问
                setTimeout(() => {
                    showPlayerSetupQuestions();
                }, 500);
            } else {
                // 老用户：显示新手引导
                setTimeout(() => {
                    showTutorial();
                }, 500);
            }
        }, 1000);
    };
    
    // 添加点击事件监听器（只能点击消失，不自动消失）
    introElement.addEventListener('click', hideAnimation, { once: true });
}

// 新手引导相关
function checkTutorial() {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    const hasSetupProfile = localStorage.getItem('playerChoices');
    
    console.log('🎯 检查教程状态:', { hasSeenTutorial, hasSetupProfile });
    
    if (!hasSeenTutorial) {
        console.log('📚 显示新手教程');
        showTutorial();
    } else if (!hasSetupProfile) {
        console.log('📋 显示调查问卷');
        // 如果看过教程但没有设置档案，直接显示调查问卷
        setTimeout(() => {
            showPlayerSetupQuestions();
        }, 500);
    } else {
        console.log('✅ 用户已完成所有初始化');
    }
}

function showTutorial() {
    const modal = document.getElementById('tutorial-overlay');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function bindTutorialEvents() {
    // 关闭按钮
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeTutorial);
    }
    
    // 开始游戏按钮
    const startBtn = document.getElementById('start-game');
    if (startBtn) {
        startBtn.addEventListener('click', closeTutorial);
    }
    
    // 跳过教程按钮
    const skipBtn = document.getElementById('skip-tutorial');
    if (skipBtn) {
        skipBtn.addEventListener('click', () => {
            console.log('🏃‍♂️ 用户跳过教程');
            closeTutorial();
            // 跳过教程后直接显示调查问卷
            setTimeout(() => {
                showPlayerSetupQuestions();
            }, 500);
        });
    }
    
    // 点击外部关闭
    const modal = document.getElementById('tutorial-overlay');
    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeTutorial();
            }
        });
    }
}

function closeTutorial() {
    const modal = document.getElementById('tutorial-overlay');
    if (modal) {
        modal.classList.add('hidden');
        localStorage.setItem('hasSeenTutorial', 'true');
        
        // 教程结束后检查是否需要显示调查问卷
        const hasSetupProfile = localStorage.getItem('playerChoices');
        if (!hasSetupProfile) {
            console.log('📋 教程结束，显示调查问卷');
            setTimeout(() => {
                showPlayerSetupQuestions();
            }, 500);
        }
    }
}

// 动作日志系统
function initializeActionLog() {
    console.log('📋 初始化动作日志系统...');
    
    const logToggle = document.getElementById('log-toggle');
    const actionLog = document.getElementById('action-log');
    
    if (logToggle && actionLog) {
        logToggle.addEventListener('click', toggleActionLog);
    }
}

function toggleActionLog() {
    const actionLog = document.getElementById('action-log');
    const logToggle = document.getElementById('log-toggle');
    
    if (actionLog && logToggle) {
        actionLog.classList.toggle('collapsed');
        logToggle.textContent = actionLog.classList.contains('collapsed') ? '+' : '─';
    }
}

function showActionLog(actionData, category, type = 'info', customMessage = null) {
    console.log('📋 显示动作日志:', { actionData, category, type, customMessage });
    
    const logContent = document.getElementById('log-content');
    if (!logContent) return;
    
    const timestamp = new Date().toLocaleTimeString('zh-CN', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
    
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    
    let actionMessage;
    if (customMessage) {
        actionMessage = customMessage;
    } else if (actionData) {
        const categoryNames = {
            'spaces': '🏛️ 研究场域',
            'preparations': '📚 专业准备', 
            'projects': '🎨 项目研究',
            'income': '💰 筹措经费'
        };
        
        actionMessage = `正在进入 <span class="action-name">${actionData.name}</span>`;
        
        // 添加描述
        if (actionData.description) {
            actionMessage += `<br><small>${actionData.description}</small>`;
        }
        
        // 添加效果变化
        if (actionData.effects) {
            const effectsText = Object.entries(actionData.effects)
                .filter(([stat, value]) => value !== 0)
                .map(([stat, value]) => {
                    const className = value > 0 ? 'positive' : 'negative';
                    const sign = value > 0 ? '+' : '';
                    return `<span class="effect-change ${className}">${formatStatName(stat)} ${sign}${value}</span>`;
                })
                .join(' ');
            
            if (effectsText) {
                actionMessage += `<br>${effectsText}`;
            }
        }
        
        // 添加注释
        if (actionData.sarcastic_comment) {
            actionMessage += `<br><small style="opacity: 0.7; font-style: italic;">💬 ${actionData.sarcastic_comment}</small>`;
        }
    }
    
    logEntry.innerHTML = `
        <div class="log-time">${timestamp}</div>
        <div class="log-action">${actionMessage}</div>
    `;
    
    // 添加到日志容器开头
    logContent.insertBefore(logEntry, logContent.firstChild);
    
    // 限制日志条目数量（最多保留20条）
    const entries = logContent.querySelectorAll('.log-entry');
    if (entries.length > 20) {
        for (let i = 20; i < entries.length; i++) {
            entries[i].remove();
        }
    }
    
    // 自动滚动到最新条目
    logContent.scrollTop = 0;
}

// 通知系统
function showNotification(message, type = 'info') {
    console.log(`📢 通知: ${message} (${type})`);
    
    const container = document.getElementById('notification-container');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    // 显示动画
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });
    
    // 自动移除
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// 工具函数
function formatStatName(stat) {
    const statNames = {
        theory: '理论深度',
        academic: '学术资本',
        paradigm: '范式突破',
        funding: '研究经费',
        anxiety: '焦虑指数',
        sarcasm: '讽刺值',
        reality: '现实感',
        humor: '幽默度'
    };
    return statNames[stat] || stat;
}

function getStatColor(stat) {
    const statColors = {
        theory: '#8ab4f8',      // 蓝色 - 理论深度
        academic: '#f8bbd9',    // 粉色 - 学术资本
        paradigm: '#81c995',    // 绿色 - 范式突破
        funding: '#fdd663',     // 黄色 - 研究经费
        anxiety: '#f28b82',     // 红色 - 焦虑指数
        sarcasm: '#ce93d8',     // 紫色 - 讽刺值
        reality: '#90caf9',     // 浅蓝 - 现实感
        humor: '#a5d6a7'       // 浅绿 - 幽默度
    };
    return statColors[stat] || '#ccc';
}

// 错误处理
window.addEventListener('error', function(event) {
    console.error('❌ 全局错误:', event.error);
    showNotification('发生了意外错误，请刷新页面', 'error');
});

// 导出全局函数供调试使用
window.gameDebug = {
    gameState: () => gameState,
    contentLoader: () => contentLoader,
    eventSystem: () => eventSystem,
    showStats: () => console.table(gameState.getStats()),
    showAchievements: () => console.table(gameState.getAchievements())
};

console.log('🎮 main.js 加载完成');