let currentUser = null;

function setCurrentUser(user) {
    currentUser = {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
    };
}

function getCurrentUser() {
    return currentUser;
}

function clearCurrentUser() {
    currentUser = null;
}

module.exports = { setCurrentUser, getCurrentUser, clearCurrentUser };
