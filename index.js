import filePath from 'path';
import fileSystem from 'fs';
import operatingSystem from 'os';
import { createHash } from 'crypto';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { createBrotliCompress, createBrotliDecompress } from 'zlib';

const asyncPipeline = promisify(pipeline);

const userHomeDir = operatingSystem.homedir();
let currentWorkingDir = userHomeDir;
let currentUsername = '';

const displayCurrentDirectory = () => console.log(`You are currently in ${currentWorkingDir}`);

const handleUserInput = async (input) => {
  const [command, ...args] = input.trim().split(' ');

  switch (command) {
    case 'up':
      const parentDirectory = filePath.dirname(currentWorkingDir);
      if (parentDirectory !== currentWorkingDir) currentWorkingDir = parentDirectory;
      break;

    case 'cd':
      const newDirectory = filePath.resolve(currentWorkingDir, args[0]);
      (fileSystem.existsSync(newDirectory) && fileSystem.statSync(newDirectory).isDirectory()) ? currentWorkingDir = newDirectory : console.log('Invalid input');
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

    case 'rm':
      fileSystem.unlinkSync(filePath.resolve(currentWorkingDir, args[0]));
      break;

    case 'os':
      switch (args[0]) {
        case '--EOL':
          console.log(operatingSystem.EOL);
          break;
        case '--cpus':
          const cpuInfo = operatingSystem.cpus();
          console.log(`Total CPUs: ${cpuInfo.length}`);
          cpuInfo.forEach((cpu, index) => {
            console.log(`CPU ${index + 1}: ${cpu.model}, ${cpu.speed} MHz`);
          });
          break;
        case '--homedir':
          console.log(userHomeDir);
          break;
        case '--username':
          console.log(operatingSystem.userInfo().username);
          break;
        case '--architecture':
          console.log(operatingSystem.arch());
          break;
        default:
          console.log('Invalid input');
      }
      break;

    case 'hash':
      const fileToHash = filePath.resolve(currentWorkingDir, args[0]);
      const hashCalculator = createHash('sha256');
      const fileStream = createReadStream(fileToHash);
      fileStream.on('data', (data) => hashCalculator.update(data));
      fileStream.on('end', () => console.log(hashCalculator.digest('hex')));
      break;

    case 'compress':
      const [compressSource, compressDestination] = args;
      await asyncPipeline(
        createReadStream(filePath.resolve(currentWorkingDir, compressSource)),
        createBrotliCompress(),
        createWriteStream(filePath.resolve(currentWorkingDir, compressDestination))
      ).catch(() => console.log('Operation failed'));
      break;

    case 'decompress':
      const [decompressSource, decompressDestination] = args;
      await asyncPipeline(
        createReadStream(filePath.resolve(currentWorkingDir, decompressSource)),
        createBrotliDecompress(),
        createWriteStream(filePath.resolve(currentWorkingDir, decompressDestination))
      ).catch(() => console.log('Operation failed'));
      break;

    case '.exit':
      console.log(`Thank you for using File Manager, ${currentUsername}, goodbye!`);
      process.exit();

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
    console.error('Error: Please provide username, for example: --username=your_name');
    process.exit(1);
  }

  console.log(`Welcome to the File Manager, ${currentUsername}!`);
  displayCurrentDirectory();

  process.stdin.on('data', (data) => handleUserInput(data.toString()));
};

init();
