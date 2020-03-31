import * as React from 'react';

import { IVector } from './Shape';
import Cell from './Cell';
import { getPositionKey } from './GameHelpers';

export interface IField {
  filledCells: { [key: string]: IVector & { id: string }};
  size: IVector;
}

interface IFieldProps extends IField {
  cellSize: number;
  children: React.ReactNode;
}

export default ({ cellSize, children, filledCells, size }: IFieldProps) => (
  <div
    className='field'
    style={{
      width: `${size.x * cellSize}px`,
      height: `${size.y * cellSize}px`,
      backgroundSize: `${100 / size.x}% ${100 / size.y}%`,
    }}
  >
    <div
      className='field__cells'
      style={{
        width: `${100 / size.x}%`,
        height: `${100 / size.y}%`,
      }}
    >
      {Object.values(filledCells).map(cell => cell && (
        <Cell offset={cell} key={cell.id} />
      ))}
    </div>
    {children}
  </div>
);
