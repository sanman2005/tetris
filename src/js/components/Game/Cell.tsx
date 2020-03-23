import * as React from 'react';

import { IVector } from './Shape';

export interface ICell {
  offset: IVector;
}

export default ({ offset }: ICell) => (
  <div
    className='cell'
    style={{
      left: `${offset.x * 100}%`,
      top: `${offset.y * 100}%`,
    }}
  />
);
