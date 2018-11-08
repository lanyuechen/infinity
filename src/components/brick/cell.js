import { uuid } from 'lib/common';

export const CLOCK = Symbol('系统时钟');

/**
 * Cell
 * id     组件id
 * type   组件类型(COMPONENT, FUNCTION)
 * name   组件名称
 * input  输入组件引用数组
 * body   组件体, type = COMPONENT 时 body为Cell实例数组; type = FUNCTION 时 body 为 function
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

    console.log('========', root.name, root.output)

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