const { getCurrentUser } = require('./session');
const { User, Blog } = require('../models');

const SAFE_USER_ATTRIBUTES = ['id', 'firstname', 'lastname', 'email', 'isActive', 'role', 'createAt', 'updateAt'];
const SAFE_AUTHOR_ATTRIBUTES = ['id', 'firstname', 'lastname', 'email'];

function requireAdmin() {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
        throw new Error('Access denied. Admin only.');
    }
}

async function allUsers() {
    requireAdmin();
    return User.findAll({
        attributes: SAFE_USER_ATTRIBUTES,
        order: [['id', 'ASC']],
    });
}

async function allUsersBlog() {
    requireAdmin();
    return Blog.findAll({
        include: [{ model: User, attributes: SAFE_AUTHOR_ATTRIBUTES }],
        order: [['id', 'ASC']],
    });
}

async function searchAnyBlogById(id) {
    requireAdmin();
    return Blog.findOne({
        where: { id },
        include: [{ model: User, attributes: SAFE_AUTHOR_ATTRIBUTES }],
    });
}

async function updateUserStatus(userId, isActive) {
    requireAdmin();
    const user = await User.findByPk(userId);
    if (!user) {
        return { status: 'NOT_FOUND' };
    }

    await user.update({ isActive });
    return { status: 'OK', user };
}

async function deleteUser(userId) {
    requireAdmin();
    const user = await User.findByPk(userId);
    if (!user) {
        return { status: 'NOT_FOUND' };
    }

    const deletedBlogCount = await Blog.destroy({ where: { userId } });
    await user.destroy();
    return { status: 'OK', deletedBlogCount };
}

async function deleteAnyBlog(blogId) {
    requireAdmin();
    const blog = await Blog.findByPk(blogId);
    if (!blog) {
        return { status: 'NOT_FOUND' };
    }

    await blog.destroy();
    return { status: 'OK' };
}

module.exports = {
    allUsers,
    allUsersBlog,
    searchAnyBlogById,
    updateUserStatus,
    deleteUser,
    deleteAnyBlog,
};
