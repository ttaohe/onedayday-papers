// 主应用逻辑

const APP = {
    papersData: [],
    filteredPapers: [],

    async init() {
        await this.loadPapers();
        this.populateDateFilter();
        this.bindEvents();
        this.renderPapers();
    },

    async loadPapers() {
        try {
            const response = await fetch('data/papers.json');
            const data = await response.json();
            this.papersData = data.papers || [];
            this.filteredPapers = [...this.papersData];
        } catch (error) {
            console.error('加载失败:', error);
            document.getElementById('papersList').innerHTML =
                '<div class="empty-state">加载失败，请稍后刷新重试</div>';
        }
    },

    populateDateFilter() {
        const dates = [...new Set(this.papersData.map(p => p.date))].sort().reverse();
        const select = document.getElementById('dateFilter');

        dates.forEach(date => {
            const option = document.createElement('option');
            option.value = date;
            option.textContent = date;
            select.appendChild(option);
        });
    },

    bindEvents() {
        document.getElementById('dateFilter').addEventListener('change', (e) => {
            this.filterByDate(e.target.value);
        });

        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterBySearch(e.target.value);
        });
    },

    filterByDate(date) {
        if (date === 'all') {
            this.filteredPapers = [...this.papersData];
        } else {
            this.filteredPapers = this.papersData.filter(p => p.date === date);
        }
        this.renderPapers();
    },

    filterBySearch(query) {
        const q = query.toLowerCase();
        if (!q) {
            this.filterByDate(document.getElementById('dateFilter').value);
            return;
        }

        this.filteredPapers = this.papersData.filter(p =>
            p.title.toLowerCase().includes(q) ||
            (p.keywords && p.keywords.some(k => k.toLowerCase().includes(q))) ||
            (Papers.content && p.content.toLowerCase().includes(q))
        );
        this.renderPapers();
    },

    renderPapers() {
        const container = document.getElementById('papersList');

        if (this.filteredPapers.length === 0) {
            container.innerHTML = '<div class="empty-state">没有找到匹配的论文</div>';
            return;
        }

        container.innerHTML = this.filteredPapers.map(paper => this.renderPaper(paper)).join('');
    },

    renderPaper(paper) {
        const md = window.markdownit();
        md.use(obsidianPlugin);

        return `
            <div class="paper-card">
                <div class="paper-date">${paper.date}</div>
                <h2 class="paper-title">
                    <a href="papers/${paper.date}.html">${paper.title}</a>
                </h2>
                <div class="paper-authors">${paper.authors || ''}</div>
                <div class="paper-content">
                    ${md.render(paper.summary || '')}
                </div>
            </div>
        `;
    }
};

// 初始化 markdown-it
window.markdownit = window.markdownit || markdownit;

document.addEventListener('DOMContentLoaded', () => {
    APP.init();
});
