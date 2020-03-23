import * as React from 'react';
import { observer } from 'mobx-react';

import { ModelStatus } from 'models/index';
import { pagesPath } from 'pages/index';
import i18n from 'js/i18n';

import Button from 'components/Button';
import Control from 'components/Control';
import Loading from 'components/Loading';
import NotFound from 'components/NotFound';
import { Content } from 'components/Grid';
import Field from './Field';
import Shape, { IShape, IVector } from './Shape';
import { getCorrectShapeFieldPosition } from './helpers';

export const CELL_SIZE = 30;

const shapeT: IShape = {
  direction: { x: 1, y: 0 },
  position: { x: 0, y: 0 },
  cells: [
    { offset: { x: 0, y: 0 } },
    { offset: { x: -1, y: 0 } },
    { offset: { x: 0, y: -1 } },
    { offset: { x: 1, y: 0 } },
  ],
};

interface IGameState {
  fieldSize: IVector;
  shapes: IShape[];
  shapeControlledIndex: number;
}

@observer
export default class Game extends React.Component<{}, IGameState> {
  state = {
    fieldSize: { x: 10, y: 20 },
    shapes: [shapeT],
    shapeControlledIndex: 0,
  };

  moveLeft = () => this.move({ x: -1, y: 0 });
  moveRight = () => this.move({ x: 1, y: 0 });
  moveDown = () => this.move({ x: 0, y: 1 });

  move(direction: IVector) {
    const { fieldSize, shapes, shapeControlledIndex } = this.state;
    const shapesNew = [...shapes];
    const shape = shapesNew[shapeControlledIndex];

    shape.position = getCorrectShapeFieldPosition(
      { x: shape.position.x + direction.x, y: shape.position.y + direction.y },
      fieldSize,
      shape,
    );

    this.setState({ shapes: shapesNew });
  }

  rotate() {}

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

    keyHandlers[key] && keyHandlers[key]();
  };

  render() {
    const { fieldSize, shapes } = this.state;

    return (
      <Content className='game'>
        <Control onKeyDown={this.onKeyDown} />
        <Field cellSize={CELL_SIZE} sizeX={fieldSize.x} sizeY={fieldSize.y}>
          {shapes.map((shape, index) => (
            <Shape key={index} cellSize={CELL_SIZE} {...shape} />
          ))}
        </Field>
      </Content>
    );
  }
}
