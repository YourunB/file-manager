
import { Commands } from "./src/commands.js";

export default class App extends Commands {
  constructor() {
    super();
  }

  init = async () => await this.askCommand();
}
