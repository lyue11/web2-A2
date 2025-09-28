// =============================================
// PROG2002 Assessment 2 - Express Server
// Charity Events API Server
// =============================================

const express = require('express');
const cors = require('cors');
const db = require('./event_db');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(cors()); // 允许跨域请求
app.use(express.json()); // 解析JSON请求体
app.use(express.static('../frontend')); // 提供前端静态文件服务

// =============================================
// API路由
// =============================================

// 首页API - 获取所有活跃活动
app.get('/api/events', async (req, res) => {
    try {
        const events = await db.getEvents();
        res.json({
            success: true,
            data: events,
            count: events.length
        });
    } catch (error) {
        console.error('获取活动列表失败:', error);
        res.status(500).json({
            success: false,
            message: '获取活动数据失败'
        });
    }
});

// 搜索活动API
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
        console.error('搜索活动失败:', error);
        res.status(500).json({
            success: false,
            message: '搜索活动失败'
        });
    }
});

// 获取活动详情API
app.get('/api/events/:id', async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const event = await db.getEventById(eventId);
        
        if (!event) {
            return res.status(404).json({
                success: false,
                message: '活动未找到'
            });
        }
        
        res.json({
            success: true,
            data: event
        });
    } catch (error) {
        console.error('获取活动详情失败:', error);
        res.status(500).json({
            success: false,
            message: '获取活动详情失败'
        });
    }
});

// 获取所有分类API
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await db.getCategories();
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('获取分类失败:', error);
        res.status(500).json({
            success: false,
            message: '获取分类数据失败'
        });
    }
});

// =============================================
// 启动服务器
// =============================================

app.listen(PORT, () => {
    console.log(`🚀 慈善活动API服务器运行在 http://localhost:${PORT}`);
    console.log(`📊 API端点:`);
    console.log(`   GET /api/events           - 获取所有活动`);
    console.log(`   GET /api/events/search    - 搜索活动`);
    console.log(`   GET /api/events/:id       - 获取活动详情`);
    console.log(`   GET /api/categories       - 获取所有分类`);
});

// 导出app用于测试
module.exports = app;