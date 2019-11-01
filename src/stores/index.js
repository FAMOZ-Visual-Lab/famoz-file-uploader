import MainStore from "./MainStore";

class RootStore {
  constructor() {
    this.main = new MainStore(this);
  }
}

export default RootStore;
