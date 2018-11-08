import Cell, { CLOCK } from './cell';
import demo from '../../public/data/demo.json';

describe('cell.js', () => {
  const cell = new Cell(demo);

  it('test-1', () => {
    console.log('===', cell);
    expect(1).toBe(1);
  });
});
