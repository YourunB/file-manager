import { EOL } from 'os';

export const commandsList = {
  '--help': 'All commands',
  cat: "Read file and print its content in console: cat <path_to_file>",
  add: 'Create empty file in current working directory: add <new_file_name>',
  rn: 'Rename file (content should remain unchanged): rn <path_to_file> <new_filename>',
  cp: 'Copy file (should be done using Readable and Writable streams): cp <path_to_file> <path_to_new_directory>',
  mv: 'Move file (same as copy but initial file is deleted): mv <path_to_file> <path_to_new_directory>',

  rm: 'Delete file: rm <path_to_file>',
  '--EOL': 'Get system End-Of-Line: os --EOL',
  '--cpus': 'Get host machine CPUs info: os --cpus',
  '--homedir': 'Get home directory: os --homedir',
  '--username': 'Get current system user name: os --username',
  '--architecture': 'Get CPU architecture: os --architecture',

  os: `Operating system info: os --flag:${EOL}  
  --EOL - Get system End-Of-Line${EOL}  
  --cpus - Get host machine CPUs info (overall amount of CPUs plus model and clock rate in GHz)${EOL}  
  --homedir - Get home directory${EOL}  
  --username - Get current system user name${EOL}  
  --architecture - Get CPU architecture for which Node.js binary has compiled`,
  
  hash: 'Calculate hash for file: hash <path_to_file>',
  compress: 'Compress file (using Brotli algorithm): compress <path_to_file> <path_to_destination>',
  decompress: 'Decompress file (using Brotli algorithm): decompress <path_to_file> <path_to_destination>',
};