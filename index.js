const fileSystem = require('fs');
const filePath = require('path');
const operatingSystem = require('os');
const { createHash, createReadStream, createWriteStream } = require('crypto');
const { pipeline } = require('stream');
const { promisify } = require('util');
const { createBrotliCompress, createBrotliDecompress } = require('zlib');

const asyncPipeline = promisify(pipeline);

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
      if (fileSystem.existsSync(newDirectory) && fileSystem.statSync(newDirectory).isDirectory()) currentWorkingDir = newDirectory;
      else console.log('Invalid input');
      break;

    case 'ls':
      const items = fileSystem.readdirSync(currentWorkingDir).map((item) => {
        const isDirectory = fileSystem.statSync(filePath.join(currentWorkingDir, item)).isDirectory();
        return { name: item, type: isDirectory ? 'directory' : 'file' };
      }).sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name));
      items.forEach(({ name, type }) => console.log(`${name} - ${type}`));
      break;

    case 'cat':
      const fileToRead = filePath.resolve(currentWorkingDir, args[0]);
      if (fileSystem.existsSync(fileToRead) && fileSystem.statSync(fileToRead).isFile()) {
        const stream = createReadStream(fileToRead);
        stream.pipe(process.stdout);
        stream.on('error', () => console.log('Operation failed'));
      } else console.log('Invalid input');
      break;

    case 'add':
      fileSystem.writeFileSync(filePath.join(currentWorkingDir, args[0]), '');
      break;

    case 'rn':
      const [oldFileName, newFileName] = args;
      fileSystem.renameSync(filePath.join(currentWorkingDir, oldFileName), filePath.join(currentWorkingDir, newFileName));
      break;

    case 'cp':
      await asyncPipeline(
        createReadStream(filePath.resolve(currentWorkingDir, args[0])),
        createWriteStream(filePath.resolve(currentWorkingDir, args[1]))
      ).catch(() => console.log('Operation failed'));
      break;

    case 'mv':
      await asyncPipeline(
        createReadStream(filePath.resolve(currentWorkingDir, args[0])),
        createWriteStream(filePath.resolve(currentWorkingDir, args[1]))
      ).catch(() => console.log('Operation failed'));
      fileSystem.unlinkSync(filePath.resolve(currentWorkingDir, args[0]));
      break;

    default:
      console.log('Invalid input');
  }

  displayCurrentDirectory();
};

const init = () => {
  const args = process.argv.slice(2);

  const usernameArgument = args.find(arg => arg.startsWith('--username='));
  if (usernameArgument) currentUsername = usernameArgument.split('=')[1].trim();
  else {
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
