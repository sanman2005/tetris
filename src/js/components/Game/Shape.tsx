import * as React from 'react';

interface IVector {
  x: number;
  y: number;
}

export interface ICell {
  offsetDirection: IVector;
  next: ICell;
}

interface IShapeProps {
  cellSize: number;
  rootCell: ICell;
}

const Cell = ({ offsetDirection, next }: ICell) => (
  <div
    className='cell'
    style={{
      left: `${offsetDirection.x * 100}%`,
      top: `${offsetDirection.y * 100}%`,
    }}
  >
    {next && <Cell {...next} />}
  </div>
);

export default ({ cellSize, rootCell }: IShapeProps) => (
  <div
    className='shape'
    style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
  >
    <Cell {...rootCell} />
  </div>
);
