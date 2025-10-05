// =============================================
// PROG2002 Assessment 2 - Express Server
// Charity Events API Server
// =============================================

const express = require('express');
const cors = require('cors');
const db = require('./event_db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware configuration
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON request body
app.use(express.static('../frontend')); // Serve frontend static files

// =============================================
// API Routes
// =============================================

// Homepage API - Get all active events
app.get('/api/events', async (req, res) => {
    try {
        const events = await db.getEvents();
        res.json({
            success: true,
            data: events,
            count: events.length
        });
    } catch (error) {
        console.error('Failed to get event list:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get event data'
        });
    }
});

// Search events API
app.get('/api/events/search', async (req, res) => {
    try {
        const { category, location, date } = req.query;
        const criteria = {};
        
        if (category) criteria.category = category;
        if (location) criteria.location = location;
        if (date) criteria.date = date;
        
        const events = await db.searchEvents(criteria);
        res.json({
            success: true,
            data: events,
            count: events.length,
            criteria: criteria
        });
    } catch (error) {
        console.error('Failed to search events:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search events'
        });
    }
});

// Get event details API
app.get('/api/events/:id', async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const event = await db.getEventById(eventId);
        
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        
        res.json({
            success: true,
            data: event
        });
    } catch (error) {
        console.error('Failed to get event details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get event details'
        });
    }
});

// Get all categories API
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await db.getCategories();
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Failed to get categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get category data'
        });
    }
});

// =============================================
// Start Server
// =============================================

app.listen(PORT, () => {
    console.log(`🚀 Charity Events API Server running at http://localhost:${PORT}`);
    console.log(`📊 API Endpoints:`);
    console.log(`   GET /api/events           - Get all events`);
    console.log(`   GET /api/events/search    - Search events`);
    console.log(`   GET /api/events/:id       - Get event details`);
    console.log(`   GET /api/categories       - Get all categories`);
});

// Export app for testing
module.exports = app;