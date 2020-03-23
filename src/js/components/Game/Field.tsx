import * as React from 'react';

import { IVector } from './Shape';
import Cell from './Cell';
import { getPositionKey } from './GameHelpers';

export interface IField {
  filledCells: { [key: string]: IVector};
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
      backgroundSize: `${cellSize}px ${cellSize}px`,
    }}
  >
    <div
      className='field__cells'
      style={{
        width: `${cellSize}px`,
        height: `${cellSize}px`,
      }}
    >
      {Object.values(filledCells).map((cell, index) => cell && (
        <Cell offset={cell} key={getPositionKey(cell)} />
      ))}
    </div>
    {children}
  </div>
);
