import * as React from 'react';
import { v4 as uuid } from 'uuid';
import cn from 'classnames';

import i18n from 'js/i18n';
import { random } from 'js/helpers';
import { IData, IRoom } from 'js/server/room';
import Actions from 'js/api/actions';
import {
  addDisconnectListener,
  addReceiveListener,
  removeDisconnectListener,
  removeReceiveListener,
} from 'js/api/listeners';
import { isConnected, send } from 'js/api/socket';

import Button from 'components/Button';
import Control from 'components/Control';
import { Content } from 'components/Grid';

import Field, { IField } from './Field';
import Shape, { Colors, IShape, IVector, shapes } from './Shape';
import { correctShapeFieldPosition, getPositionKey, pointRotate } from './GameHelpers';

const CELL_SIZE = 30;
const TIME_SHAPE_MOVE_MAX = 1;
const TIME_KEY_HANDLER_DELAY = 0.05;
const MY_SHAPE_INDEX = 'my';
const COLORS_ORDER = [Colors.blue, Colors.yellow, Colors.red];

export interface IGame {
  start: () => void;
  end: () => void;
  playerAdd: (id: string) => void;
  playerRemove: (id: string) => void;
}

interface IGameControl {
  direction?: IVector;
  angle?: number;
}

interface IGameStats {
  rowsRemoved: number;
}

interface IGameProps {
  onInit?: (handlers: IGame) => void;
  onBack?: () => void;
  online?: boolean;
  room?: IRoom;
  server?: boolean;
}

interface IGameState {
  field?: IField;
  gameOver?: boolean;
  gameShapes?: { [key: string]: IShape };
  stats?: IGameStats;
  timeShapeMove?: number;
}

const INITIAL_STATE: IGameState = {
  field: {
    size: { x: 10, y: 20 },
    filledCells: {},
  },
  gameOver: false,
  gameShapes: {},
  stats: {
    rowsRemoved: 0,
  },
  timeShapeMove: TIME_SHAPE_MOVE_MAX,
};

export default class Game extends React.Component<IGameProps, IGameState> {
  state = { ...INITIAL_STATE };

  timeoutShapeMove: NodeJS.Timeout = null;

  keyHandlersTimes: { [key: string]: number } = {};

  constructor(props: IGameProps) {
    super(props);

    if (props.server) {
      addReceiveListener(Actions.gameUpdateClient, this.sendStateServer);
      addReceiveListener(Actions.gameUpdateServer, this.updateStateServer);

      if (props.onInit) {
        props.onInit({
          start: this.newGame,
          end: this.onEnd,
          playerAdd: this.onPlayerAdd,
          playerRemove: this.onPlayerRemove,
        });
      }
    }
  }

  componentDidMount() {
    const { onBack, online } = this.props;

    if (online) {
      if (!isConnected()) {
        onBack();
        return;
      }

      addReceiveListener(Actions.gameUpdateClient, this.updateState);
      addDisconnectListener(this.onEnd);
      send(Actions.gameUpdateClient);
    } else {
      this.newGame();
    }
  }

  componentWillUnmount() {
    this.onEnd();
  }

  onEnd = () => {
    const { online, server } = this.props;

    clearTimeout(this.timeoutShapeMove);

    if (server) {
      removeReceiveListener(Actions.gameUpdateClient, this.sendStateServer);
      removeReceiveListener(Actions.gameUpdateServer, this.updateStateServer);
    } else if (online) {
      if (isConnected()) {
        send(Actions.roomLeave);
      }

      removeReceiveListener(Actions.gameUpdateClient, this.updateState);
      removeDisconnectListener(this.newGame);
    }
  }

  onExit = () => {
    this.onEnd();
    this.props.onBack();
  }

  onPlayerAdd = (id: string) => {
    this.addNewShape(id);
  }

  onPlayerRemove = (id: string) => {
    const { gameShapes } = this.state;
    const newShapes = { ...gameShapes };

    delete newShapes[id];

    this.updateState({ gameShapes: newShapes });
  }

