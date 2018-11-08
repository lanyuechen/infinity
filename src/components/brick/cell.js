import { uuid } from 'lib/common';

export const CLOCK = Symbol('系统时钟');

export default class Cell {
  static load(data) {
    //选取根节点 todo 考虑是否可以根据有无其他组件引用确定是否为根组件
    const root = Object.values(data).find(d => d.type === 'ROOT');
    return root.links.map(d => {
      const c = data[d.component];
      if (c.type === 'COMPONENT') {
        return Cell.load(c);
      }
      return new Cell({
        ...d,
        ...c
      })
    });
  }

  static extendLinks(links) {
    return links.reduce((p, n) => {
      const c = data[n.component];
      if (c.type === 'COMPONENT') {

      } else {
        p.push(n);
      }
    }, []);
  }

  constructor(config) {
    this.id = config.id || uuid();
    this.type = config.type;
    this.name = config.name;
    this.input = config.input || [];
    this.body = this.setBody(config.body);

    this.clock = 0;
  }

  reset() {
    this.clock = 0;
    this.lastData = undefined;
  }

  addInput(input) {
    this.input.push(input);
  }

  setInput(idx, input) {
    this.input[idx] = input;
  }

  removeInput(idx) {
    this.input.splice(idx, 1);
  }

  setBody(body) {
    if (!body) {
      throw new Error('body不能为空');
    } else if (typeof(body) === 'string') {
      eval(`this.body = ${body}`);
    } else if (typeof(body) === 'object') {
      this.body = body;
    }
  }

  output() {
    //如果当前模块计数大于全局计数,说明此模块处于循环调用,直接返回上次的值,防止死循环
    if (this.clock < window[CLOCK]) {
      this.clock += 1;
      const func = this.func.bind({tick: window[CLOCK]});
      this.lastData = func(...this.input.map(d => d.output()));
    }
    return this.lastData;
  }
}