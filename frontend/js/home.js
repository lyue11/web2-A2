// 首页JavaScript逻辑 - 增强版

let currentEvents = [];

document.addEventListener('DOMContentLoaded', function() {
    loadEvents();
    setupRealTimeStats();
});

async function loadEvents() {
    try {
        showElement('events-loading');
        hideElement('events-error');
        
        const result = await apiCall(`${API_BASE_URL}/events`);
        
        if (result.success && result.data.length > 0) {
            currentEvents = result.data;
            displayEvents(currentEvents);
            updateRealTimeStats(currentEvents);
        } else {
            showError('events-container', '暂无活动数据，请稍后刷新重试');
        }
        
    } catch (error) {
        console.error('加载活动失败:', error);
        showError('events-error', `加载失败: ${error.message}`);
    } finally {
        hideElement('events-loading');
    }
}

function displayEvents(events) {
    const container = document.getElementById('events-container');
    
    const eventsHTML = events.map(event => {
        const status = getEventStatus(event);
        return `
        <div class="event-card">
            <img src="${event.image_url}" alt="${event.title}" class="event-image" 
                 onerror="this.src='/images/placeholder.jpg'" loading="lazy">
            <div class="event-content">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                    <h3 class="event-title">${event.title}</h3>
                    <span style="${status.style} padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.8rem;">
                        ${status.text}
                    </span>
                </div>
                <div class="event-meta">
                    <span>📅 ${formatDate(event.event_date)}</span>
                    <span>📍 ${event.location}</span>
                </div>
                <div class="event-category">${event.category_name}</div>
                <p class="event-description">${event.description}</p>
                <div class="event-meta">
                    <span>🎯 目标: $${event.fundraising_goal?.toLocaleString() || '0'}</span>
                    <span>💰 已筹: $${event.current_amount?.toLocaleString() || '0'}</span>
                </div>
                <a href="#" class="event-details-link" onclick="goToEventDetails(${event.id}); return false;">查看详情</a>
            </div>
        </div>
        `;
    }).join('');
    
    container.innerHTML = eventsHTML;
}

function getEventStatus(event) {
    const eventDate = new Date(event.event_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (eventDate < today) {
        return { text: '已结束', style: 'background: #7f8c8d; color: white;' };
    } else if (eventDate.getTime() === today.getTime()) {
        return { text: '今天', style: 'background: #e74c3c; color: white;' };
    } else if ((eventDate - today) / (1000 * 60 * 60 * 24) <= 7) {
        return { text: '即将开始', style: 'background: #f39c12; color: white;' };
    } else {
        return { text: '即将开始', style: 'background: #27ae60; color: white;' };
    }
}

function setupRealTimeStats() {
    // 可以添加实时统计更新功能
    setInterval(() => {
        if (currentEvents.length > 0) {
            updateRealTimeStats(currentEvents);
        }
    }, 30000); // 每30秒更新一次
}

function updateRealTimeStats(events) {
    const totalRaised = events.reduce((sum, event) => sum + (parseFloat(event.current_amount) || 0), 0);
    const totalGoal = events.reduce((sum, event) => sum + (parseFloat(event.fundraising_goal) || 0), 0);
    const upcomingEvents = events.filter(event => new Date(event.event_date) >= new Date()).length;
    
    // 可以在这里更新页面上的实时统计信息
    console.log(`实时统计 - 总筹款: $${totalRaised.toLocaleString()}, 即将开始活动: ${upcomingEvents}个`);
}

// 添加页面可见性检测，当页面重新获得焦点时刷新数据
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        loadEvents();
    }
});