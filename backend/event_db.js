// =============================================
// PROG2002 Assessment 2 - Database Connection
// Database connection configuration file
// =============================================

const mysql = require('mysql2');

// Create database connection pool (recommended for better performance)
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',  // XAMPP default empty password (Important modification!)
    database: 'charityevents_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Convert callback-based pool to Promise version for async/await usage
const promisePool = pool.promise();

// Function to test database connection
async function testConnection() {
    try {
        const [rows, fields] = await promisePool.query('SELECT 1 + 1 AS solution');
        console.log('✅ Database connection successful! Solution:', rows[0].solution);
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

// Execute database initialization (create tables and insert sample data)
async function initializeDatabase() {
    try {
        console.log('🔄 Starting database initialization...');
        
        // Read and execute schema.sql file
        // Note: In actual projects, we usually use external SQL files
        // Simplified here, using previously designed SQL statements directly
        
        // Check if tables exist, create if not
        const [tables] = await promisePool.query(`
            SELECT TABLE_NAME 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = 'charityevents_db'
        `);
        
        if (tables.length === 0) {
            console.log('📊 Database is empty, need to execute initialization SQL...');
            console.log('💡 Tip: Please manually execute database/schema.sql file to create database structure');
        } else {
            console.log('✅ Database tables exist:', tables.map(t => t.TABLE_NAME).join(', '));
        }
        
        return true;
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        return false;
    }
}

// Function to get event data (will be used in API)
async function getEvents() {
    try {
        const [rows] = await promisePool.query(`
            SELECT e.*, o.name as organisation_name, c.name as category_name 
            FROM events e 
            LEFT JOIN organisations o ON e.organisation_id = o.id 
            LEFT JOIN categories c ON e.category_id = c.id 
            WHERE e.is_active = TRUE 
            ORDER BY e.event_date ASC
        `);
        return rows;
    } catch (error) {
        console.error('Failed to get event data:', error);
        throw error;
    }
}

// Get single event details by ID
async function getEventById(eventId) {
    try {
        const [rows] = await promisePool.query(`
            SELECT e.*, o.name as organisation_name, c.name as category_name 
            FROM events e 
            LEFT JOIN organisations o ON e.organisation_id = o.id 
            LEFT JOIN categories c ON e.category_id = c.id 
            WHERE e.id = ? AND e.is_active = TRUE
        `, [eventId]);
        
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('Failed to get event details:', error);
        throw error;
    }
}

// Function to search events
async function searchEvents(criteria) {
    try {
        let query = `
            SELECT e.*, o.name as organisation_name, c.name as category_name 
            FROM events e 
            LEFT JOIN organisations o ON e.organisation_id = o.id 
            LEFT JOIN categories c ON e.category_id = c.id 
            WHERE e.is_active = TRUE
        `;
        
        const params = [];
        
        // Dynamically build query based on criteria
        if (criteria.category) {
            query += ' AND c.name LIKE ?';
            params.push(`%${criteria.category}%`);
        }
        
        if (criteria.location) {
            query += ' AND e.location LIKE ?';
            params.push(`%${criteria.location}%`);
        }
        
        if (criteria.date) {
            query += ' AND e.event_date = ?';
            params.push(criteria.date);
        }
        
        query += ' ORDER BY e.event_date ASC';
        
        const [rows] = await promisePool.query(query, params);
        return rows;
    } catch (error) {
        console.error('Failed to search events:', error);
        throw error;
    }
}

// Get all categories
async function getCategories() {
    try {
        const [rows] = await promisePool.query('SELECT * FROM categories ORDER BY name');
        return rows;
    } catch (error) {
        console.error('Failed to get categories:', error);
        throw error;
    }
}

// Test connection if this file is run directly
if (require.main === module) {
    async function main() {
        console.log('🧪 Testing database connection...');
        const connected = await testConnection();
        
        if (connected) {
            await initializeDatabase();
            
            // Test data retrieval
            console.log('📋 Getting sample event data:');
            const events = await getEvents();
            console.log(`Found ${events.length} events`);
            
            if (events.length > 0) {
                console.log('First event:', events[0].title);
            }
        }
    }
    
    main().catch(console.error);
}

// Export database connection and functions
module.exports = {
    pool: promisePool,
    testConnection,
    initializeDatabase,
    getEvents,
    getEventById,
    searchEvents,
    getCategories
};