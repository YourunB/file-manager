
import { Commands } from "./src/commands";

export default class App extends Commands {
  constructor() {
    super();
  }

  init = async () => await this.askCommand();
}
