// 通用工具函数 - 增强版

// API基础URL
const API_BASE_URL = 'http://localhost:3000/api';

// 增强的API调用函数
async function apiCall(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API调用失败:', error);
        throw new Error(`网络错误: ${error.message}`);
    }
}

// 显示错误信息
function showError(containerId, message) {
    const container = document.getElementById(containerId);
    container.innerHTML = `<div class="error-message">${message}</div>`;
    container.style.display = 'block';
}

// 隐藏元素
function hideElement(id) {
    const element = document.getElementById(id);
    if (element) {
        element.style.display = 'none';
    }
}

// 显示元素
function showElement(id) {
    const element = document.getElementById(id);
    if (element) {
        element.style.display = 'block';
    }
}

// 格式化日期
function formatDate(dateString) {
    try {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('zh-CN', options);
    } catch (error) {
        console.error('日期格式化错误:', error);
        return dateString;
    }
}

// 格式化时间
function formatTime(timeString) {
    if (!timeString) return '时间待定';
    try {
        return timeString.substring(0, 5); // 只显示小时和分钟
    } catch (error) {
        return timeString;
    }
}

// 跳转到活动详情页
function goToEventDetails(eventId) {
    window.location.href = `event-details.html?id=${eventId}`;
}

// 获取URL参数
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// 图片加载失败处理
function setupImageErrorHandling() {
    document.addEventListener('error', function(e) {
        if (e.target.tagName === 'IMG' && !e.target.hasAttribute('data-error-handled')) {
            e.target.src = '/images/placeholder.jpg';
            e.target.alt = '图片加载失败';
            e.target.setAttribute('data-error-handled', 'true');
        }
    }, true);
}

// 检查API连接
async function checkAPIConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/events`);
        return response.ok;
    } catch (error) {
        return false;
    }
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 初始化通用功能
document.addEventListener('DOMContentLoaded', function() {
    setupImageErrorHandling();
    console.log('CharityHub - 慈善活动平台已加载');
});