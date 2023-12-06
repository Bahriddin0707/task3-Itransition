import * as crypto from "crypto";
import * as readlineSync from "readline-sync";

class GameRules {
  private moves: string[];
  private winMatrix: string[][];

  constructor(moves: string[]) {
    this.moves = moves;
    this.winMatrix = this.generateWinMatrix();
  }

  private generateWinMatrix(): string[][] {
    const n = this.moves.length;
    const matrix: string[][] = [];

    for (let i = 0; i <= n; i++) {
      matrix[i] = new Array(n + 1).fill("Draw");
    }

    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= n; j++) {
        if (i === j) {
          matrix[i][j] = "Draw";
        } else if (i % n === (j % n) + 1) {
          matrix[i][j] = "Win";
        } else {
          matrix[i][j] = "Lose";
        }
      }
    }

    return matrix;
  }

  public getWinner(userChoice: number, computerChoice: number): string {
    return this.winMatrix[userChoice][computerChoice];
  }

  public displayHelp(): void {
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
  private key: string;

  constructor() {
    this.key = crypto.randomBytes(32).toString("hex");
  }

  public generateHMAC(message: string): string {
    const keyBuffer = Buffer.from(this.key, "hex");
    const hmac = crypto.createHmac("sha256", keyBuffer);
    hmac.update(message);
    return hmac.digest("hex");
  }

  public getKey(): string {
    return this.key;
  }
}

class RockPaperScissorsGame {
  private moves: string[];
  private rules: GameRules;
  private hmacGenerator: HMACGenerator;

  constructor(moves: string[]) {
    this.moves = moves;
    this.rules = new GameRules(moves);
    this.hmacGenerator = new HMACGenerator();
  }

  public playGame(): void {
    const computerChoice = Math.floor(Math.random() * this.moves.length) + 1;
    const hmacKey = this.hmacGenerator.getKey();

    console.log(
      `HMAC: ${this.hmacGenerator.generateHMAC(computerChoice.toString())}`
    );
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
    } else if (result === "Lose") {
      console.log("You lose!");
    } else {
      console.log("It's a draw!");
    }

    console.log(`HMAC key: ${hmacKey}`);
  }

  private displayMovesMenu(): void {
    console.log("Available moves:");
    this.moves.forEach((move, index) => {
      console.log(`${index + 1} - ${move}`);
    });
    console.log("0 - exit");
    console.log("? - help");
  }

  private getUserChoice(): number {
    while (true) {
      const userInput = readlineSync.question("Enter your move: ").trim();
      if (!isNaN(Number(userInput))) {
        const userChoice = parseInt(userInput, 10);
        if (userChoice >= 0 && userChoice <= this.moves.length) {
          return userChoice;
        }
      } else if (userInput?.toLowerCase() === "?") {
        this.rules.displayHelp();
      }
      console.log("Invalid input. Try again.");
    }
  }
}

const args = process.argv.slice(2);

if (
  args.length < 3 ||
  args.length % 2 === 0 ||
  new Set(args).size !== args.length
) {
  console.log(
    "Error: Incorrect arguments. Please provide an odd number of non-repeating strings."
  );
  console.log("Example: node game.js rock paper scissors lizard Spock");
  process.exit(1);
}

const moves = args;
const game = new RockPaperScissorsGame(moves);
game.playGame();
