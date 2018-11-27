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
  static assignInfo(scope, config) {
    scope.type = config.type;
    scope.name = config.name;
    scope.desc = config.desc;
    scope.x = config.x;
    scope.y = config.y;
  }

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

    this.id = root.id || uuid();
    this.input = root.input || [];
    this.out = root.output;
    this.component = root.component;
    Cell.assignInfo(this, root);

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
              ...d,
              links: c.links.map(l => ({
                ...l,
                input: l.input.map((key, i) => cMap[key] || key)
              }))
            }
          },
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
    Cell.assignInfo(this, config);

    eval(`this.body = ${config.body}`);
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

  //todo 验证正确性
  collapse(param) {
    const c = this.toJson();
    const old = c.components[c.from];
    const o = this.body.find(d => d.id === this.out);
    const from = uuid();

    const config = {
      from,
      components: {
        ...c.components,
        [c.from]: {
          ...old,
          output: this.out,
          name: param.name,
          desc: param.desc
        },
        [from]: {
          type: "COMPONENT",
          name: this.name,
          desc: this.desc,
          input: [],
          links: [{
            id: uuid(),
            input: [],
            component: c.from,
            x: o.x,
            y: o.y
          }]
        }
      }
    };
    this.initByFullConfig(config);
    return config;
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
      log('[反馈]', `${this.name}(${args}) = ${this.lastData}`);
      return this.lastData;
    }

    this.clock++;
    if (this.type === 'COMPONENT') {
      this.lastData = this.calc(this.out, ...args);
      log('[组件]', `${this.name}(${args}) = ${this.lastData}`);
      return this.lastData;
    } else if (this.type === 'VIEW') {
      return [this.clock, ...args.map(d => d.lastData)];
    }

    const func = this.body.bind({clock: window[CLOCK]});
    this.lastData = func(...args);

    log('[函数]', `${this.name}(${args}) = ${this.lastData}`);
    return this.lastData;
  }
}