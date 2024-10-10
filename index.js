const fileSystem = require('fs');
const filePath = require('path');
const operatingSystem = require('os');

const userHomeDir = operatingSystem.homedir();
let currentWorkingDir = userHomeDir;
let currentUsername = '';

const displayCurrentDirectory = () => {
  console.log(`You are currently in ${currentWorkingDir}`);
};

const handleUserInput = async (input) => {
  const [command, ...args] = input.trim().split(' ');

  switch (command) {
    case 'up':
      const parentDirectory = filePath.dirname(currentWorkingDir);
      if (parentDirectory !== currentWorkingDir) currentWorkingDir = parentDirectory;
      break;

    case 'cd':
      const newDirectory = filePath.resolve(currentWorkingDir, args[0]);
      if (fileSystem.existsSync(newDirectory) && fileSystem.statSync(newDirectory).isDirectory()) {
        currentWorkingDir = newDirectory;
      } else {
        console.log('Invalid input');
      }
      break;

    default:
      console.log('Invalid input');
  }

  displayCurrentDirectory();
};

const init = () => {
  const args = process.argv.slice(2);

  const usernameArgument = args.find(arg => arg.startsWith('--username='));
  if (usernameArgument) {
    currentUsername = usernameArgument.split('=')[1].trim();
  } else {
    console.error('Error: Please provide a username using --username=your_username');
    process.exit(1);
  }

  console.log(`Welcome to the File Manager, ${currentUsername}!`);
  displayCurrentDirectory();

  process.stdin.on('data', (data) => {
    handleUserInput(data.toString());
  });
};

init();
