// Search Page JavaScript Logic - Enhanced Version

let allEvents = [];
let currentSearchType = 'keyword';
let searchTimeout;

document.addEventListener('DOMContentLoaded', function() {
    loadCategories();
    setupEventListeners();
    setupTabSwitching();
    setupDebouncedSearch();
    loadAllEvents();
});

// Set up tab switching
function setupTabSwitching() {
    const tabs = document.querySelectorAll('.search-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding content
            document.querySelectorAll('.search-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${targetTab}-search`).classList.add('active');
            
            currentSearchType = targetTab;
            
            // Clear the other form's content
            if (targetTab === 'keyword') {
                document.getElementById('search-form').reset();
            } else {
                document.getElementById('keyword').value = '';
            }
        });
    });
}

// Set up debounced search
function setupDebouncedSearch() {
    const keywordInput = document.getElementById('keyword');
    const debouncedSearch = debounce(function(event) {
        const keyword = event.target.value.trim();
        if (keyword.length >= 2) {
            performKeywordSearch(keyword);
        } else if (keyword.length === 0) {
            // Show all events when search is cleared
            showAllEvents();
        }
    }, 500);

    keywordInput.addEventListener('input', debouncedSearch);
}

// Load all event data
async function loadAllEvents() {
    try {
        showElement('search-loading');
        updateSearchStats('Loading event data...');
        
        const result = await apiCall(`${API_BASE_URL}/events`);
        
        if (result.success) {
            allEvents = result.data;
            updateSearchStats(`Loaded ${allEvents.length} events`);
            updateResultsCount(allEvents.length);
            displaySearchResults(allEvents);
        } else {
            throw new Error('Data loading failed');
        }
    } catch (error) {
        console.error('Failed to load event data:', error);
        updateSearchStats('Event data loading failed');
        showError('search-error', `Data loading failed: ${error.message}`);
    } finally {
        hideElement('search-loading');
    }
}

// Load category options
async function loadCategories() {
    try {
        const result = await apiCall(`${API_BASE_URL}/categories`);
        
        if (result.success) {
            populateCategorySelect(result.data);
        }
    } catch (error) {
        console.error('Failed to load categories:', error);
        showError('search-error', `Category data loading failed: ${error.message}`);
    }
}

// Populate category dropdown
function populateCategorySelect(categories) {
    const categorySelect = document.getElementById('category');
    
    // Clear existing options (except "All Categories")
    while (categorySelect.children.length > 1) {
        categorySelect.removeChild(categorySelect.lastChild);
    }
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
}

// Set up event listeners
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
    
    // Real-time form change listeners
    document.getElementById('category').addEventListener('change', handleFormChange);
    document.getElementById('location').addEventListener('input', debounce(handleFormChange, 300));
    document.getElementById('date').addEventListener('change', handleFormChange);
}

function handleFormChange() {
    if (currentSearchType === 'advanced') {
        const formData = new FormData(document.getElementById('search-form'));
        const criteria = {
            category: formData.get('category'),
            location: formData.get('location'),
            date: formData.get('date')
        };
        
        // Only search when there are actual filter criteria
        if (criteria.category || criteria.location || criteria.date) {
            performAdvancedSearch(criteria);
        }
    }
}

// Handle keyword search
async function handleKeywordSearch(event) {
    event.preventDefault();
    
    const keyword = document.getElementById('keyword').value.trim();
    
    if (!keyword) {
        alert('Please enter a search keyword');
        return;
    }
    
    await performKeywordSearch(keyword);
}

// Perform keyword search
async function performKeywordSearch(keyword) {
    try {
        showElement('search-loading');
        hideElement('search-error');
        hideElement('no-results');
        
        // Perform keyword filtering on the frontend
        const filteredEvents = allEvents.filter(event => 
            event.title.toLowerCase().includes(keyword.toLowerCase()) ||
            event.description.toLowerCase().includes(keyword.toLowerCase()) ||
            event.category_name.toLowerCase().includes(keyword.toLowerCase()) ||
            event.location.toLowerCase().includes(keyword.toLowerCase())
        );
        
        updateSearchStats(`Found ${filteredEvents.length} events containing "${keyword}"`);
        updateResultsCount(filteredEvents.length);
        displaySearchResults(filteredEvents);
        
    } catch (error) {
        console.error('Keyword search failed:', error);
        showError('search-error', `Search failed: ${error.message}`);
    } finally {
        hideElement('search-loading');
    }
}

