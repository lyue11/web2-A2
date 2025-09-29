// 搜索页面JavaScript逻辑 - 美观版

let allEvents = []; // 存储所有活动数据
let currentSearchType = 'keyword'; // 当前搜索类型

document.addEventListener('DOMContentLoaded', function() {
    loadCategories();
    setupEventListeners();
    setupTabSwitching();
    loadAllEvents(); // 预加载所有活动数据
});

// 设置标签页切换
function setupTabSwitching() {
    const tabs = document.querySelectorAll('.search-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // 更新活跃标签
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // 显示对应的内容
            document.querySelectorAll('.search-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${targetTab}-search`).classList.add('active');
            
            currentSearchType = targetTab;
        });
    });
}

// 加载所有活动数据
async function loadAllEvents() {
    try {
        const response = await fetch(`${API_BASE_URL}/events`);
        const result = await response.json();
        
        if (result.success) {
            allEvents = result.data;
            updateSearchStats(`已加载 ${allEvents.length} 个活动`);
            updateResultsCount(allEvents.length);
        }
    } catch (error) {
        console.error('加载活动数据失败:', error);
        updateSearchStats('活动数据加载失败');
    }
}

// 加载分类选项
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const result = await response.json();
        
        if (result.success) {
            populateCategorySelect(result.data);
        }
    } catch (error) {
        console.error('加载分类失败:', error);
    }
}

// 填充分类下拉菜单
function populateCategorySelect(categories) {
    const categorySelect = document.getElementById('category');
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
}

// 设置事件监听器
function setupEventListeners() {
    const searchForm = document.getElementById('search-form');
    const keywordSearchForm = document.getElementById('keyword-search-form');
    const clearBtn = document.getElementById('clear-btn');
    const showUpcomingBtn = document.getElementById('show-upcoming-btn');
    const showAllBtn = document.getElementById('show-all-btn');
    
    searchForm.addEventListener('submit', handleAdvancedSearch);
    keywordSearchForm.addEventListener('submit', handleKeywordSearch);
    clearBtn.addEventListener('click', clearFilters);
    showUpcomingBtn.addEventListener('click', showUpcomingEvents);
    showAllBtn.addEventListener('click', showAllEvents);
}

// 处理关键词搜索
async function handleKeywordSearch(event) {
    event.preventDefault();
    
    const keyword = document.getElementById('keyword').value.trim();
    
    if (!keyword) {
        alert('请输入搜索关键词');
        return;
    }
    
    await performKeywordSearch(keyword);
}

// 执行关键词搜索
async function performKeywordSearch(keyword) {
    try {
        showElement('search-loading');
        hideElement('search-error');
        hideElement('no-results');
        
        // 在前端进行关键词过滤
        const filteredEvents = allEvents.filter(event => 
            event.title.toLowerCase().includes(keyword.toLowerCase()) ||
            event.description.toLowerCase().includes(keyword.toLowerCase()) ||
            event.category_name.toLowerCase().includes(keyword.toLowerCase())
        );
        
        updateSearchStats(`找到 ${filteredEvents.length} 个包含"${keyword}"的活动`);
        updateResultsCount(filteredEvents.length);
        displaySearchResults(filteredEvents);
        
    } catch (error) {
        console.error('关键词搜索失败:', error);
        showError('search-error', `搜索失败: ${error.message}`);
    } finally {
        hideElement('search-loading');
    }
}

// 处理高级搜索
async function handleAdvancedSearch(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const searchCriteria = {
        category: formData.get('category'),
        location: formData.get('location'),
        date: formData.get('date')
    };
    
    await performAdvancedSearch(searchCriteria);
}

