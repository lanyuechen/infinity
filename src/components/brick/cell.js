import { uuid } from 'lib/common';

export const CLOCK = Symbol('系统时钟');

export default class Cell {
  constructor(config) {
    this.clock = 0;

    if (config.from) {
      const root = config.components[config.from];
      this.body = root.links.map(d => {
        const c = config.components[d.component];
        if (c.type === 'COMPONENT') {
          return new Cell({...config, from: d.component});
        }
        return new Cell({
          ...d,
          ...c
        })
      });
      return;
    }

    this.id = config.id || uuid();
    this.type = config.type;
    this.name = config.name;
    this.input = config.input || [];

    eval(`this.body = ${config.body}`);
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