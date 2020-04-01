import * as React from 'react';
import cn from 'classnames';

import Cell, { ICell } from './Cell';
import { getPositionKey } from './GameHelpers';

export interface IVector {
  x: number;
  y: number;
}

export enum Colors {
  blue = 'blue',
  red = 'red',
  yellow = 'yellow',
}

export interface IShape {
  id?: string;
  position?: IVector;
  cells: ICell[];
  color?: Colors;
}

export interface IShapeProps extends IShape {
  cellSize: number;
}

export const shapes: { [key: string]: ICell[] } = {
  Cube: [
    { offset: { x: 0, y: 0 } },
    { offset: { x: 0, y: 1 } },
    { offset: { x: 1, y: 0 } },
    { offset: { x: 1, y: 1 } },
  ],
  Stick: [
    { offset: { x: -1, y: 0 } },
    { offset: { x: 0, y: 0 } },
    { offset: { x: 1, y: 0 } },
    { offset: { x: 2, y: 0 } },
  ],
  Zipper: [
    { offset: { x: -1, y: 0 } },
    { offset: { x: 0, y: 0 } },
    { offset: { x: 0, y: 1 } },
    { offset: { x: 1, y: 1 } },
  ],
  ZipperR: [
    { offset: { x: -1, y: 1 } },
    { offset: { x: 0, y: 1 } },
    { offset: { x: 0, y: 0 } },
    { offset: { x: 1, y: 0 } },
  ],
  L: [
    { offset: { x: -1, y: 0 } },
    { offset: { x: 0, y: 0 } },
    { offset: { x: 1, y: 0 } },
    { offset: { x: 1, y: 1 } },
  ],
  LR: [
    { offset: { x: -1, y: 0 } },
    { offset: { x: -1, y: 1 } },
    { offset: { x: 0, y: 0 } },
    { offset: { x: 1, y: 0 } },
  ],
  T: [
    { offset: { x: 0, y: 0 } },
    { offset: { x: -1, y: 0 } },
    { offset: { x: 0, y: -1 } },
    { offset: { x: 1, y: 0 } },
  ],
};

export default ({ cellSize, cells, color, position }: IShapeProps) => (
  <div
    className={cn('shape', { [`shape--${color}`]: color })}
    style={{
      width: `${cellSize}px`,
      height: `${cellSize}px`,
      left: `${position.x * cellSize}px`,
      top: `${position.y * cellSize}px`,
    }}
  >
    {cells.map(cell => (
      <Cell {...cell} key={getPositionKey(cell.offset)} />
    ))}
  </div>
);
