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
import Field from './Field';
import Shape, { IShape, IVector, shapes } from './Shape';
import { correctShapeFieldPosition, pointRotate } from './GameHelpers';
import { random } from 'js/helpers';

const CELL_SIZE = 30;
const TIME_SHAPE_MOVE_MAX = 1;

interface IGameState {
  fieldSize: IVector;
  gameShapes: IShape[];
  shapeControlledIndex: number;
  timeShapeMove: number;
}

@observer
export default class Game extends React.Component<{}, IGameState> {
  state: IGameState = {
    fieldSize: { x: 10, y: 20 },
    gameShapes: [null],
    shapeControlledIndex: 0,
    timeShapeMove: TIME_SHAPE_MOVE_MAX,
  };

  timeoutShapeMove: NodeJS.Timeout = null;

  componentDidMount() {
    this.setNewShape();
    this.moveShapeOnTimer();
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutShapeMove);
  }

  setNewShape() {
    const { fieldSize, gameShapes, shapeControlledIndex } = this.state;
    const shapesNew = [...gameShapes];
    const allShapes = Object.values(shapes);
    const randomShape = allShapes[random(allShapes.length)];
    const randomPosition = {
      x: random(fieldSize.x),
      y: 0,
    };

    randomShape.id = uuid();

    correctShapeFieldPosition(
      randomPosition,
      fieldSize,
      randomShape,
      position => {
        randomShape.position = position;
        shapesNew[shapeControlledIndex] = randomShape;
        this.setState({ gameShapes: shapesNew });
      },
    );
  }

  moveLeft = () => this.move({ x: -1, y: 0 });
  moveRight = () => this.move({ x: 1, y: 0 });
  moveDown = () => this.move({ x: 0, y: 1 });

  move = (direction: IVector) => {
    const { fieldSize, gameShapes, shapeControlledIndex } = this.state;
    const shapesNew = [...gameShapes];
    const shape = shapesNew[shapeControlledIndex];

    correctShapeFieldPosition(
      { x: shape.position.x + direction.x, y: shape.position.y + direction.y },
      fieldSize,
      shape,
      position => {
        shape.position = position;
        this.setState({ gameShapes: shapesNew })
      },
      () => {
        this.setNewShape();
      }
    );
  };

  moveShapeOnTimer = () => {
    this.timeoutShapeMove = setTimeout(() => {
      this.moveDown();
      this.moveShapeOnTimer();
    }, this.state.timeShapeMove * 1000);
  };

  rotate = (angle = 90) => {
    const { fieldSize, gameShapes, shapeControlledIndex } = this.state;
    const shapesNew = [...gameShapes];
    const shape = { ...shapesNew[shapeControlledIndex] };

    shape.cells = [...shape.cells].map(cell => ({
      ...cell,
      offset: pointRotate(cell.offset, angle),
    }));

    correctShapeFieldPosition(
      shape.position,
      fieldSize,
      shape,
      position => {
        shape.position = position;
        shapesNew[shapeControlledIndex] = shape;
        this.setState({ gameShapes: shapesNew });
      },
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
    const { fieldSize, gameShapes } = this.state;

    return (
      <Content className='game'>
        <Control onKeyDown={this.onKeyDown} />
        <Field cellSize={CELL_SIZE} sizeX={fieldSize.x} sizeY={fieldSize.y}>
          {gameShapes.map(
            shape =>
              shape && <Shape key={shape.id} cellSize={CELL_SIZE} {...shape} />,
          )}
        </Field>
      </Content>
    );
  }
}
