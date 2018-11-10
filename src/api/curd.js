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

  async update(id, data) {
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

  async find(id) {
    if (id) {
      return this.data.filter(d => d._id === id);
    }
    return this.data;
  }

  async findOne(id) {
    return await this.find(id).then(res => res[0]);
  }
}