  updateState = (state: IGameState, callback?: () => void) => {
    const { server } = this.props;
    const newState = {
      ...this.state,
      ...state,
    };

    if (server) {
      this.state = newState;
      this.sendStateServer();

      if (callback) {
        callback();
      }
    } else {
      this.setState(newState, callback);
    }
  }

  updateStateServer = ({ player, data }: IData<IGameControl>) => {
    const { gameShapes } = this.state;
    const shapeIndex = player.id;

    if (!gameShapes[shapeIndex]) {
      return;
    }

    const { angle, direction } = data;

    if (angle) {
      this.rotate(shapeIndex);
    }

    if (direction) {
      this.move(direction, shapeIndex);
    }

    this.sendStateServer();
  }

  sendState = (data: IGameControl) => send(Actions.gameUpdateServer, data);

  sendStateServer = () => {
    const { room } = this.props;

    room.players.forEach(player =>
      player.send(Actions.gameUpdateClient, this.state),
    );
  }

  newGame = () => {
    const { online, server } = this.props;

    this.updateState({
      ...INITIAL_STATE,
      field: { ...this.state.field, filledCells: {} },
    });

    this.moveShapesOnTimer();

    if (!server && !online) {
      this.addNewShape();
    }
  }

  gameover = () => {
    clearTimeout(this.timeoutShapeMove);
    this.updateState({ gameOver: true });
  }

  addNewShape = (shapeIndex = MY_SHAPE_INDEX) => {
    const { field, gameOver, gameShapes } = this.state;

    if (gameOver) {
      return;
    }

    const shapesNew = { ...gameShapes };
    const shapeOld = shapesNew[shapeIndex];

    delete shapesNew[shapeIndex];

    const shapeTemplates = Object.values(shapes);
    const allGameShapes = Object.values(shapesNew);
    const gameShapesCount = allGameShapes.length;
    const randomShapeCells = [...shapeTemplates[random(shapeTemplates.length)]];
    const randomAngle = random(4) * 90;
    const color = shapeOld ? shapeOld.color : COLORS_ORDER[gameShapesCount];

    const shape: IShape = {
      id: uuid(),
      color,
      cells: randomShapeCells.map(cell => ({
        ...cell,
        offset: pointRotate(cell.offset, randomAngle),
      })),
      position: {
        x: random(field.size.x),
        y: 0,
      },
    };

    correctShapeFieldPosition(
      shape.position,
      { x: shape.position.x, y: -1 },
      field,
      shape,
      allGameShapes,
      (position) => {
        shape.position = position;
        shapesNew[shapeIndex] = shape;
        this.updateState({ gameShapes: shapesNew });
      },
      this.gameover,
    );
  }

  moveLeft = (shapeIndex = MY_SHAPE_INDEX) =>
    this.move({ x: -1, y: 0 }, shapeIndex)

  moveRight = (shapeIndex = MY_SHAPE_INDEX) =>
    this.move({ x: 1, y: 0 }, shapeIndex)

  moveDown = (shapeIndex = MY_SHAPE_INDEX) =>
    this.move({ x: 0, y: 1 }, shapeIndex)

  move = (direction: IVector, shapeIndex = MY_SHAPE_INDEX) => {
    const { online } = this.props;

    if (online) {
      this.sendState({ direction });
      return;
    }

    const { field, gameShapes } = this.state;
    const allGameShapes = Object.values(gameShapes);
    const shapesNew = { ...gameShapes };
    const shape = shapesNew[shapeIndex];
    const shapeNewPosition = {
      x: shape.position.x + Math.max(-1, Math.min(Math.floor(direction.x), 1)),
      y: shape.position.y + Math.max(0, Math.min(Math.floor(direction.y), 1)),
    };

    correctShapeFieldPosition(
      shapeNewPosition,
      shape.position,
      field,
      shape,
      allGameShapes,
      (position) => {
        shape.position = position;
        this.updateState({ gameShapes: shapesNew });
      },
      () => {
        this.fillFieldCells(shape);
        this.addNewShape(shapeIndex);
      },
    );
  }

