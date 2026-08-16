const { registerUser, loginUser } = require('../services/userService');
const { setCurrentUser } = require('../services/session');

async function register(prompt) {
    const firstname = (await prompt.ask('First name: ')).trim();
    const lastname = (await prompt.ask('Last name: ')).trim();
    const email = (await prompt.ask('Email: ')).trim();
    const password = await prompt.ask('Password: ');

    try {
        await registerUser({ firstname, lastname, email, password });
        console.log('User registered successfully');
    } catch (error) {
        console.log(`Registration failed: ${error.message}`);
    }
}

async function login(prompt) {
    const email = (await prompt.ask('Email: ')).trim();
    const password = await prompt.ask('Password: ');

    try {
        const user = await loginUser({ email, password });
        setCurrentUser(user);
        console.log(`Login successful. Welcome, ${user.firstname}!`);
        return true;
    } catch (error) {
        console.log(error.message);
        return false;
    }
}

module.exports = { register, login };
