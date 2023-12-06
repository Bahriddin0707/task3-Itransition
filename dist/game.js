"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const readlineSync = require("readline-sync");
class GameRules {
    constructor(moves) {
        this.moves = moves;
        this.winMatrix = this.generateWinMatrix();
    }
    generateWinMatrix() {
        const n = this.moves.length;
        const matrix = [];
        for (let i = 0; i <= n; i++) {
            matrix[i] = new Array(n + 1).fill("Draw");
        }
        for (let i = 1; i <= n; i++) {
            for (let j = 1; j <= n; j++) {
                if (i === j) {
                    matrix[i][j] = "Draw";
                }
                else if (i % n === (j % n) + 1) {
                    matrix[i][j] = "Win";
                }
                else {
                    matrix[i][j] = "Lose";
                }
            }
        }
        return matrix;
    }
    getWinner(userChoice, computerChoice) {
        return this.winMatrix[userChoice][computerChoice];
    }
    displayHelp() {
        const n = this.moves.length;
        console.log("Help:");
        console.log("   " + Array.from({ length: n + 1 }, (_, i) => i).join(" | "));
        console.log("---" + Array.from({ length: n }, () => "+---").join(""));
        for (let i = 0; i <= n; i++) {
            console.log(`${i} | ${this.winMatrix[i].join(" | ")}`);
        }
        console.log("\n");
    }
}
class HMACGenerator {
    constructor() {
        this.key = crypto.randomBytes(32).toString("hex");
    }
    generateHMAC(message) {
        const keyBuffer = Buffer.from(this.key, "hex");
        const hmac = crypto.createHmac("sha256", keyBuffer);
        hmac.update(message);
        return hmac.digest("hex");
    }
    getKey() {
        return this.key;
    }
}
class RockPaperScissorsGame {
    constructor(moves) {
        this.moves = moves;
        this.rules = new GameRules(moves);
        this.hmacGenerator = new HMACGenerator();
    }
    playGame() {
        const computerChoice = Math.floor(Math.random() * this.moves.length) + 1;
        const hmacKey = this.hmacGenerator.getKey();
        console.log(`HMAC: ${this.hmacGenerator.generateHMAC(computerChoice.toString())}`);
        this.displayMovesMenu();
        const userChoice = this.getUserChoice();
        if (userChoice === 0) {
            console.log("Exiting the game. Goodbye!");
            return;
        }
        console.log(`Your move: ${this.moves[userChoice - 1]}`);
        console.log(`Computer move: ${this.moves[computerChoice - 1]}`);
        const result = this.rules.getWinner(userChoice, computerChoice);
        if (result === "Win") {
            console.log("You win!");
        }
        else if (result === "Lose") {
            console.log("You lose!");
        }
        else {
            console.log("It's a draw!");
        }
        console.log(`HMAC key: ${hmacKey}`);
    }
    displayMovesMenu() {
        console.log("Available moves:");
        this.moves.forEach((move, index) => {
            console.log(`${index + 1} - ${move}`);
        });
        console.log("0 - exit");
        console.log("? - help");
    }
    getUserChoice() {
        while (true) {
            const userInput = readlineSync.question("Enter your move: ").trim();
            if (!isNaN(Number(userInput))) {
                const userChoice = parseInt(userInput, 10);
                if (userChoice >= 0 && userChoice <= this.moves.length) {
                    return userChoice;
                }
            }
            else if ((userInput === null || userInput === void 0 ? void 0 : userInput.toLowerCase()) === "?") {
                this.rules.displayHelp();
            }
            console.log("Invalid input. Try again.");
        }
    }
}
const args = process.argv.slice(2);
if (args.length < 3 ||
    args.length % 2 === 0 ||
    new Set(args).size !== args.length) {
    console.log("Error: Incorrect arguments. Please provide an odd number of non-repeating strings.");
    console.log("Example: node game.js rock paper scissors lizard Spock");
    process.exit(1);
}
const moves = args;
const game = new RockPaperScissorsGame(moves);
game.playGame();
