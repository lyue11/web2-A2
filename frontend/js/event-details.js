// 活动详情页面JavaScript逻辑

document.addEventListener('DOMContentLoaded', function() {
    loadEventDetails();
    setupRegisterButton();
});

// 加载活动详情
async function loadEventDetails() {
    try {
        showElement('event-loading');
        hideElement('event-error');
        hideElement('event-detail-container');
        
        // 从URL获取活动ID
        const urlParams = new URLSearchParams(window.location.search);
        const eventId = urlParams.get('id');
        
        if (!eventId) {
            throw new Error('未指定活动ID');
        }
        
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || '获取活动详情失败');
        }
        
        if (result.success) {
            displayEventDetails(result.data);
        } else {
            throw new Error('活动数据加载失败');
        }
        
    } catch (error) {
        console.error('加载活动详情失败:', error);
        showError('event-error', `加载失败: ${error.message}`);
    } finally {
        hideElement('event-loading');
    }
}

// 显示活动详情
function displayEventDetails(event) {
    // 设置基本信息
    document.getElementById('event-title').textContent = event.title;
    document.getElementById('event-category').textContent = event.category_name;
    document.getElementById('event-date').textContent = formatDate(event.event_date);
    document.getElementById('event-time').textContent = event.event_time || '时间待定';
    document.getElementById('event-location').textContent = event.location;
    document.getElementById('event-organisation').textContent = event.organisation_name;
    
    // 设置票务信息
    const priceElement = document.getElementById('event-price');
    if (event.is_free) {
        priceElement.textContent = '免费活动';
    } else {
        priceElement.textContent = `$${event.ticket_price}`;
    }
    
    // 设置图片
    const heroImage = document.getElementById('event-hero-image');
    heroImage.src = event.image_url;
    heroImage.alt = event.title;
    
    // 设置筹款进度
    const goal = parseFloat(event.fundraising_goal) || 0;
    const current = parseFloat(event.current_amount) || 0;
    const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
    
    document.getElementById('current-amount').textContent = current.toLocaleString();
    document.getElementById('fundraising-goal').textContent = goal.toLocaleString();
    document.getElementById('progress-fill').style.width = `${percentage}%`;
    document.getElementById('progress-percentage').textContent = `${percentage.toFixed(1)}%`;
    
    // 设置描述
    document.getElementById('event-full-description').textContent = event.full_description || event.description;
    
    if (event.venue_details) {
        document.getElementById('event-venue-details').textContent = `场地详情: ${event.venue_details}`;
    }
    
    // 显示详情容器
    showElement('event-detail-container');
}

// 设置注册按钮
function setupRegisterButton() {
    const registerBtn = document.getElementById('register-btn');
    registerBtn.addEventListener('click', function() {
        alert('此功能目前正在建设中。');
    });
}