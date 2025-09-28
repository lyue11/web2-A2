// =============================================
// PROG2002 Assessment 2 - Database Connection
// 数据库连接配置文件
// =============================================

const mysql = require('mysql2');

// 创建数据库连接池（推荐使用连接池提高性能）
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',  // XAMPP默认空密码（重要修改！）
    database: 'charityevents_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 将基于回调的池转换为Promise版本，以便使用async/await
const promisePool = pool.promise();

// 测试数据库连接的函数
async function testConnection() {
    try {
        const [rows, fields] = await promisePool.query('SELECT 1 + 1 AS solution');
        console.log('✅ 数据库连接成功! Solution:', rows[0].solution);
        return true;
    } catch (error) {
        console.error('❌ 数据库连接失败:', error.message);
        return false;
    }
}

// 执行数据库初始化（创建表和插入样本数据）
async function initializeDatabase() {
    try {
        console.log('🔄 开始初始化数据库...');
        
        // 读取并执行schema.sql文件
        // 注意：在实际项目中，我们通常使用外部SQL文件
        // 这里简化处理，直接使用之前设计的SQL语句
        
        // 检查表是否存在，如果不存在则创建
        const [tables] = await promisePool.query(`
            SELECT TABLE_NAME 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = 'charityevents_db'
        `);
        
        if (tables.length === 0) {
            console.log('📊 数据库为空，需要执行初始化SQL...');
            console.log('💡 提示：请先手动执行 database/schema.sql 文件来创建数据库结构');
        } else {
            console.log('✅ 数据库表已存在:', tables.map(t => t.TABLE_NAME).join(', '));
        }
        
        return true;
    } catch (error) {
        console.error('❌ 数据库初始化失败:', error.message);
        return false;
    }
}

// 获取活动数据的函数（将在API中使用）
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
        console.error('获取活动数据失败:', error);
        throw error;
    }
}

// 根据ID获取单个活动详情
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
        console.error('获取活动详情失败:', error);
        throw error;
    }
}

// 搜索活动的函数
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
        
        // 根据条件动态构建查询
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
        console.error('搜索活动失败:', error);
        throw error;
    }
}

// 获取所有分类
async function getCategories() {
    try {
        const [rows] = await promisePool.query('SELECT * FROM categories ORDER BY name');
        return rows;
    } catch (error) {
        console.error('获取分类失败:', error);
        throw error;
    }
}

// 如果直接运行这个文件，则测试连接
if (require.main === module) {
    async function main() {
        console.log('🧪 测试数据库连接...');
        const connected = await testConnection();
        
        if (connected) {
            await initializeDatabase();
            
            // 测试获取数据
            console.log('📋 获取活动数据示例:');
            const events = await getEvents();
            console.log(`找到 ${events.length} 个活动`);
            
            if (events.length > 0) {
                console.log('第一个活动:', events[0].title);
            }
        }
    }
    
    main().catch(console.error);
}

// 导出数据库连接和函数
module.exports = {
    pool: promisePool,
    testConnection,
    initializeDatabase,
    getEvents,
    getEventById,
    searchEvents,
    getCategories
};