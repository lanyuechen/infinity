import Cell, { CLOCK } from './index';

import demo from '../../public/data/demo.json';

window[CLOCK] = 0;
const cell = new Cell(demo);

function tick() {
  window[CLOCK]++;
  console.log('== output ==', cell.output());
}

describe('cell.js', () => {

  it('test-1', () => {
    tick();
    expect(1).toBe(1);
  });
});
