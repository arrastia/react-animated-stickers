import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

import { Monkey } from '../src';

describe('it', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');

    render(<Monkey />, div);
    unmountComponentAtNode(div);
  });
});
