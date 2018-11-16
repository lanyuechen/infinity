import { uuid } from '../lib/common';
import update from 'immutability-helper';

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

  async add(data) {
    data = {
      ...data,
      _id: data._id || uuid()
    };
    this.data.push(data);
    localStorage[this.table] = JSON.stringify(this.data);
    return data._id;
  }

  async remove(id) {
    this.data = this.data.filter(d => d._id !== id);
    localStorage[this.table] = JSON.stringify(this.data);
  }

  async update(query, spec) {
    this.data = this.data.map(d => {
      if (Object.entries(query).every(([k, v]) => d[k] === v)) {
        return update(d, spec);
      }
      return d;
    });
    localStorage[this.table] = JSON.stringify(this.data);
  }

  async find(query) {
    if (query) {
      return this.data.filter(d => Object.entries(query).every(([k, v]) => d[k] === v));
    }
    return this.data;
  }

  async findOne(query) {
    return await this.find(query).then(res => res[0]);
  }
}