import * as React from 'react';

export interface IVector {
  x: number;
  y: number;
}

export interface ICell {
  offset: IVector;
}

export interface IShape {
  direction: IVector;
  position: IVector;
  cells: ICell[];
}

export interface IShapeProps extends IShape {
  cellSize: number;
}

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
    {cells.map(cell => (
      <div
        className='cell'
        style={{
          left: `${cell.offset.x * 100}%`,
          top: `${cell.offset.y * 100}%`,
        }}
      />
    ))}
  </div>
);
