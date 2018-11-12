import { uuid } from 'lib/common';

export const CLOCK = Symbol('系统时钟');

/**
 * Cell
 * id     组件id
 * type   组件类型(COMPONENT, FUNCTION)
 * name   组件名称
 * input  输入组件引用数组
 * body   组件体, type = COMPONENT 时 body为Cell实例数组; type = FUNCTION 时 body 为 function
 * clock  组件时钟, 用来判断是否循环引用
 * innerClock  组件内部用来判断是否循环引用
 * lastData  上一次的输出值
 */
export default class Cell {
  constructor(config) {
    this.clock = 0;

    if (config.from) {  //完整配置
      this.initByFullConfig(config);
    } else {            //简单配置
      this.initBySimpleConfig(config);
    }
  }

  initByFullConfig(config) {
    const root = config.components[config.from];

    this.id = config.id || uuid();
    this.type = root.type;
    this.name = root.name;
    this.input = config.input || [];
    this.out = root.output;

    this.body = root.links.map(d => {
      const c = config.components[d.component];
      if (c.type === 'COMPONENT') {
        const cMap = c.input.reduce((p, n, i) => {
          p[n] = d.input[i];
          return p;
        }, {});
        return new Cell({
          components: {
            ...config.components,
            [d.component]: {
              ...c,
              input: d.input,
              links: c.links.map(l => ({
                ...l,
                input: l.input.map((key, i) => cMap[key] || key)
              }))
            }
          },
          id: d.id,
          input: d.input,
          output: c.output,
          from: d.component
        });
      }
      return new Cell({
        ...d,
        ...c
      })
    });
  }

  initBySimpleConfig(config) {
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

  calc(out, ...args) {
    const current = this.body.find(d => d.id === out);

    if (!current) {
      return args[this.input.findIndex(k => k === out)];
    }

    if (current.innerClock >= window[CLOCK]) {
      return current.lastData;
    }

    current.innerClock = window[CLOCK];
    const args2 = current.input.map(key => this.calc(key, ...args));
    return current.output(...args2);
  }

  output(...args) {
    if (this.clock >= window[CLOCK]) {
      console.log('[反馈]', `${this.name}(${args}) = ${this.lastData}`);
      return this.lastData;
    }

    this.clock++;
    if (this.type === 'COMPONENT') {
      this.lastData = this.calc(this.out, ...args);
      console.log('[组件]', `${this.name}(${args}) = ${this.lastData}`);
      return this.lastData;
    }

    const func = this.body.bind({clock: window[CLOCK]});
    this.lastData = func(...args);

    console.log('[函数]', `${this.name}(${args}) = ${this.lastData}`);
    return this.lastData;
  }
}