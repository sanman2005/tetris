import * as React from 'react';
import cn from 'classnames';

import Cell, { ICell } from './Cell';
import { getPositionKey } from './GameHelpers';
import Smile, { ISmile, Smiles } from './Smile';

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
  smile?: Smiles;
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

interface IShapeProps extends IShape {
  cellSize: number;
}

interface IShapeState {
  smile: ISmile;
}

const getSmileParams = (cells: ICell[]) => {
  let maxY = -Number.MIN_VALUE;
  const rows = cells.reduce((result: { [key: string]: number[] }, cell) => {
    const { y } = cell.offset;

    result[y] = [...(result[y] || []), cell.offset.x];
    maxY = Math.max(y, maxY);

    return result;
  }, {});

  const isTopHigher = !!rows[maxY - 1];
  const leftBottom = Math.min(...rows[maxY]);
  const leftTop = isTopHigher ? Math.min(...rows[maxY - 1]) : leftBottom;
  const bottomCount = rows[maxY].length;
  const topCount = isTopHigher ? rows[maxY - 1].length : bottomCount;
  const bottomSize = Math.min(bottomCount, 2);
  const topSize = Math.min(topCount, 2);
  const bottomOffset = bottomSize * 0.5;
  const topOffset = topSize * 0.5;

  let bottomX = Math.floor(leftBottom - bottomOffset + bottomCount / 2);
  let topX = Math.floor(leftTop - topOffset + topCount / 2);

  const top = {
    size: { x: topSize, y: 1 },
    position: { x: topX, y: isTopHigher ? maxY - 1 : maxY },
  };
  const bottom = {
    size: { x: bottomSize, y: 1 },
    position: { x: bottomX, y: maxY },
  };
  const right = {
    size: { x: 1, y: 1 },
    position: { x: top.position.x + topCount, y: top.position.y },
  };

  return { top, bottom, right };
};

export default class Shape extends React.PureComponent<
  IShapeProps,
  IShapeState
> {
  state = {
    smile: this.props.smile && {
      type: this.props.smile,
      ...getSmileParams(this.props.cells),
    },
  };

  componentDidUpdate(prevProps: Readonly<IShapeProps>) {
    const { cells, smile } = this.props;

    if (smile && prevProps.cells !== cells) {
      this.setState({
        smile: {
          type: smile,
          ...getSmileParams(cells),
        },
      });
    }
  }

  render() {
    const { cellSize, cells, color, position } = this.props;
    const { smile } = this.state;

    return (
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
        {smile && <Smile {...smile} />}
      </div>
    );
  }
}
