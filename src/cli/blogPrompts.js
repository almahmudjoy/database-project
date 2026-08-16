const {
    createBlog,
    getBlogsByUserId,
    findBlogById,
    searchBlogsForUser,
    allBlog,
    updateBlog,
    deleteBlog,
} = require('../services/blogService');
const { getCurrentUser } = require('../services/session');

function printBlogDetails(blog) {
    console.log(`Blog ID: ${blog.id}`);
    console.log(`Title: ${blog.blogTitle}`);
    console.log(`Category: ${blog.category}`);
    console.log(`Content: ${blog.blog}`);
    console.log(`Author/User ID: ${blog.userId}`);
    console.log(`Created At: ${blog.createAt}`);
    console.log(`Updated At: ${blog.updateAt}`);
}

async function showUserBlogs() {
    const currentUser = getCurrentUser();
    const blogs = await getBlogsByUserId(currentUser.id);

    if (blogs.length === 0) {
        console.log('No blogs are found');
        return;
    }

    console.log('\nYour Blogs:');
    blogs.forEach((blog, index) => {
        console.log(`${index + 1}. ${blog.blogTitle}`);
    });
}

async function createBlogPrompt(prompt) {
    const currentUser = getCurrentUser();
    const blogTitle = (await prompt.ask('Blog title: ')).trim();
    const blogContent = (await prompt.ask('Blog content: ')).trim();
    const category = (await prompt.ask('Category: ')).trim();

    try {
        const created = await createBlog({
            userId: currentUser.id,
            blogTitle,
            blog: blogContent,
            category,
        });
        console.log('Blog created successfully');
        console.log(`ID: ${created.id}`);
        console.log(`Title: ${created.blogTitle}`);
        console.log(`Category: ${created.category}`);
    } catch (error) {
        console.log(`Blog creation failed: ${error.message}`);
    }
}

async function searchBlogPrompt(prompt) {
    const currentUser = getCurrentUser();
    const query = (await prompt.ask('Search by Blog ID or Title: ')).trim();

    const results = /^\d+$/.test(query)
        ? await searchBlogsForUser({ userId: currentUser.id, id: Number(query) })
        : await searchBlogsForUser({ userId: currentUser.id, title: query });

    if (results.length === 0) {
        console.log('No matching blog found');
        return;
    }

    results.forEach((blog) => {
        console.log('---');
        printBlogDetails(blog);
    });
}

async function updateBlogPrompt(prompt) {
    const currentUser = getCurrentUser();
    const id = Number((await prompt.ask('Blog ID to update: ')).trim());

    const blog = await findBlogById(id);
    if (!blog) {
        console.log('Blog not found');
        return;
    }

    if (blog.userId !== currentUser.id) {
        console.log('You can only update your own blog');
        return;
    }

    const blogTitle = (await prompt.ask(`Blog title [${blog.blogTitle}]: `)).trim();
    const blogContent = (await prompt.ask(`Blog content [${blog.blog}]: `)).trim();
    const category = (await prompt.ask(`Category [${blog.category}]: `)).trim();

    const updates = {
        blogTitle: blogTitle || blog.blogTitle,
        blog: blogContent || blog.blog,
        category: category || blog.category,
    };

    const result = await updateBlog(id, currentUser.id, updates);

    if (result.status === 'OK') {
        console.log('Blog updated successfully');
        printBlogDetails(result.blog);
    } else if (result.status === 'NOT_FOUND') {
        console.log('Blog not found');
    } else {
        console.log('You can only update your own blog');
    }
}

async function allBlogPrompt() {
    const blogs = await allBlog();

    if (blogs.length === 0) {
        console.log('No blogs are found');
        return;
    }

    console.log('\n===== ALL BLOGS =====');
    blogs.forEach((blog) => {
        console.log(`\nBlog ID: ${blog.id}`);
        console.log(`Title: ${blog.blogTitle}`);
        console.log(`Category: ${blog.category}`);
        console.log(`Author: ${blog.User.firstname} ${blog.User.lastname}`);
        console.log(`User ID: ${blog.userId}`);
        console.log(`Content: ${blog.blog}`);
        console.log(`Created At: ${blog.createAt}`);
        console.log(`Updated At: ${blog.updateAt}`);
    });
}

async function deleteBlogPrompt(prompt) {
    const currentUser = getCurrentUser();
    const id = Number((await prompt.ask('Blog ID to delete: ')).trim());

    const result = await deleteBlog(id, currentUser.id);

    if (result.status === 'OK') {
        console.log('Blog deleted successfully');
    } else if (result.status === 'NOT_FOUND') {
        console.log('Blog not found');
    } else {
        console.log('You can only delete your own blog');
    }
}

module.exports = {
    showUserBlogs,
    createBlogPrompt,
    searchBlogPrompt,
    allBlogPrompt,
    updateBlogPrompt,
    deleteBlogPrompt,
};

