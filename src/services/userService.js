const { User } = require('../models');
const { hashPassword, verifyPassword } = require('../utils/password');
const { isValidEmail } = require('../utils/validators');

async function registerUser({ firstname, lastname, email, password }) {
    if (!firstname || !lastname || !email || !password) {
        throw new Error('All fields are required');
    }

    if (!isValidEmail(email)) {
        throw new Error('Invalid email format');
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
        throw new Error('Email already exists');
    }

    const hashedPassword = hashPassword(password);
    const user = await User.create({
        firstname,
        lastname,
        email,
        password: hashedPassword,
    });

    return user;
}

async function loginUser({ email, password }) {
    if (!email || !password) {
        throw new Error('Email and password are required');
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
        throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
        throw new Error('User is deactivated');
    }

    const valid = verifyPassword(password, user.password);
    if (!valid) {
        throw new Error('Invalid email or password');
    }

    return user;
}

module.exports = { registerUser, loginUser };
