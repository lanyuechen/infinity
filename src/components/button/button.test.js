import React from 'react';
import renderer from 'react-test-renderer';

import Button from './index';

describe('<Button />', () => {
  it('snapshot', () => {
    const c = renderer.create(<Button>按钮</Button>);
    expect(c.toJSON()).toMatchSnapshot();
  });
});