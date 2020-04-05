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

import Field, { IField } from './Parts/Field';
import Shape, { Colors, IShape, IVector, shapes } from './Parts/Shape';
import Smile, { Smiles } from './Parts/Smile';
import { correctShapeFieldPosition, getPositionKey, pointRotate } from './GameHelpers';

const CELL_SIZE = 30;
const SCORE_ROW_REMOVE = 10;
const SCORE_ROW_REMOVE_KOEF = 20;
const TIME_SHAPE_MOVE_START = 1;
const TIME_KEY_HANDLER_DELAY = 0.05;
const MY_SHAPE_INDEX = 'my';
const COLORS_ORDER = [Colors.blue, Colors.yellow, Colors.red];

const TIME_SHAPE_BY_FILLED_ROWS: { [key: string]: number } = {
  0: TIME_SHAPE_MOVE_START,
  2: TIME_SHAPE_MOVE_START * .9,
  5: TIME_SHAPE_MOVE_START * .8,
  9: TIME_SHAPE_MOVE_START * .7,
  14: TIME_SHAPE_MOVE_START * .6,
  20: TIME_SHAPE_MOVE_START * .5,
  27: TIME_SHAPE_MOVE_START * .4,
  35: TIME_SHAPE_MOVE_START * .3,
  44: TIME_SHAPE_MOVE_START * .2,
  80: TIME_SHAPE_MOVE_START * .1,
};

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
  score: number;
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
  fieldElement?: HTMLDivElement;
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
    score: 0,
  },
  timeShapeMove: TIME_SHAPE_MOVE_START,
};

export default class Game extends React.Component<IGameProps, IGameState> {
  state = { ...INITIAL_STATE };

  timeoutShapeMove: NodeJS.Timeout = null;

  keyHandlersTimes: { [key: string]: number } = {};

  playerSmiles: { [key: string]: Smiles } = {};

  constructor(props: IGameProps) {
    super(props);

    if (props.server) {
      addReceiveListener(Actions.gameUpdateClient, this.sendStateServer);
      addReceiveListener(Actions.gameUpdateServer, this.updateStateServer);
      addReceiveListener(Actions.smile, this.onSetSmile);

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
      removeReceiveListener(Actions.smile, this.onSetSmile);
    } else if (online) {
      if (isConnected()) {
        send(Actions.roomLeave);
      }

      removeReceiveListener(Actions.gameUpdateClient, this.updateState);
      removeDisconnectListener(this.newGame);
    }
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
    const { onBack, online, server } = this.props;

    if (online) {
      onBack();
      return;
    }

    this.updateState({
      ...INITIAL_STATE,
      field: { ...this.state.field, filledCells: {} },
    }, () => {
      if (!server) {
        this.addNewShape();
      }

      this.moveShapesOnTimer();
    });
  }

  onGameover = () => {
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
      smile: this.playerSmiles[shapeIndex],
    };

    delete this.playerSmiles[shapeIndex];

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
      this.onGameover,
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

    if (!shape) {
      return;
    }

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
        this.fillFieldCells(shapeIndex);
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
    const shape = gameShapes[shapeIndex];

    if (!shape) {
      return;
    }

    const shapeNew = {
      ...shape,
      cells: shape.cells.map(cell => ({
        ...cell,
        offset: pointRotate(cell.offset, angle),
      })),
    };
    const allGameShapes = Object.values(gameShapes);

    correctShapeFieldPosition(
      shapeNew.position,
      shapeNew.position,
      field,
      shapeNew,
      allGameShapes,
      (position) => {
        const shapesNew = { ...gameShapes };

        shapeNew.position = position;
        shapesNew[shapeIndex] = shapeNew;
        this.updateState({ gameShapes: shapesNew });
      },
    );
  }

  fillFieldCells = (shapeIndex = MY_SHAPE_INDEX) => {
    const { field, gameShapes } = this.state;
    const filledCells = { ...field.filledCells };
    const newShapes = { ...gameShapes };
    const shape = gameShapes[shapeIndex];

    delete newShapes[shapeIndex];

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
        gameShapes: newShapes,
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

    if (removedRowsCount) {
      this.updateState({
        field: { ...field, filledCells: newFilledCells },
        stats: {
          ...stats,
          rowsRemoved: stats.rowsRemoved + removedRowsCount,
          score:
            stats.score +
            removedRowsCount * SCORE_ROW_REMOVE +
            (removedRowsCount - 1) * SCORE_ROW_REMOVE_KOEF,
        },
      }, this.updateShapesMoveTime);
    }
  }

  updateShapesMoveTime = () => {
    const { rowsRemoved } = this.state.stats;
    const timeShapeMove = TIME_SHAPE_BY_FILLED_ROWS[rowsRemoved];

    if (timeShapeMove) {
      this.updateState({ timeShapeMove });
    }
  }

  moveShapesOnTimer = () => {
    const { gameShapes, gameOver, timeShapeMove } = this.state;

    if (gameOver) {
      return;
    }

    this.timeoutShapeMove = setTimeout(() => {
      Object.keys(gameShapes).forEach(key => this.moveDown(key));

      this.moveShapesOnTimer();
    }, timeShapeMove * 1000);
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

  onSmile = (smile: Smiles) => send(Actions.smile, { smile });

  onSetSmile = ({ player, data }: IData<{ smile: Smiles }>) => {
    const { smile } = data;

    this.playerSmiles[player.id] = smile;
  }

  getFieldRef = (ref: HTMLDivElement) =>
    !this.state.fieldElement && this.setState({ fieldElement: ref })

  renderSmiles = () => (
    <div className='game__smiles'>
      {[Smiles.hi, Smiles.smile, Smiles.sadness].map(smile => (
        <Button
          className='game__smile'
          onClick={() => this.onSmile(smile)}
          type='yellow'
          shape='circle'
          shadow
          key={smile}
        >
          <Smile type={smile} />
        </Button>
      ))}
    </div>
  )

  renderStats = ({ rowsRemoved, score } = this.state.stats) => (
    <div className='game__stats'>
      <div className='game__stat'>
        <div className='game__stat-label'>{i18n`rowsRemoved`}:</div>
        <div className='game__stat-value'>{rowsRemoved}</div>
      </div>
      <div className='game__stat'>
        <div className='game__stat-label'>{i18n`score`}:</div>
        <div className='game__stat-value'>{score}</div>
      </div>
    </div>
  )

  render() {
    const { onBack, online } = this.props;
    const { field, fieldElement, gameOver, gameShapes } = this.state;

    return (
      <Content className={cn('game', { 'game--over': gameOver })}>
        <Control onKeyDown={this.onKeyDown} touchTarget={fieldElement} />
        <div className='game__main'>
          <Field
            {...field}
            cellSize={CELL_SIZE}
            getRef={this.getFieldRef}
          >
            {Object.values(gameShapes).map(
              shape =>
                shape && (
                  <Shape {...shape} key={shape.id} fieldSize={field.size} />
                ),
            )}
          </Field>
        <div className='game__over'>
          {i18n`gameOver`}
          <Button text={i18n`newGame`} type='main' onClick={this.newGame} />
        </div>
        {!gameOver && (
          <Button
            className='game__exit'
            text={i18n`exit`}
            type='light'
            onClick={onBack}
          />
        )}
        </div>

        <div className='game__side'>
          {this.renderStats()}
          {online && this.renderSmiles()}
        </div>
      </Content>
    );
  }
}
