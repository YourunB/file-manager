import { commandsList } from "./commandsList.js";
import { Logic } from './logic.js';

export class Commands extends Logic {
  constructor() {
    super();
  }

  command = async () => {
    if (this.welcomeDisplayed) {
      this.displayWelcomeMessage();
      await this.command();
    } else {
      this.displayCurrentDirectory();
      await this.input();
    }
  };

  input = async () => {
    const fullCommand = await this.rl.question('> ');
    const trimmedCommand = this.trimCommand(fullCommand);
    const [commandName, commandPath, commandSecondPath] = trimmedCommand.split(' ');

    await this.executeCommand(commandName, commandPath, commandSecondPath);
  };

  trimCommand(fullCommand) {
    return fullCommand.replace('> ', '').replace(/ +/g, ' ').trim();
  }

  async executeCommand(commandName, commandPath, commandSecondPath) {
    switch (commandName) {
      case '--help':
        this.displayCommandList(commandsList);
        break;
      case 'up':
        this.up();
        break;
      case 'cd':
        await this.cd(commandPath);
        break;
      case 'ls':
        await this.ls();
        break;
      case 'cat':
        await this.cat(commandPath);
        break;
      case 'add':
        await this.add(commandPath);
        break;
      case 'rn':
        await this.rn(commandPath, commandSecondPath);
        break;
      case 'cp':
        await this.cp(commandPath, commandSecondPath);
        break;
      case 'mv':
        await this.mv(commandPath, commandSecondPath);
        break;
      case 'rm':
        await this.rm(commandPath);
        break;
      case 'os':
        await this.os(trimmedCommand);
        break;
      case 'hash':
        await this.hash(commandPath);
        break;
      case 'compress':
        await this.compress(commandPath, commandSecondPath);
        break;
      case 'decompress':
        await this.decompress(commandPath, commandSecondPath);
        break;
      case '.exit':
        this.exitMessage();
        return;
      default:
        this.rl.write(this.errorMessage);
        break;
    }
    await this.command();
  }
}