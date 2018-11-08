const INSTANCE = Symbol('实例索引');
const ROOT = '__data';

class Store {
  static getInstance() {
    if (!window[INSTANCE]) {
      window[INSTANCE] = new Store();
    }
    return window[INSTANCE];
  }

  constructor() {

  }

  find(path) {
    this.root = JSON.parse(localStorage[ROOT]);
    this.current = this.root;
    for (let key of path) {
      if (!this.current[key]) {
        return;
      }
      this.current = current[key];
    }
    return this;
  }

  add(data) {
    if (!this.data || !Array.isArray(this.data)) {
      throw new Error("[Store.add] 参数必须为数组");
    }
    this.data.push(data);
    localStorage[ROOT] = JSON.stringify(this.root);
    this.root = null;
    this.current = null;
  }
}

export default Store.getInstance();