  rotate = (shapeIndex = MY_SHAPE_INDEX, angle = 90) => {
    const { online } = this.props;

    if (online) {
      this.sendState({ angle });
      return;
    }

    const { field, gameShapes } = this.state;
    const allGameShapes = Object.values(gameShapes);
    const shapesNew = { ...gameShapes };
    const shape = shapesNew[shapeIndex];

    shape.cells = [...shape.cells].map(cell => ({
      ...cell,
      offset: pointRotate(cell.offset, angle),
    }));

    correctShapeFieldPosition(
      shape.position,
      shape.position,
      field,
      shape,
      allGameShapes,
      (position) => {
        shape.position = position;
        this.updateState({ gameShapes: shapesNew });
      },
      () => {
        this.fillFieldCells(shape);
        this.addNewShape(shapeIndex);
      },
    );
  }

  fillFieldCells = (shape: IShape) => {
    const { field } = this.state;
    const filledCells = { ...field.filledCells };

    shape.cells.forEach((cell) => {
      const cellPosition = {
        x: shape.position.x + cell.offset.x,
        y: shape.position.y + cell.offset.y,
      };
      const cellKey = getPositionKey(cellPosition);

      filledCells[cellKey] = {
        ...cellPosition,
        id: uuid(),
      };
    });

    this.updateState(
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

      Object.keys(newFilledCellsCopy).forEach((key) => {
        const cell = newFilledCellsCopy[key];

        if (!cell) {
          return;
        }

        if (cell.y !== index) {
          if (cell.y < index) {
            cell.y++;
          }

          newFilledCells[getPositionKey(cell)] = cell;
        }
      });
    };

    for (let i = 0; i < size.y; i++) {
      if (rowsFillCount[i] === size.x) {
        clearRow(i);
      }
    }

    this.updateState({
      field: { ...field, filledCells: newFilledCells },
      stats: { ...stats, rowsRemoved: stats.rowsRemoved + removedRowsCount },
    });
  }

  moveShapesOnTimer = () => {
    this.timeoutShapeMove = setTimeout(() => {
      Object.keys(this.state.gameShapes).forEach(key => this.moveDown(key));

      this.moveShapesOnTimer();
    }, this.state.timeShapeMove * 1000);
  }

  onKeyDown = (key: string) => {
    const { gameOver } = this.state;
    const keyHandlers: { [key: string]: () => void } = {
      ArrowLeft: this.moveLeft,
      ArrowRight: this.moveRight,
      ArrowDown: this.moveDown,
      KeyA: this.moveLeft,
      KeyD: this.moveRight,
      KeyS: this.moveDown,
      Space: this.rotate,
    };
    const time = new Date().getTime();
    const timeExpired =
      !this.keyHandlersTimes[key] ||
      time - this.keyHandlersTimes[key] >= TIME_KEY_HANDLER_DELAY * 1000;

    if (!gameOver && keyHandlers[key] && timeExpired) {
      keyHandlers[key]();
      this.keyHandlersTimes[key] = time;
    }
  }

  render() {
    const { online } = this.props;
    const { field, gameOver, gameShapes, stats } = this.state;

    return (
      <Content className={cn('game', { 'game--over': gameOver })}>
        <Control onKeyDown={this.onKeyDown} />
        <Field {...field} cellSize={CELL_SIZE}>
          {Object.values(gameShapes).map(
            shape =>
              shape && <Shape key={shape.id} cellSize={CELL_SIZE} {...shape} />,
          )}
        </Field>
        <div className='game__stats'>
          <div className='game__stats-label'>{i18n`rowsRemoved`}:</div>
          <div className='game__stats-value'>{stats.rowsRemoved}</div>
        </div>
        <div className='game__over'>
          {i18n`gameOver`}
          <Button text={i18n`newGame`} type='main' onClick={this.newGame} />
        </div>
        {online && (
          <Button
            className='game__exit'
            text={i18n`exit`}
            type='light'
            onClick={this.onExit}
          />
        )}
      </Content>
    );
  }
}
