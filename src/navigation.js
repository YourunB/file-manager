import { sep } from 'path';
import { access } from 'fs/promises';
import { EOL as lineEnd } from 'node:os';
import { System } from './system';

export class Navigation extends System {
  constructor() {
    super();
  }

  up = () => {
    let pathSegments;

    pathSegments = this.activeDir ? this.activeDir.split(sep) : this.baseDir.split(sep);

    if (pathSegments.length > 1) {
      pathSegments.pop();
      this.activeDir = pathSegments.join(sep);
    }
  };

  changeDirectory = async (command) => {
    if (command === 'cd') return this.reader.write(`Command must include path: cd <path_to_file>${lineEnd}`);

    const [, targetPath] = command.split(' ');

    try {
      let basePath = this.activeDir || this.baseDir;
      const resolvedPath = path.resolve(basePath, targetPath);

      await access(resolvedPath);

      this.activeDir = resolvedPath;
    } catch {
        this.reader.write(`Specified path does not exist${lineEnd}`);
    }
  };
}