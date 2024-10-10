const fs = require('fs');
const path = require('path');
const os = require('os');
const { createHash, createReadStream, createWriteStream } = require('crypto');
const { pipeline } = require('stream');
const { promisify } = require('util');
const { createBrotliCompress, createBrotliDecompress } = require('zlib');

const asyncPipeline = promisify(pipeline);

const homeDir = os.homedir();
let currentDir = homeDir;
let username = '';

const displayCurrentDir = () => {
  console.log(`You are currently in ${currentDir}`);
};

const handleInput = async (input) => {
  const [command, ...args] = input.trim().split(' ');


  displayCurrentDir();
};

const init = () => {
  const args = process.argv.slice(2);

  const usernameArg = args.find(arg => arg.startsWith('--username='));
  if (usernameArg) username = usernameArg.split('=')[1].trim();
  else {
    console.error('Error: Please provide a username using --username=your_username');
    process.exit(1);
  }
  
  console.log(`Welcome to the File Manager, ${username}!`);
  displayCurrentDir();

  process.stdin.on('data', (data) => {
    handleInput(data.toString());
  });
};

init();