// Handle advanced search
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

// Perform advanced search
async function performAdvancedSearch(criteria) {
    try {
        showElement('search-loading');
        hideElement('search-error');
        hideElement('no-results');
        
        // Build query parameters
        const params = new URLSearchParams();
        if (criteria.category) params.append('category', criteria.category);
        if (criteria.location) params.append('location', criteria.location);
        if (criteria.date) params.append('date', criteria.date);
        
        const result = await apiCall(`${API_BASE_URL}/events/search?${params}`);
        
        let criteriaText = [];
        if (criteria.category) criteriaText.push(`Category: ${criteria.category}`);
        if (criteria.location) criteriaText.push(`Location: ${criteria.location}`);
        if (criteria.date) criteriaText.push(`Date: ${formatDate(criteria.date)}`);
        
        const criteriaString = criteriaText.length > 0 ? ` (${criteriaText.join(', ')})` : '';
        updateSearchStats(`Found ${result.data.length} events${criteriaString}`);
        updateResultsCount(result.data.length);
        displaySearchResults(result.data);
        
    } catch (error) {
        console.error('Advanced search failed:', error);
        showError('search-error', `Search failed: ${error.message}`);
    } finally {
        hideElement('search-loading');
    }
}

// Show all upcoming events
async function showUpcomingEvents() {
    try {
        showElement('search-loading');
        hideElement('search-error');
        hideElement('no-results');
        
        const today = new Date().toISOString().split('T')[0];
        
        const upcomingEvents = allEvents.filter(event => 
            event.event_date >= today && event.is_active
        );
        
        updateSearchStats(`Found ${upcomingEvents.length} upcoming events`);
        updateResultsCount(upcomingEvents.length);
        displaySearchResults(upcomingEvents);
        
    } catch (error) {
        console.error('Failed to get upcoming events:', error);
        showError('search-error', `Failed to retrieve: ${error.message}`);
    } finally {
        hideElement('search-loading');
    }
}

// Show all events
async function showAllEvents() {
    try {
        showElement('search-loading');
        hideElement('search-error');
        hideElement('no-results');
        
        updateSearchStats(`Showing all ${allEvents.length} events`);
        updateResultsCount(allEvents.length);
        displaySearchResults(allEvents);
        
    } catch (error) {
        console.error('Failed to get all events:', error);
        showError('search-error', `Failed to retrieve: ${error.message}`);
    } finally {
        hideElement('search-loading');
    }
}

// Display search results
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
                    <span>🎯 Goal: $${event.fundraising_goal?.toLocaleString() || '0'}</span>
                    <span>💰 Raised: $${event.current_amount?.toLocaleString() || '0'}</span>
                </div>
                <a href="#" class="event-details-link" onclick="goToEventDetails(${event.id}); return false;">View Details</a>
            </div>
        </div>
        `;
    }).join('');
    
    container.innerHTML = eventsHTML;
}

// Clear filter conditions
function clearFilters() {
    document.getElementById('search-form').reset();
    document.getElementById('keyword').value = '';
    document.getElementById('search-results').innerHTML = '';
    hideElement('no-results');
    hideElement('search-error');
    updateSearchStats('Filter conditions cleared');
    updateResultsCount(0);
    
    // Show all events after reset
    showAllEvents();
}

// Update search statistics
function updateSearchStats(text) {
    const statsElement = document.getElementById('search-stats-text');
    if (statsElement) {
        statsElement.textContent = text;
    }
}

// Update results count
function updateResultsCount(count) {
    const countElement = document.getElementById('results-count');
    if (countElement) {
        countElement.textContent = `${count} results`;
    }
}

// Event status determination function
function getEventStatus(event) {
    const eventDate = new Date(event.event_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (eventDate < today) {
        return { text: 'Ended', style: 'background: #7f8c8d; color: white;' };
    } else if (eventDate.getTime() === today.getTime()) {
        return { text: 'Today', style: 'background: #e74c3c; color: white;' };
    } else if ((eventDate - today) / (1000 * 60 * 60 * 24) <= 7) {
        return { text: 'Coming Soon', style: 'background: #f39c12; color: white;' };
    } else {
        return { text: 'Upcoming', style: 'background: #27ae60; color: white;' };
    }
}