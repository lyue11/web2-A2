// 首页JavaScript逻辑

document.addEventListener('DOMContentLoaded', function() {
    loadEvents();
});

async function loadEvents() {
    try {
        showElement('events-loading');
        hideElement('events-error');
        
        const response = await fetch(`${API_BASE_URL}/events`);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || '获取活动数据失败');
        }
        
        if (result.success && result.data.length > 0) {
            displayEvents(result.data);
        } else {
            showError('events-container', '暂无活动数据');
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
    
    const eventsHTML = events.map(event => `
        <div class="event-card">
            <img src="${event.image_url}" alt="${event.title}" class="event-image" onerror="this.src='/images/placeholder.jpg'">
            <div class="event-content">
                <h3 class="event-title">${event.title}</h3>
                <div class="event-meta">
                    <span>📅 ${formatDate(event.event_date)}</span>
                    <span>📍 ${event.location}</span>
                </div>
                <div class="event-category">${event.category_name}</div>
                <p class="event-description">${event.description}</p>
                <a href="#" class="event-details-link" onclick="goToEventDetails(${event.id}); return false;">查看详情</a>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = eventsHTML;
}