// 执行高级搜索
async function performAdvancedSearch(criteria) {
    try {
        showElement('search-loading');
        hideElement('search-error');
        hideElement('no-results');
        
        // 构建查询参数
        const params = new URLSearchParams();
        if (criteria.category) params.append('category', criteria.category);
        if (criteria.location) params.append('location', criteria.location);
        if (criteria.date) params.append('date', criteria.date);
        
        const response = await fetch(`${API_BASE_URL}/events/search?${params}`);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || '搜索失败');
        }
        
        let criteriaText = [];
        if (criteria.category) criteriaText.push(`类别: ${criteria.category}`);
        if (criteria.location) criteriaText.push(`地点: ${criteria.location}`);
        if (criteria.date) criteriaText.push(`日期: ${criteria.date}`);
        
        const criteriaString = criteriaText.length > 0 ? ` (${criteriaText.join(', ')})` : '';
        updateSearchStats(`找到 ${result.data.length} 个活动${criteriaString}`);
        updateResultsCount(result.data.length);
        displaySearchResults(result.data);
        
    } catch (error) {
        console.error('高级搜索失败:', error);
        showError('search-error', `搜索失败: ${error.message}`);
    } finally {
        hideElement('search-loading');
    }
}

// 显示所有未发生活动
async function showUpcomingEvents() {
    try {
        showElement('search-loading');
        hideElement('search-error');
        hideElement('no-results');
        
        const today = new Date().toISOString().split('T')[0]; // 获取今天日期 YYYY-MM-DD
        
        // 在前端过滤未发生活动
        const upcomingEvents = allEvents.filter(event => 
            event.event_date >= today && event.is_active
        );
        
        updateSearchStats(`找到 ${upcomingEvents.length} 个未发生活动`);
        updateResultsCount(upcomingEvents.length);
        displaySearchResults(upcomingEvents);
        
    } catch (error) {
        console.error('获取未发生活动失败:', error);
        showError('search-error', `获取失败: ${error.message}`);
    } finally {
        hideElement('search-loading');
    }
}

// 显示所有活动
async function showAllEvents() {
    try {
        showElement('search-loading');
        hideElement('search-error');
        hideElement('no-results');
        
        updateSearchStats(`显示所有 ${allEvents.length} 个活动`);
        updateResultsCount(allEvents.length);
        displaySearchResults(allEvents);
        
    } catch (error) {
        console.error('获取所有活动失败:', error);
        showError('search-error', `获取失败: ${error.message}`);
    } finally {
        hideElement('search-loading');
    }
}

// 显示搜索结果
function displaySearchResults(events) {
    const container = document.getElementById('search-results');
    const noResults = document.getElementById('no-results');
    
    if (events.length === 0) {
        container.innerHTML = '';
        showElement('no-results');
        return;
    }
    
    hideElement('no-results');
    
    const eventsHTML = events.map(event => {
        const isUpcoming = new Date(event.event_date) >= new Date();
        const dateBadge = isUpcoming ? 
            `<span style="background: #27ae60; color: white; padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.8rem;">即将开始</span>` :
            `<span style="background: #7f8c8d; color: white; padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.8rem;">已结束</span>`;
        
        return `
        <div class="event-card">
            <img src="${event.image_url}" alt="${event.title}" class="event-image" onerror="this.src='/images/placeholder.jpg'">
            <div class="event-content">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                    <h3 class="event-title">${event.title}</h3>
                    ${dateBadge}
                </div>
                <div class="event-meta">
                    <span>📅 ${formatDate(event.event_date)}</span>
                    <span>📍 ${event.location}</span>
                </div>
                <div class="event-category">${event.category_name}</div>
                <p class="event-description">${event.description}</p>
                <div class="event-meta">
                    <span>🎯 目标: $${event.fundraising_goal}</span>
                    <span>💰 已筹: $${event.current_amount}</span>
                </div>
                <a href="#" class="event-details-link" onclick="goToEventDetails(${event.id}); return false;">查看详情</a>
            </div>
        </div>
        `;
    }).join('');
    
    container.innerHTML = eventsHTML;
}

// 清除筛选条件
function clearFilters() {
    document.getElementById('search-form').reset();
    document.getElementById('keyword').value = '';
    document.getElementById('search-results').innerHTML = '';
    hideElement('no-results');
    hideElement('search-error');
    updateSearchStats('筛选条件已清除');
    updateResultsCount(0);
}

// 更新搜索统计信息
function updateSearchStats(text) {
    document.getElementById('search-stats-text').textContent = text;
}

// 更新结果计数
function updateResultsCount(count) {
    const countElement = document.getElementById('results-count');
    countElement.textContent = `${count} 个结果`;
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);