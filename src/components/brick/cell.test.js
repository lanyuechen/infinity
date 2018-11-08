import Cell, { CLOCK } from './cell';
import demo from '../../public/data/demo.json';

const cell = Cell.load(demo);

describe('cell.js', () => {
  it('test-1', () => {
    console.log('===', 'test');
    expect(1).toBe(1);
  });
});
