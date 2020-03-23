import * as React from 'react';

import Cell, { ICell } from './Cell';

export interface IVector {
  x: number;
  y: number;
}

export interface IShape {
  id?: string;
  direction: IVector;
  position: IVector;
  cells: ICell[];
}

export interface IShapeProps extends IShape {
  cellSize: number;
}

export const shapes: { [key: string]: IShape } = {
  T: {
    direction: { x: 1, y: 0 },
    position: { x: 0, y: 0 },
    cells: [
      { offset: { x: 0, y: 0 } },
      { offset: { x: -1, y: 0 } },
      { offset: { x: 0, y: -1 } },
      { offset: { x: 1, y: 0 } },
    ],
  },
};

export default ({ cellSize, direction, position, cells }: IShapeProps) => (
  <div
    className='shape'
    style={{
      width: `${cellSize}px`,
      height: `${cellSize}px`,
      left: `${position.x * cellSize}px`,
      top: `${position.y * cellSize}px`,
    }}
  >
    {cells.map(cell => <Cell {...cell} />)}
  </div>
);
