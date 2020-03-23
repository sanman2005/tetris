import * as React from 'react';

interface IFieldProps {
  cellSize: number;
  children: React.ReactNode;
  sizeX: number;
  sizeY: number;
}

export default ({ cellSize, children, sizeX, sizeY }: IFieldProps) => (
  <div
    className='field'
    style={{
      width: `${sizeX * cellSize}px`,
      height: `${sizeY * cellSize}px`,
      backgroundSize: `${cellSize}px ${cellSize}px`,
    }}
  >
    {children}
  </div>
);
