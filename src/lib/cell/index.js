import { uuid } from 'lib/common';

export const CLOCK = Symbol('系统时钟');

/**
 * Cell
 * id     组件id
 * type   组件类型(COMPONENT, FUNCTION)
 * name   组件名称
 * desc   简介
 * x      x坐标
 * y      y坐标
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
    this.input = config.input || [];
    this.out = root.output;
    this.component = root.component;
    this.assignInfo(this, root);

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
              component: d.component,
              input: d.input,
              x: d.x,
              y: d.y,
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
    this.input = config.input || [];
    this.component = config.component;
    this.assignInfo(this, config);

    eval(`this.body = ${config.body}`);
  }

  assignInfo(scope, config) {
    scope.type = config.type;
    scope.name = config.name;
    scope.desc = config.desc;
    scope.x = config.x;
    scope.y = config.y;
  }

  reset() {
    this.clock = 0;
    this.lastData = undefined;
    this.innerClock = undefined;
    if (this.type === 'COMPONENT') {
      this.body.map(d => d.reset());
    }
  }

  setFunc(func) {
    eval(`this.body = ${func}`);
  }

  addInput(input) {
    this.input.push(input);
  }

  removeInput(idx) {
    this.input.splice(idx, 1);
  }

  toJson() {
    const components = {};
    this.getComponents(components);
    return {
      from: this.id,
      components
    }
  }

  getComponents(components) {
    components = components || {};
    if (components[this.component || this.id]) {
      return;
    }
    if (this.type === 'COMPONENT') {
      components[this.component || this.id] = {
        input: this.input,
        output: this.out,
        type: this.type,
        name: this.name,
        desc: this.desc,
        links: this.body.map(c => ({
          id: c.id,
          input: c.input,
          component: c.component,
          x: c.x,
          y: c.y
        }))
      };
      this.body.map(d => {
        d.getComponents(components);
      });
    } else {
      components[this.component] = {
        type: this.type,
        name: this.name,
        desc: this.desc,
        body: this.body && this.body.toString()
      };
    }
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