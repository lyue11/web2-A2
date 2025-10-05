// Event Details Page JavaScript Logic - Enhanced Version

let currentEvent = null;

document.addEventListener('DOMContentLoaded', function() {
    setupBackButton();
    loadEventDetails();
    setupRegisterButton();
});

// Set up back button functionality
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

// Load event details
async function loadEventDetails() {
    try {
        showElement('event-loading');
        hideElement('event-error');
        hideElement('event-detail-container');
        hideElement('organization-card');
        
        const eventId = getUrlParameter('id');
        
        if (!eventId) {
            throw new Error('Event ID not specified');
        }
        
        const result = await apiCall(`${API_BASE_URL}/events/${eventId}`);
        
        if (result.success) {
            currentEvent = result.data;
            displayEventDetails(currentEvent);
            loadRelatedEvents(currentEvent.category_id, eventId);
        } else {
            throw new Error('Event data loading failed');
        }
        
    } catch (error) {
        console.error('Failed to load event details:', error);
        showError('event-error', `Load failed: ${error.message}`);
    } finally {
        hideElement('event-loading');
    }
}

// Display event details
function displayEventDetails(event) {
    // Set basic information
    document.getElementById('event-title').textContent = event.title;
    document.getElementById('event-category').textContent = event.category_name;
    document.getElementById('event-date').textContent = formatDate(event.event_date);
    document.getElementById('event-time').textContent = formatTime(event.event_time);
    document.getElementById('event-location').textContent = event.location;
    document.getElementById('event-organisation').textContent = event.organisation_name;
    
    // Set ticket information
    const priceElement = document.getElementById('event-price');
    if (event.is_free) {
        priceElement.textContent = 'Free Event';
        priceElement.style.color = '#27ae60';
    } else {
        priceElement.textContent = `$${event.ticket_price}`;
        priceElement.style.color = '#e74c3c';
    }
    
    // Set image
    const heroImage = document.getElementById('event-hero-image');
    heroImage.src = event.image_url;
    heroImage.alt = event.title;
    heroImage.onerror = function() {
        this.src = '/images/placeholder.jpg';
    };
    
    // Set up fundraising progress
    setupFundraisingProgress(event);
    
    // Set description
    document.getElementById('event-full-description').textContent = event.full_description || event.description;
    
    if (event.venue_details) {
        document.getElementById('event-venue-details').textContent = `Venue Details: ${event.venue_details}`;
    } else {
        document.getElementById('event-venue-details').style.display = 'none';
    }
    
    // Display organizer information
    setupOrganizationInfo(event);
    
    // Display detail container
    showElement('event-detail-container');
    
    // Update page title
    document.title = `${event.title} - CharityHub`;
    
    // Update URL without refreshing page
    updateURL(event.id);
}

// Set up fundraising progress
function setupFundraisingProgress(event) {
    const goal = parseFloat(event.fundraising_goal) || 0;
    const current = parseFloat(event.current_amount) || 0;
    const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
    
    document.getElementById('current-amount').textContent = current.toLocaleString();
    document.getElementById('fundraising-goal').textContent = goal.toLocaleString();
    
    const progressFill = document.getElementById('progress-fill');
    progressFill.style.width = `${percentage}%`;
    
    // Set color based on progress
    if (percentage >= 100) {
        progressFill.style.background = '#27ae60'; // Green - Completed
    } else if (percentage >= 75) {
        progressFill.style.background = '#3498db'; // Blue - Close to completion
    } else if (percentage >= 50) {
        progressFill.style.background = '#f39c12'; // Orange - Halfway
    } else {
        progressFill.style.background = '#e74c3c'; // Red - Just started
    }
    
    document.getElementById('progress-percentage').textContent = `${percentage.toFixed(1)}%`;
    
    // Add fundraising status description
    let statusText = '';
    if (percentage >= 100) {
        statusText = '🎉 Fundraising goal achieved!';
    } else if (percentage >= 75) {
        statusText = '🚀 Close to target, keep going!';
    } else if (percentage >= 50) {
        statusText = '👍 Halfway there, thank you for your support!';
    } else {
        statusText = '🌟 Just started, we need your help!';
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

// Set up organizer information
function setupOrganizationInfo(event) {
    if (event.organisation_name) {
        document.getElementById('org-name').textContent = event.organisation_name;
        document.getElementById('org-mission').textContent = event.mission_statement || 'Committed to creating positive social impact';
        
        // Build contact information
        let contactInfo = [];
        if (event.contact_email) contactInfo.push(`📧 ${event.contact_email}`);
        if (event.contact_phone) contactInfo.push(`📞 ${event.contact_phone}`);
        if (event.address) contactInfo.push(`📍 ${event.address}`);
        
        document.getElementById('org-contact').textContent = contactInfo.join(' | ') || 'Please contact the event organizer for more information';
        document.getElementById('org-description').textContent = event.organisation_description || 'A charity organization dedicated to social welfare.';
        
        showElement('organization-card');
    }
}

// Update URL
function updateURL(eventId) {
    const newUrl = `${window.location.pathname}?id=${eventId}`;
    window.history.replaceState({ path: newUrl }, '', newUrl);
}

// Load related events
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
        console.error('Failed to load related events:', error);
        hideRelatedEventsSection();
    }
}

// Display related events
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

// Hide related events section
function hideRelatedEventsSection() {
    const relatedEventsSection = document.querySelector('.related-events');
    if (relatedEventsSection) {
        relatedEventsSection.style.display = 'none';
    }
}

// Set up register button
function setupRegisterButton() {
    const registerBtn = document.getElementById('register-btn');
    registerBtn.addEventListener('click', function() {
        // Display more friendly prompt
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
                <h3 style="margin-bottom: 1rem; color: #2c3e50;">Feature Under Construction</h3>
                <p style="margin-bottom: 1.5rem; color: #666;">Registration feature coming soon, stay tuned!</p>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: #3498db; color: white; border: none; padding: 0.7rem 1.5rem; 
                               border-radius: 5px; cursor: pointer;">OK</button>
            </div>
        `;
        
        document.body.appendChild(modal);
    });
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

// Add sharing functionality
function setupSharing() {
    // Can add social media sharing functionality here
    console.log('Sharing functionality ready');
}

// Refresh data when page visibility changes
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && currentEvent) {
        // Refresh current event data when page becomes visible again
        loadEventDetails();
    }
});