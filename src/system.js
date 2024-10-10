import { EOL as lineEnd, platform, cpus, userInfo, arch } from 'node:os';
import { FileManager } from './init';

export class System extends FileManager {
  constructor() {
    super();
  }

  displayEndOfLine = async () => {
    const osType = platform();
    const eolCharacter = osType === 'win32' ? '\\n' : '\\r\\n';

    this.reader.write(`${eolCharacter}${lineEnd}`);
  };

  displayCPUInfo = async () => {
    const cpuInfo = cpus();
    const coreCount = cpuInfo.length;

    this.reader.write(`Cores quantity: ${coreCount}${lineEnd}`);
    cpuInfo.forEach((cpu, index) => {
      this.reader.write(
        `CPU #${(index + 1).toString().padStart(2, '0')}: model - ${cpu.model.split('@')[0].trim()}, clock rate - ${(cpu.speed / 1000).toFixed(2)}GHz${index === coreCount - 1 ? '.' : ','}${lineEnd}`
      );
    });
  };

  displayHomeDirectory = async () => {
    this.reader.write(`Homedir: ${this.baseDir}${lineEnd}`);
  };

  displayUsername = async () => {
    this.reader.write(`Username: ${userInfo().username}${lineEnd}`);
  };

  displayArchitecture = async () => {
    this.reader.write(`${arch()}${lineEnd}`);
  };
}
