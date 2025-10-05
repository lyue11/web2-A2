// General Utility Functions - Enhanced Version

// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Enhanced API call function
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
        console.error('API call failed:', error);
        throw new Error(`Network error: ${error.message}`);
    }
}

// Display error message
function showError(containerId, message) {
    const container = document.getElementById(containerId);
    container.innerHTML = `<div class="error-message">${message}</div>`;
    container.style.display = 'block';
}

// Hide element
function hideElement(id) {
    const element = document.getElementById(id);
    if (element) {
        element.style.display = 'none';
    }
}

// Show element
function showElement(id) {
    const element = document.getElementById(id);
    if (element) {
        element.style.display = 'block';
    }
}

// Format date
function formatDate(dateString) {
    try {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    } catch (error) {
        console.error('Date formatting error:', error);
        return dateString;
    }
}

// Format time
function formatTime(timeString) {
    if (!timeString) return 'Time to be determined';
    try {
        return timeString.substring(0, 5); // Only show hours and minutes
    } catch (error) {
        return timeString;
    }
}

// Navigate to event details page
function goToEventDetails(eventId) {
    window.location.href = `event-details.html?id=${eventId}`;
}

// Get URL parameter
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Image loading error handling
function setupImageErrorHandling() {
    document.addEventListener('error', function(e) {
        if (e.target.tagName === 'IMG' && !e.target.hasAttribute('data-error-handled')) {
            e.target.src = '/images/placeholder.jpg';
            e.target.alt = 'Image failed to load';
            e.target.setAttribute('data-error-handled', 'true');
        }
    }, true);
}

// Check API connection
async function checkAPIConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/events`);
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Debounce function
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

// Initialize general functionality
document.addEventListener('DOMContentLoaded', function() {
    setupImageErrorHandling();
    console.log('CharityHub - Charity Events Platform loaded');
});