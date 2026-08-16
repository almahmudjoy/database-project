const {
    allUsers,
    allUsersBlog,
    searchAnyBlog,
    updateUserStatus,
    deleteUser,
    deleteAnyBlog,
} = require('../services/adminService');

function printUserRow(user) {
    console.log(`\nID: ${user.id}`);
    console.log(`Name: ${user.firstname} ${user.lastname}`);
    console.log(`Email: ${user.email}`);
    console.log(`Status: ${user.isActive ? 'Active' : 'Inactive'}`);
    console.log(`Role: ${user.role}`);
    console.log(`Created At: ${user.createAt}`);
    console.log(`Updated At: ${user.updateAt}`);
}

function printBlogWithAuthor(blog) {
    console.log(`\nBlog ID: ${blog.id}`);
    console.log(`Title: ${blog.blogTitle}`);
    console.log(`Category: ${blog.category}`);
    console.log(`Content: ${blog.blog}`);
    console.log(`User ID: ${blog.userId}`);
    console.log(`Author: ${blog.User.firstname} ${blog.User.lastname}`);
    console.log(`Author Email: ${blog.User.email}`);
    console.log(`Created At: ${blog.createAt}`);
    console.log(`Updated At: ${blog.updateAt}`);
}

async function viewAllUsersPrompt() {
    try {
        const users = await allUsers();
        if (users.length === 0) {
            console.log('No users are found');
            return;
        }

        console.log('\n===== ALL USERS =====');
        users.forEach(printUserRow);
    } catch (error) {
        console.log(error.message);
    }
}

async function viewAllUsersBlogPrompt() {
    try {
        const blogs = await allUsersBlog();
        if (blogs.length === 0) {
            console.log('No blogs are found');
            return;
        }

        console.log('\n===== ALL BLOGS (ADMIN) =====');
        blogs.forEach(printBlogWithAuthor);
    } catch (error) {
        console.log(error.message);
    }
}

async function searchAnyBlogPrompt(prompt) {
    const query = (await prompt.ask('Search by Blog ID or Title: ')).trim();

    try {
        const results = /^\d+$/.test(query)
            ? await searchAnyBlog({ id: Number(query) })
            : await searchAnyBlog({ title: query });

        if (results.length === 0) {
            console.log('Blog not found');
            return;
        }

        results.forEach((blog) => {
            console.log('---');
            printBlogWithAuthor(blog);
        });
    } catch (error) {
        console.log(error.message);
    }
}

async function updateUserStatusPrompt(prompt) {
    const userId = Number((await prompt.ask('User ID: ')).trim());
    const statusInput = (await prompt.ask('Set status (active/inactive): ')).trim().toLowerCase();

    if (statusInput !== 'active' && statusInput !== 'inactive') {
        console.log('Invalid status. Enter "active" or "inactive".');
        return;
    }

    try {
        const result = await updateUserStatus(userId, statusInput === 'active');
        if (result.status === 'NOT_FOUND') {
            console.log('User not found');
            return;
        }

        console.log('User status updated successfully');
        console.log(`User ID: ${result.user.id}`);
        console.log(`Email: ${result.user.email}`);
        console.log(`New status: ${result.user.isActive ? 'Active' : 'Inactive'}`);
    } catch (error) {
        console.log(error.message);
    }
}

async function deleteUserPrompt(prompt) {
    const userId = Number((await prompt.ask('User ID to delete: ')).trim());

    try {
        const result = await deleteUser(userId);
        if (result.status === 'NOT_FOUND') {
            console.log('User not found');
            return;
        }

        console.log('User deleted successfully');
        if (result.deletedBlogCount > 0) {
            console.log(`${result.deletedBlogCount} associated blog(s) also removed.`);
        }
    } catch (error) {
        console.log(error.message);
    }
}

async function deleteAnyBlogPrompt(prompt) {
    const id = Number((await prompt.ask('Blog ID to delete: ')).trim());

    try {
        const result = await deleteAnyBlog(id);
        if (result.status === 'NOT_FOUND') {
            console.log('Blog not found');
            return;
        }

        console.log('Blog deleted successfully');
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    viewAllUsersPrompt,
    viewAllUsersBlogPrompt,
    searchAnyBlogPrompt,
    updateUserStatusPrompt,
    deleteUserPrompt,
    deleteAnyBlogPrompt,
};
