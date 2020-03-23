import * as React from 'react';
import { observer } from 'mobx-react';
import { v4 as uuid } from 'uuid';

import { ModelStatus } from 'models/index';
import { pagesPath } from 'pages/index';
import i18n from 'js/i18n';

import Button from 'components/Button';
import Control from 'components/Control';
import Loading from 'components/Loading';
import NotFound from 'components/NotFound';
import { Content } from 'components/Grid';
import Field, { IField } from './Field';
import Shape, { IShape, IVector, shapes } from './Shape';
import {
  correctShapeFieldPosition,
  getPositionKey,
  pointRotate,
} from './GameHelpers';
import { random } from 'js/helpers';

const CELL_SIZE = 30;
const TIME_SHAPE_MOVE_MAX = 1;

interface IGameStats {
  rowsRemoved: number;
}

interface IGameState {
  field: IField;
  gameShapes: IShape[];
  shapeControlledIndex: number;
  stats: IGameStats;
  timeShapeMove: number;
}

@observer
export default class Game extends React.Component<{}, IGameState> {
  state: IGameState = {
    field: {
      size: { x: 10, y: 20 },
      filledCells: {},
    },
    gameShapes: [null],
    shapeControlledIndex: 0,
    stats: {
      rowsRemoved: 0,
    },
    timeShapeMove: TIME_SHAPE_MOVE_MAX,
  };

  timeoutShapeMove: NodeJS.Timeout = null;

  componentDidMount() {
    this.addNewShape();
    this.moveShapeOnTimer();
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutShapeMove);
  }

  gameover = () => {
    clearTimeout(this.timeoutShapeMove);
    console.log('gameover');
  };

  addNewShape() {
    const { field, gameShapes, shapeControlledIndex } = this.state;
    const shapesNew = [...gameShapes];
    const allShapes = Object.values(shapes);
    const shape: IShape = {
      id: uuid(),
      cells: allShapes[random(allShapes.length)],
      position: {
        x: random(field.size.x),
        y: 0,
      },
      direction: { x: 1, y: 0 },
    };

    correctShapeFieldPosition(
      shape.position,
      { x: shape.position.x, y: -1 },
      field,
      shape,
      position => {
        shape.position = position;
        shapesNew[shapeControlledIndex] = shape;
        this.setState({ gameShapes: shapesNew });
      },
      this.gameover,
    );
  }

  moveLeft = () => this.move({ x: -1, y: 0 });
  moveRight = () => this.move({ x: 1, y: 0 });
  moveDown = () => this.move({ x: 0, y: 1 });

  move = (direction: IVector) => {
    const { field, gameShapes, shapeControlledIndex } = this.state;
    const shapesNew = [...gameShapes];
    const shape = shapesNew[shapeControlledIndex];
    const shapeNewPosition = {
      x: shape.position.x + direction.x,
      y: shape.position.y + direction.y,
    };

    correctShapeFieldPosition(
      shapeNewPosition,
      shape.position,
      field,
      shape,
      position => {
        shape.position = position;
        this.setState({ gameShapes: shapesNew });
      },
      () => {
        this.fillFieldCells(shape);
        this.addNewShape();
      },
    );
  };

  fillFieldCells(shape: IShape) {
    const { field } = this.state;
    const filledCells = { ...field.filledCells };

    shape.cells.forEach(cell => {
      const cellPosition = {
        x: shape.position.x + cell.offset.x,
        y: shape.position.y + cell.offset.y,
      };

      filledCells[getPositionKey(cellPosition)] = cellPosition;
    });

    this.setState(
      {
        field: {
          ...field,
          filledCells,
        },
      },
      this.removeFilledRows,
    );
  }

  removeFilledRows = () => {
    const { field, stats } = this.state;
    const { filledCells, size } = field;
    const rowsFillCount: { [key: string]: number } = {};
    let newFilledCells = { ...filledCells };
    let removedRowsCount = 0;

    Object.values(filledCells).forEach(
      cell =>
        cell && (rowsFillCount[cell.y] = 1 + (rowsFillCount[cell.y] || 0)),
    );

    const clearRow = (index: number) => {
      const newFilledCellsCopy = newFilledCells;

      newFilledCells = {};
      removedRowsCount++;

      Object.keys(newFilledCellsCopy).forEach(key => {
        if (!newFilledCellsCopy[key] || newFilledCellsCopy[key].y > index) {
          return;
        }

        if (newFilledCellsCopy[key].y < index) {
          newFilledCellsCopy[key].y++;
          newFilledCells[getPositionKey(newFilledCellsCopy[key])] =
            newFilledCellsCopy[key];
        }
      });
    };

    Object.keys(rowsFillCount).forEach(row => {
      if (rowsFillCount[row] === size.x) {
        clearRow(+row);
      }
    });

    this.setState({
      field: { ...field, filledCells: newFilledCells },
      stats: { ...stats, rowsRemoved: removedRowsCount },
    });
  };

  moveShapeOnTimer = () => {
    this.timeoutShapeMove = setTimeout(() => {
      this.moveDown();
      this.moveShapeOnTimer();
    }, this.state.timeShapeMove * 1000);
  };

  rotate = (angle = 90) => {
    const { field, gameShapes, shapeControlledIndex } = this.state;
    const shapesNew = [...gameShapes];
    const shape = { ...shapesNew[shapeControlledIndex] };

    shape.cells = [...shape.cells].map(cell => ({
      ...cell,
      offset: pointRotate(cell.offset, angle),
    }));

    correctShapeFieldPosition(
      shape.position,
      shape.position,
      field,
      shape,
      position => {
        shape.position = position;
        shapesNew[shapeControlledIndex] = shape;
        this.setState({ gameShapes: shapesNew });
      },
      () => {},
    );
  };

  onKeyDown = (key: string) => {
    const keyHandlers: { [key: string]: () => void } = {
      ArrowLeft: this.moveLeft,
      ArrowRight: this.moveRight,
      ArrowDown: this.moveDown,
      KeyA: this.moveLeft,
      KeyD: this.moveRight,
      KeyS: this.moveDown,
      Space: this.rotate,
    };

    if (keyHandlers[key]) {
      keyHandlers[key]();
    }
  };

  render() {
    const { field, gameShapes, stats } = this.state;

    return (
      <Content className='game'>
        <Control onKeyDown={this.onKeyDown} />
        <Field {...field} cellSize={CELL_SIZE}>
          {gameShapes.map(
            shape =>
              shape && <Shape key={shape.id} cellSize={CELL_SIZE} {...shape} />,
          )}
        </Field>
        <div className='game__stats'>
          <div className='game__stats-label'>{i18n`rowsRemoved`}:</div>
          <div className='game__stats-value'>{stats.rowsRemoved}</div>
        </div>
      </Content>
    );
  }
}
