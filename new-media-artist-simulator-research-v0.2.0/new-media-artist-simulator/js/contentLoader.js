class ContentLoader {
    constructor() {
        this.spaces = [];
        this.preparations = [];
        this.projects = [];
        this.events = [];
    }

    async loadAllContent() {
        try {
            const [spacesData, prepsData, projectsData, eventsData] = await Promise.all([
                this.loadJSON('./content/spaces/spaces.json'),
                this.loadJSON('./content/preparations/preparations.json'),
                this.loadJSON('./content/projects/projects.json'),
                this.loadJSON('./content/events/events.json')
            ]);

            this.spaces = spacesData || [];
            this.preparations = prepsData || [];
            this.projects = projectsData || [];
            this.events = eventsData || [];

            this.renderContent();
        } catch (error) {
            console.error('加载内容出错:', error);
            this.showError(error);
        }
    }

    async loadJSON(path) {
        try {
            console.log('尝试加载文件:', path);
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Failed to load ${path}: ${response.statusText}`);
            }
            const text = await response.text(); // 先获取文本内容
            console.log('文件内容:', text); // 打印原始内容
            try {
                const data = JSON.parse(text); // 尝试解析JSON
                console.log('成功加载文件:', path, data);
                return data;
            } catch (parseError) {
                console.error('JSON解析错误:', parseError);
                throw new Error(`JSON解析错误: ${parseError.message}\n原始内容: ${text}`);
            }
        } catch (error) {
            console.error('加载JSON文件失败:', path, error);
            throw error;
        }
    }

    showError(error) {
        const containers = ['spaces-grid', 'research-grid', 'projects-grid'];
        const errorHTML = `
            <div class="error-message" style="color: red; padding: 20px; margin: 10px; border: 1px solid red; border-radius: 5px;">
                <h3>加载内容出错</h3>
                <p>可能的原因：</p>
                <ol>
                    <li>文件路径错误</li>
                    <li>JSON格式不正确</li>
                    <li>服务器未正确运行</li>
                </ol>
                <p>详细错误信息：</p>
                <pre style="background: #f8f8f8; padding: 10px; overflow-x: auto;">${error.message}</pre>
            </div>
        `;

        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = errorHTML;
            }
        });
    }

    renderContent() {
        this.renderSpaces();
        this.renderPreparations();
        this.renderProjects();
    }

    renderSpaces() {
        const container = document.getElementById('spaces-grid');
        if (!container) return;

        if (this.spaces && this.spaces.length > 0) {
            container.innerHTML = this.spaces.map(space => `
                <div class="card" data-id="${space.id}">
                    <h3>${space.name}</h3>
                    <p>${space.description}</p>
                    ${this.renderActivities(space.activities)}
                </div>
            `).join('');
        } else {
            container.innerHTML = '<div class="empty-message">暂无可用地点</div>';
        }
    }

    renderActivities(activities) {
        if (!activities || !activities.length) return '';
        return `
            <div class="activities">
                ${activities.map(activity => `
                    <div class="activity">
                        <h4>${activity.name}</h4>
                        <p>${activity.description}</p>
                        ${this.renderEffects(activity.effects)}
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderEffects(effects) {
        if (!effects) return '';
        return `
            <div class="effects">
                ${Object.entries(effects).map(([stat, value]) => `
                    <div class="effect ${value > 0 ? 'positive' : 'negative'}">
                        ${stat}: ${value > 0 ? '+' : ''}${value}
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderPreparations() {
        const container = document.getElementById('research-grid');
        if (!container) return;

        if (this.preparations && this.preparations.length > 0) {
            container.innerHTML = this.preparations.map(prep => `
                <div class="card" data-id="${prep.id}">
                    <h3>${prep.name}</h3>
                    <p>${prep.description}</p>
                    ${this.renderEffects(prep.effects)}
                </div>
            `).join('');
        } else {
            container.innerHTML = '<div class="empty-message">暂无可用研究</div>';
        }
    }

    renderProjects() {
        const container = document.getElementById('projects-grid');
        if (!container) return;

        if (this.projects && this.projects.length > 0) {
            container.innerHTML = this.projects.map(project => `
                <div class="card" data-id="${project.id}">
                    <h3>${project.name}</h3>
                    <p>${project.description}</p>
                    ${this.renderEffects(project.effects)}
                </div>
            `).join('');
        } else {
            container.innerHTML = '<div class="empty-message">暂无可用项目</div>';
        }
    }
}