const sequelize = require('../config/database');
const User = require('./User');
const Blog = require('./Blog');

User.hasMany(Blog, {
    foreignKey: 'userId',
});

Blog.belongsTo(User, {
    foreignKey: 'userId',
});

module.exports = { sequelize, User, Blog };
