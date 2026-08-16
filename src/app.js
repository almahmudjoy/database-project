require('dotenv').config();
const mysql = require('mysql2/promise');
const { sequelize } = require('./models');
const { createPrompt } = require('./utils/prompt');
const { register, login } = require('./cli/authPrompts');
const {
    showUserBlogs,
    createBlogPrompt,
    searchBlogPrompt,
    allBlogPrompt,
    updateBlogPrompt,
    deleteBlogPrompt,
} = require('./cli/blogPrompts');
const {
    viewAllUsersPrompt,
    viewAllUsersBlogPrompt,
    searchAnyBlogPrompt,
    updateUserStatusPrompt,
    deleteUserPrompt,
    deleteAnyBlogPrompt,
} = require('./cli/adminPrompts');
const { getCurrentUser, clearCurrentUser } = require('./services/session');

async function ensureDatabaseExists() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });

    await connection.query(
        `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``
    );

    await connection.end();
}

async function showUserMenu(prompt) {
    while (true) {
        console.log('\n===== USER MENU =====');
        console.log('1. View My Blogs');
        console.log('2. Create Blog');
        console.log('3. Search Blog');
        console.log('4. Update Blog');
        console.log('5. Delete Blog');
        console.log('6. Logout');

        const choice = (await prompt.ask('Select an option: ')).trim();

        if (choice === '1') {
            await showUserBlogs();
        } else if (choice === '2') {
            await createBlogPrompt(prompt);
        } else if (choice === '3') {
            await searchBlogPrompt(prompt);
        } else if (choice === '4') {
            await updateBlogPrompt(prompt);
        } else if (choice === '5') {
            await deleteBlogPrompt(prompt);
        } else if (choice === '6') {
            clearCurrentUser();
            console.log('Logged out successfully.');
            break;
        } else {
            console.log('Invalid option. Try again.');
        }
    }
}

async function showAdminMenu(prompt) {
    while (true) {
        console.log('\n===== ADMIN MENU =====');
        console.log('1. View All Users');
        console.log('2. View All Blogs');
        console.log('3. Search Blog By ID');
        console.log('4. Update User Active Status');
        console.log('5. Delete User');
        console.log('6. Delete Blog');
        console.log('7. Logout');

        const choice = (await prompt.ask('Select an option: ')).trim();

        if (choice === '1') {
            await viewAllUsersPrompt();
        } else if (choice === '2') {
            await viewAllUsersBlogPrompt();
        } else if (choice === '3') {
            await searchAnyBlogPrompt(prompt);
        } else if (choice === '4') {
            await updateUserStatusPrompt(prompt);
        } else if (choice === '5') {
            await deleteUserPrompt(prompt);
        } else if (choice === '6') {
            await deleteAnyBlogPrompt(prompt);
        } else if (choice === '7') {
            clearCurrentUser();
            console.log('Logged out successfully.');
            break;
        } else {
            console.log('Invalid option. Try again.');
        }
    }
}

async function showMenu(prompt) {
    while (true) {
        console.log('\n===== MAIN MENU =====');
        console.log('1. Register');
        console.log('2. Login');
        console.log('3. View All Blogs');
        console.log('4. Exit');

        const choice = (await prompt.ask('Select an option: ')).trim();

        if (choice === '1') {
            await register(prompt);
        } else if (choice === '2') {
            const loggedIn = await login(prompt);
            if (loggedIn) {
                const currentUser = getCurrentUser();
                if (currentUser.role === 'admin') {
                    await showAdminMenu(prompt);
                } else {
                    await showUserBlogs();
                    await showUserMenu(prompt);
                }
            }
        } else if (choice === '3') {
            await allBlogPrompt();
        } else if (choice === '4') {
            break;
        } else {
            console.log('Invalid option. Try again.');
        }
    }
}

async function main() {
    await ensureDatabaseExists();

    await sequelize.authenticate();
    console.log('Database connected successfully');

    await sequelize.sync();
    console.log(`${process.env.DB_NAME} database synchronized successfully`);

    const prompt = createPrompt();
    await showMenu(prompt);
    prompt.close();

    await sequelize.close();
    console.log('Goodbye!');
}

main().catch((error) => {
    console.error('Application error:', error.message);
    process.exit(1);
});
