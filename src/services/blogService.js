const { Op, fn, col, where } = require('sequelize');
const { Blog, User } = require('../models');

async function createBlog({ userId, blogTitle, blog, category }) {
    if (!blogTitle || !blog || !category) {
        throw new Error('blogTitle, blog and category are required');
    }

    return Blog.create({ userId, blogTitle, blog, category });
}

async function getBlogsByUserId(userId) {
    return Blog.findAll({ where: { userId }, order: [['id', 'ASC']] });
}

async function findBlogById(id) {
    return Blog.findByPk(id);
}

async function searchBlogsForUser({ userId, id, title }) {
    if (id !== undefined) {
        const blog = await Blog.findOne({ where: { id, userId } });
        return blog ? [blog] : [];
    }

    if (title) {
        return Blog.findAll({
            where: {
                userId,
                [Op.and]: [
                    where(fn('LOWER', col('blogTitle')), {
                        [Op.like]: `%${title.toLowerCase()}%`,
                    }),
                ],
            },
        });
    }

    return [];
}

async function updateBlog(id, userId, updates) {
    const blog = await Blog.findByPk(id);
    if (!blog) {
        return { status: 'NOT_FOUND' };
    }

    if (blog.userId !== userId) {
        return { status: 'FORBIDDEN' };
    }

    await blog.update(updates);
    return { status: 'OK', blog };
}

async function allBlog() {
    return Blog.findAll({
        include: [{ model: User, attributes: ['id', 'firstname', 'lastname', 'email'] }],
        order: [['id', 'ASC']],
    });
}

async function deleteBlog(id, userId) {
    const blog = await Blog.findByPk(id);
    if (!blog) {
        return { status: 'NOT_FOUND' };
    }

    if (blog.userId !== userId) {
        return { status: 'FORBIDDEN' };
    }

    await blog.destroy();
    return { status: 'OK' };
}

module.exports = {
    createBlog,
    getBlogsByUserId,
    findBlogById,
    searchBlogsForUser,
    allBlog,
    updateBlog,
    deleteBlog,
};
