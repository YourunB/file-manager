import readline from 'node:readline/promises';
import { argv as args, stdin as input, stdout as output } from 'node:process';
import { EOL as lineEnd, homedir as homeDir } from 'node:os';

export class FileManager {
  constructor() {
    this.argName = 'username';
    this.currentUser = this.extractUserName();
    this.welcomeDisplayed = true;
    this.baseDir = homeDir();
    this.activeDir = this.baseDir;
    this.errorText = `Operation failed, use command --help to see list of commands${lineEnd}`;

    this.reader = readline.createInterface({
      input: input,
      output: output,
    });
    this.reader.on('SIGINT', this.exitMessage);
  }

  extractUserName = () => args.find((arg) => arg.includes(this.argName)).split('=')[1];
  
  displayCommandList = (commands) => Object.entries(commands).forEach(([cmd, desc]) => this.reader.write(`${cmd}: ${desc}${lineEnd}`));;

  displayWelcomeMessage = () => {
    this.reader.write(`Welcome to the File Manager, ${this.currentUser}!${lineEnd}`);
    this.welcomeDisplayed = false;
  };

  exitMessage = () => {
    console.log(`Thank you for using File Manager, ${this.currentUser}, goodbye!`);
    this.reader.close();
  };

  displayCurrentDirectory = () => this.reader.write(`You are currently in ${this.activeDir}${lineEnd}`);

  validateArguments = (expectedCount = 2) => console.log(`Wrong command, it needs ${expectedCount} argument${expectedCount > 1 ? 's' : ''}`);
}
