import * as React from 'react';

interface IFieldProps {
  children: React.ReactChild;
  sizeX: number;
  sizeY: number;
}

const CELL_SIZE = 30;

export default ({ children, sizeX, sizeY }: IFieldProps) => (
  <div
    className='field'
    style={{
      width: `${sizeX * CELL_SIZE}px`,
      height: `${sizeY * CELL_SIZE}px`,
      backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
    }}
  >
    {children}
  </div>
);
