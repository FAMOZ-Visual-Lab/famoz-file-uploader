import { observable, action } from "mobx";
import { toJS } from "mobx";

export default class MainStore {
  constructor(root) {
    this.root = root;
  }

  @observable
  progressList = [];

  @action
  setProgressList = (data, deleteObj) => {
    this.progressList = toJS(data);
  };

  @observable
  isDefault = true;

  @action
  setIsDefault = bool => {
    this.isDefault = bool;
  };
}
