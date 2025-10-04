// 活动详情页面JavaScript逻辑 - 增强版

let currentEvent = null;

document.addEventListener('DOMContentLoaded', function() {
    setupBackButton();
    loadEventDetails();
    setupRegisterButton();
});

// 设置返回按钮功能
function setupBackButton() {
    const backLink = document.querySelector('.back-link');
    backLink.addEventListener('click', function(e) {
        e.preventDefault();
        if (document.referrer && document.referrer.includes(window.location.hostname)) {
            window.history.back();
        } else {
            window.location.href = 'index.html';
        }
    });
}

// 加载活动详情
async function loadEventDetails() {
    try {
        showElement('event-loading');
        hideElement('event-error');
        hideElement('event-detail-container');
        hideElement('organization-card');
        
        const eventId = getUrlParameter('id');
        
        if (!eventId) {
            throw new Error('未指定活动ID');
        }
        
        const result = await apiCall(`${API_BASE_URL}/events/${eventId}`);
        
        if (result.success) {
            currentEvent = result.data;
            displayEventDetails(currentEvent);
            loadRelatedEvents(currentEvent.category_id, eventId);
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
    document.getElementById('event-time').textContent = formatTime(event.event_time);
    document.getElementById('event-location').textContent = event.location;
    document.getElementById('event-organisation').textContent = event.organisation_name;
    
    // 设置票务信息
    const priceElement = document.getElementById('event-price');
    if (event.is_free) {
        priceElement.textContent = '免费活动';
        priceElement.style.color = '#27ae60';
    } else {
        priceElement.textContent = `$${event.ticket_price}`;
        priceElement.style.color = '#e74c3c';
    }
    
    // 设置图片
    const heroImage = document.getElementById('event-hero-image');
    heroImage.src = event.image_url;
    heroImage.alt = event.title;
    heroImage.onerror = function() {
        this.src = '/images/placeholder.jpg';
    };
    
    // 设置筹款进度
    setupFundraisingProgress(event);
    
    // 设置描述
    document.getElementById('event-full-description').textContent = event.full_description || event.description;
    
    if (event.venue_details) {
        document.getElementById('event-venue-details').textContent = `场地详情: ${event.venue_details}`;
    } else {
        document.getElementById('event-venue-details').style.display = 'none';
    }
    
    // 显示组织者信息
    setupOrganizationInfo(event);
    
    // 显示详情容器
    showElement('event-detail-container');
    
    // 更新页面标题
    document.title = `${event.title} - CharityHub`;
    
    // 更新URL但不刷新页面
    updateURL(event.id);
}

// 设置筹款进度
function setupFundraisingProgress(event) {
    const goal = parseFloat(event.fundraising_goal) || 0;
    const current = parseFloat(event.current_amount) || 0;
    const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
    
    document.getElementById('current-amount').textContent = current.toLocaleString();
    document.getElementById('fundraising-goal').textContent = goal.toLocaleString();
    
    const progressFill = document.getElementById('progress-fill');
    progressFill.style.width = `${percentage}%`;
    
    // 根据进度设置颜色
    if (percentage >= 100) {
        progressFill.style.background = '#27ae60'; // 绿色 - 已完成
    } else if (percentage >= 75) {
        progressFill.style.background = '#3498db'; // 蓝色 - 接近完成
    } else if (percentage >= 50) {
        progressFill.style.background = '#f39c12'; // 橙色 - 过半
    } else {
        progressFill.style.background = '#e74c3c'; // 红色 - 刚开始
    }
    
    document.getElementById('progress-percentage').textContent = `${percentage.toFixed(1)}%`;
    
    // 添加筹款状态说明
    let statusText = '';
    if (percentage >= 100) {
        statusText = '🎉 筹款目标已达成！';
    } else if (percentage >= 75) {
        statusText = '🚀 接近目标，继续加油！';
    } else if (percentage >= 50) {
        statusText = '👍 已完成过半，感谢支持！';
    } else {
        statusText = '🌟 刚刚开始，需要您的帮助！';
    }
    
    const statusElement = document.createElement('div');
    statusElement.style.textAlign = 'center';
    statusElement.style.marginTop = '0.5rem';
    statusElement.style.fontStyle = 'italic';
    statusElement.style.color = '#666';
    statusElement.textContent = statusText;
    
    const fundraisingSection = document.querySelector('.fundraising-section');
    if (!fundraisingSection.querySelector('.fundraising-status')) {
        statusElement.className = 'fundraising-status';
        fundraisingSection.appendChild(statusElement);
    }
}

// 设置组织者信息
function setupOrganizationInfo(event) {
    if (event.organisation_name) {
        document.getElementById('org-name').textContent = event.organisation_name;
        document.getElementById('org-mission').textContent = event.mission_statement || '致力于创造积极的社会影响';
        
        // 构建联系方式
        let contactInfo = [];
        if (event.contact_email) contactInfo.push(`📧 ${event.contact_email}`);
        if (event.contact_phone) contactInfo.push(`📞 ${event.contact_phone}`);
        if (event.address) contactInfo.push(`📍 ${event.address}`);
        
        document.getElementById('org-contact').textContent = contactInfo.join(' | ') || '请联系活动组织者获取更多信息';
        document.getElementById('org-description').textContent = event.organisation_description || '一个致力于社会公益的慈善组织。';
        
        showElement('organization-card');
    }
}

// 更新URL
function updateURL(eventId) {
    const newUrl = `${window.location.pathname}?id=${eventId}`;
    window.history.replaceState({ path: newUrl }, '', newUrl);
}

// 加载相关活动
async function loadRelatedEvents(categoryId, currentEventId) {
    try {
        const result = await apiCall(`${API_BASE_URL}/events`);
        
        if (result.success) {
            const relatedEvents = result.data.filter(event => 
                event.category_id === categoryId && 
                event.id !== parseInt(currentEventId) &&
                event.is_active === true
            ).slice(0, 3);
            
            displayRelatedEvents(relatedEvents);
        }
    } catch (error) {
        console.error('加载相关活动失败:', error);
        hideRelatedEventsSection();
    }
}

// 显示相关活动
function displayRelatedEvents(events) {
    const container = document.getElementById('related-events-container');
    
    if (events.length === 0) {
        hideRelatedEventsSection();
        return;
    }
    
    const eventsHTML = events.map(event => {
        const status = getEventStatus(event);
        return `
        <div class="related-event-card" onclick="goToEventDetails(${event.id})">
            <img src="${event.image_url}" alt="${event.title}" class="related-event-image" 
                 onerror="this.src='/images/placeholder.jpg'">
            <div class="related-event-content">
                <h4 class="related-event-title">${event.title}</h4>
                <div class="related-event-meta">
                    <span>📅 ${formatDate(event.event_date)}</span>
                    <span>📍 ${event.location}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                    <div class="event-category">${event.category_name}</div>
                    <span style="${status.style} padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.7rem;">
                        ${status.text}
                    </span>
                </div>
            </div>
        </div>
        `;
    }).join('');
    
    container.innerHTML = eventsHTML;
}

// 隐藏相关活动区域
function hideRelatedEventsSection() {
    const relatedEventsSection = document.querySelector('.related-events');
    if (relatedEventsSection) {
        relatedEventsSection.style.display = 'none';
    }
}

// 设置注册按钮
function setupRegisterButton() {
    const registerBtn = document.getElementById('register-btn');
    registerBtn.addEventListener('click', function() {
        // 显示更友好的提示
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.zIndex = '1000';
        
        modal.innerHTML = `
            <div style="background: white; padding: 2rem; border-radius: 10px; text-align: center; max-width: 400px;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🚧</div>
                <h3 style="margin-bottom: 1rem; color: #2c3e50;">功能正在建设中</h3>
                <p style="margin-bottom: 1.5rem; color: #666;">报名功能即将推出，敬请期待！</p>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: #3498db; color: white; border: none; padding: 0.7rem 1.5rem; 
                               border-radius: 5px; cursor: pointer;">确定</button>
            </div>
        `;
        
        document.body.appendChild(modal);
    });
}

// 活动状态判断函数
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

// 添加分享功能
function setupSharing() {
    // 可以在这里添加社交媒体分享功能
    console.log('分享功能准备就绪');
}

// 页面可见性变化时刷新数据
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && currentEvent) {
        // 当页面重新可见时，刷新当前活动数据
        loadEventDetails();
    }
});