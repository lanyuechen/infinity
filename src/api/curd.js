import { uuid } from '../lib/common';

export default class Curd {
  constructor(table) {
    this.table = table;
    let data = localStorage[table];

    if (!data) {
      localStorage[table] = JSON.stringify([]);
      data = localStorage[table];
    }

    this.data = JSON.parse(data);
  }

  add(data) {
    this.data.push({
      ...data,
      _id: data._id || uuid()
    });
    localStorage[this.table] = JSON.stringify(this.data);
  }

  remove(id) {
    this.data = this.data.filter(d => d._id !== id);
    localStorage[this.table] = JSON.stringify(this.data);
  }

  update(id, data) {
    this.data = this.data.map(d => {
      if (d._id === id) {
        return {
          ...d, ...data
        }
      }
      return d;
    });
    localStorage[this.table] = JSON.stringify(this.data);
  }

  find(id) {
    if (id) {
      return this.data.filter(d => d._id === id);
    }
    return this.data;
  }
}