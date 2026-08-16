const readline = require('readline');

function createPrompt() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return {
        ask: (question) => new Promise((resolve) => rl.question(question, resolve)),
        close: () => rl.close(),
    };
}

module.exports = { createPrompt };
