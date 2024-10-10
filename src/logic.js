import { Navigation } from './navigation';
import { createReadStream, createWriteStream, promises as fsPromises } from 'fs';
import { pipeline } from 'stream';
import { createHash } from 'crypto';
import path from 'path';
import zlib from 'zlib';
import { EOL } from 'os';

const { readdir, writeFile, rename, unlink, readFile } = fsPromises;

export class Logic extends Navigation {
  constructor() {
    super();
  }

  ls = async () => {
    try {
      const list = await readdir(this.currentDir, { withFileTypes: true });
      const result = this.sortFileList(list);
      console.table(result);
    } catch {
      this.rl.write(this.errorMessage);
    }
  };

  sortFileList(list) {
    return list
      .map((file) => ({
        Name: file.name,
        Type: file.isDirectory() ? 'directory' : 'file',
      }))
      .sort((a, b) => {
        if (a.Type === 'file' && b.Type === 'directory') return 1;
        if (a.Type === 'directory' && b.Type === 'file') return -1;
        return a.Name.localeCompare(b.Name);
      });
  }

  cat = async (pathTo) => {
    if (!pathTo) return this.checkArgs(1);

    const pathToFile = path.resolve(this.currentDir, pathTo);
    const rs = createReadStream(pathToFile, { encoding: 'utf8' });

    rs.on('data', (chunk) => console.log(chunk));
    rs.on('error', () => console.log(`Couldn't find such file as ${pathTo}`));
    rs.on('close', () => {
      console.log(`Reading of ${pathTo} finished`);
      console.log(`You are currently in ${this.currentDir}`);
    });
  };

  add = async (fileName) => {
    if (!fileName) return this.checkArgs(1);

    const pathToFile = path.resolve(this.currentDir, fileName);
    try {
      await writeFile(pathToFile, '');
      this.rl.write(`${fileName} has been created${EOL}`);
    } catch {
      this.rl.write(`Error has occurred while creating file ${fileName}${EOL}`);
    }
  };

  rn = async (pathTo, newFileName) => {
    if (!pathTo || !newFileName) return this.checkArgs();

    const pathToFile = path.resolve(this.currentDir, pathTo);
    const fileDir = path.dirname(pathToFile);
    const pathToRenamedFile = path.resolve(fileDir, newFileName);

    try {
      await rename(pathToFile, pathToRenamedFile);
      console.log(`${pathTo} renamed to ${newFileName}`);
    } catch {
      console.log(`Couldn't find such file as ${pathTo}`);
    }
  };

  cp = async (pathFrom, pathTo) => {
    if (!pathFrom || !pathTo) return this.checkArgs();

    const pathToCopyFrom = path.resolve(this.currentDir, pathFrom);
    const originalFileName = path.basename(pathToCopyFrom);
    let pathToCopyTo = path.resolve(this.currentDir, pathTo, originalFileName);

    if (pathToCopyFrom === pathToCopyTo) {
      const [name, ext] = originalFileName.split('.');
      pathToCopyTo = path.resolve(this.currentDir, pathTo, `${name}-copy.${ext}`);
    }

    try {
      await this.copyFile(pathToCopyFrom, pathToCopyTo);
      console.log(`Copying was successfully completed`);
    } catch {
      await this.rm(pathToCopyTo, false);
    }
  };

  async copyFile(source, destination) {
    const rs = createReadStream(source);
    const ws = createWriteStream(destination);
    await pipeline(rs, ws);
  }

  mv = async (pathFrom, pathTo) => {
    if (!pathFrom || !pathTo) return this.checkArgs();

    const fileName = path.basename(pathFrom);
    const pathToNewDir = path.resolve(this.currentDir, pathTo, fileName);

    await this.cp(pathFrom, pathToNewDir);
    await this.rm(pathFrom, false);
  };

  rm = async (pathTo, mode = true) => {
    if (!pathTo) return this.checkArgs(1);

    const resolvedPath = path.resolve(this.currentDir, pathTo);
    try {
      await unlink(resolvedPath);
      if (mode) console.log(`${resolvedPath} removed`);
    } catch {
      if (mode) console.log(`Can't find such file in ${resolvedPath}`);
    }
  };

  os = async (command) => {
    const commands = {
      'os --EOL': this.os_eol,
      'os --cpus': this.os_cpus,
      'os --homedir': this.os_homedir,
      'os --username': this.os_username,
      'os --architecture': this.os_architecture,
    };

    if (commands[command]) {
      await commands[command].call(this);
    } else {
      this.rl.write(this.errorMessage);
    }
  };

  hash = async (pathTo) => {
    if (!pathTo) return this.checkArgs(1);

    const hash = createHash('sha256');
    const pathToFile = path.resolve(this.currentDir, pathTo);

    try {
      const result = await readFile(pathToFile, 'utf-8');
      hash.update(result);
      console.log(hash.digest('hex'));
    } catch {
      console.log('Wrong file path or file does not exist');
    }

    hash.end();
  };

  compress = async (pathFrom, pathTo) => {
    if (!pathFrom || !pathTo) return this.checkArgs();

    const fileName = path.basename(pathFrom);
    const pathToCompressFrom = path.resolve(this.currentDir, pathFrom);
    const pathToCompressTo = path.resolve(this.currentDir, pathTo, `${fileName}.br`);

    try {
      await this.compressFile(pathToCompressFrom, pathToCompressTo);
      console.log(`File compression successfully completed`);
    } catch {
      await this.rm(pathToCompressTo, false);
    }
  };

  async compressFile(source, destination) {
    const rs = createReadStream(source);
    const bs = zlib.createBrotliCompress();
    const ws = createWriteStream(destination);
    await pipeline(rs, bs, ws);
  }

  decompress = async (pathFrom, pathTo) => {
    if (!pathFrom || !pathTo) return this.checkArgs();

    const fileName = path.basename(pathFrom).split('.').slice(0, -1).join('.');
    const pathToDecompressFrom = path.resolve(this.currentDir, pathFrom);
    const pathToDecompressTo = path.resolve(this.currentDir, pathTo, fileName);

    try {
      await this.decompressFile(pathToDecompressFrom, pathToDecompressTo);
      console.log(`File decompression successfully completed`);
    } catch {
      await this.rm(pathToDecompressTo, false);
    }
  };

  async decompressFile(source, destination) {
    const rs = createReadStream(source);
    const bs = zlib.createBrotliDecompress();
    const ws = createWriteStream(destination);
    await pipeline(rs, bs, ws);
  }
}
