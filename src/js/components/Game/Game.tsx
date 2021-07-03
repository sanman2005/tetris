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
import Control, { TControlKeys } from 'components/Control';
import { Content } from 'components/Grid';

import Field, { IField } from './Parts/Field';
import Help from './Parts/Help';
import Shape, { Colors, IShape, IVector, shapes } from './Parts/Shape';
import Smile, { Smiles } from './Parts/Smile';
import {
  correctShapeFieldPosition,
  getShapeTop,
  getPositionKey,
  pointRotate,
} from './GameHelpers';

const CELL_SIZE = 30;
const SCORE_ROW_REMOVE = 10;
const SCORE_ROW_REMOVE_KOEF = 20;
const TIME_SHAPE_MOVE_START = 1;
const TIME_KEY_HANDLER_DELAY = 0.05;
const MY_SHAPE_INDEX = 'my';
const COLORS_ORDER = [Colors.blue, Colors.yellow, Colors.red];

const TIME_SHAPE_BY_FILLED_ROWS: { [key: string]: number } = {
  0: TIME_SHAPE_MOVE_START,
  2: TIME_SHAPE_MOVE_START * 0.9,
  5: TIME_SHAPE_MOVE_START * 0.8,
  9: TIME_SHAPE_MOVE_START * 0.7,
  14: TIME_SHAPE_MOVE_START * 0.6,
  20: TIME_SHAPE_MOVE_START * 0.5,
  27: TIME_SHAPE_MOVE_START * 0.4,
  35: TIME_SHAPE_MOVE_START * 0.3,
  44: TIME_SHAPE_MOVE_START * 0.2,
  80: TIME_SHAPE_MOVE_START * 0.1,
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
  onEnd?: () => void;
  online?: boolean;
  room?: IRoom;
  server?: boolean;
}

interface IGameState {
  field: IField;
  fieldElement?: HTMLDivElement;
  gameOver: boolean;
  gameShapes: { [key: string]: IShape };
  help: boolean;
  shapeIndex: string;
  stats: IGameStats;
  timeShapeMove: number;
}

const INITIAL_STATE: IGameState = {
  field: {
    size: { x: 10, y: 20 },
    filledCells: {},
  },
  gameOver: false,
  gameShapes: {},
  help: false,
  shapeIndex: MY_SHAPE_INDEX,
  stats: {
    rowsRemoved: 0,
    score: 0,
  },
  timeShapeMove: TIME_SHAPE_MOVE_START,
};

export default class Game extends React.Component<IGameProps, IGameState> {
  state = { ...INITIAL_STATE };

  timeoutShapeMove?: NodeJS.Timeout;

  keyHandlersTimes: { [key: string]: number } = {};

  playerSmiles: { [key: string]: Smiles } = {};

  controlledShapeId = '';

  constructor(props: IGameProps) {
    super(props);

    if (props.server) {
      addReceiveListener(Actions.gameGet, this.sendServerState);
      addReceiveListener(Actions.gameUpdate, this.serverReceiveState);
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
        onBack?.();
        return;
      }

      addReceiveListener(Actions.gameUpdate, this.updateState);
      addDisconnectListener(this.onEnd);
      send(Actions.gameGet);
    } else {
      this.newGame();
    }
  }

  componentWillUnmount() {
    this.onEnd();
  }

  onEnd = () => {
    const { online, server } = this.props;

    this.timeoutShapeMove && clearTimeout(this.timeoutShapeMove);

    if (server) {
      removeReceiveListener(Actions.gameGet, this.sendServerState);
      removeReceiveListener(Actions.gameUpdate, this.serverReceiveState);
      removeReceiveListener(Actions.smile, this.onSetSmile);
    } else if (online) {
      if (isConnected()) {
        send(Actions.roomLeave);
      }

      removeReceiveListener(Actions.gameUpdate, this.updateState);
      removeDisconnectListener(this.newGame);
    }
  };

  onPlayerAdd = (id: string) => this.addNewShape(id);

  onPlayerRemove = (id: string) => {
    const { gameShapes } = this.state;
    const newShapes = { ...gameShapes };

    delete newShapes[id];

    this.updateState({ gameShapes: newShapes });
  };

  updateState = (state: Partial<IGameState>, callback?: () => void) => {
    const { server } = this.props;
    const newState = {
      ...this.state,
      ...state,
    };

    if (server) {
      this.state = newState;
      this.sendServerState({ player: null, data: state });

      if (callback) {
        callback();
      }
    } else {
      this.setState(newState, callback);
    }
  };

  serverReceiveState = ({ player, data }: IData<IGameControl>) => {
    const { gameShapes } = this.state;
    const shapeIndex = player?.id;

    if (!shapeIndex || !gameShapes[shapeIndex]) {
      return;
    }

    const { angle, direction } = data;

    if (angle) {
      this.rotate(shapeIndex);
    }

    if (direction) {
      this.move(direction, shapeIndex);
    }
  };

  sendControlToServer = (data: IGameControl) => send(Actions.gameUpdate, data);

  sendServerState = ({ player, data }: IData<Partial<IGameState>>) => {
    const { room } = this.props;
    const { field, gameShapes, gameOver, stats, timeShapeMove } = this.state;
    const dataToSend = data || {
      field,
      gameOver,
      gameShapes,
      shapeIndex: player?.id,
      stats,
      timeShapeMove,
    };

    if (player) {
      player.send(Actions.gameUpdate, dataToSend);
    } else {
      room?.players.forEach((roomPlayer) =>
        roomPlayer.send(Actions.gameUpdate, dataToSend),
      );
    }
  };

  newGame = () => {
    const { onBack, online, server } = this.props;

    if (online) {
      onBack?.();
      return;
    }

    this.updateState(
      {
        ...INITIAL_STATE,
        field: { ...this.state.field, filledCells: {} },
      },
      () => {
        if (!server) {
          this.addNewShape();
        }

        this.moveShapesOnTimer();
      },
    );
  };

  onGameover = () => {
    const { onEnd } = this.props;

    this.timeoutShapeMove && clearTimeout(this.timeoutShapeMove);
    this.updateState({ gameOver: true });

    onEnd?.();
  };

  onHelp = () => this.setState({ help: true });
  onHelpClose = () => this.setState({ help: false });

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
    const randomShapeCells = [...shapeTemplates[random(shapeTemplates.length)]];
    const randomAngle = random(4) * 90;
    const shapeColor = shapeOld
      ? shapeOld.color
      : COLORS_ORDER.find(
          (color) =>
            !allGameShapes.some((gameShape) => gameShape.color === color),
        );

    const shape: IShape = {
      id: uuid(),
      color: shapeColor!,
      cells: randomShapeCells.map((cell) => ({
        ...cell,
        offset: pointRotate(cell.offset, randomAngle),
      })),
      frozen: false,
      position: {
        x: random(field.size.x),
        y: -1,
      },
      smile: this.playerSmiles[shapeIndex],
    };

    delete this.playerSmiles[shapeIndex];

    correctShapeFieldPosition(
      shape.position,
      shape.position,
      field,
      shape,
      allGameShapes,
      (position) => {
        shape.position = position;
        shapesNew[shapeIndex] = shape;
        this.updateState({ gameShapes: shapesNew });
      },
      () => (shape.frozen = true),
    );
  };

  moveLeft = (shapeIndex = MY_SHAPE_INDEX) =>
    this.move({ x: -1, y: 0 }, shapeIndex);

  moveRight = (shapeIndex = MY_SHAPE_INDEX) =>
    this.move({ x: 1, y: 0 }, shapeIndex);

  moveDown = (shapeIndex = MY_SHAPE_INDEX) =>
    this.move({ x: 0, y: 1 }, shapeIndex);

  move = (direction: IVector, shapeIndex = MY_SHAPE_INDEX) => {
    const { online } = this.props;

    if (online) {
      this.sendControlToServer({ direction });
      return;
    }

    const { field, gameShapes } = this.state;
    const allGameShapes = Object.values(gameShapes);
    const shapesNew = { ...gameShapes };
    const shape = shapesNew[shapeIndex];

    if (!shape) return;

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
        shape.frozen = false;
        shape.position = position;
        this.updateState({ gameShapes: shapesNew });
      },
      () => {
        this.fillFieldCells(shapeIndex);
        this.addNewShape(shapeIndex);
      },
    );
  };

  rotate = (shapeIndex = MY_SHAPE_INDEX, angle = 90) => {
    const { online } = this.props;

    if (online) {
      this.sendControlToServer({ angle });
      return;
    }

    const { field, gameShapes } = this.state;
    const shape = gameShapes[shapeIndex];

    if (!shape) {
      return;
    }

    const shapeNew = {
      ...shape,
      cells: shape.cells.map((cell) => ({
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
  };

  fillFieldCells = (shapeIndex = MY_SHAPE_INDEX) => {
    const { field, gameShapes } = this.state;
    const filledCells = { ...field.filledCells };
    const newShapes = { ...gameShapes };
    const shape = gameShapes[shapeIndex];

    if (!shape) return;

    const shapeTop = getShapeTop(shape);

    if (shapeTop + shape.position.y === 0) {
      this.onGameover();
      return;
    }

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
  };

  removeFilledRows = () => {
    const { field, stats } = this.state;
    const { filledCells, size } = field;
    const rowsFillCount: { [key: string]: number } = {};
    let newFilledCells = { ...filledCells };
    let removedRowsCount = 0;

    Object.values(filledCells).forEach(
      (cell) =>
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
      this.updateState(
        {
          field: { ...field, filledCells: newFilledCells },
          stats: {
            ...stats,
            rowsRemoved: stats.rowsRemoved + removedRowsCount,
            score:
              stats.score +
              removedRowsCount * SCORE_ROW_REMOVE +
              (removedRowsCount - 1) * SCORE_ROW_REMOVE_KOEF,
          },
        },
        this.updateShapesMoveTime,
      );
    }
  };

  updateShapesMoveTime = () => {
    const { rowsRemoved } = this.state.stats;
    const timeShapeMove = TIME_SHAPE_BY_FILLED_ROWS[rowsRemoved];

    if (timeShapeMove) {
      this.updateState({ timeShapeMove });
    }
  };

  moveShapesOnTimer = () => {
    const { gameShapes, gameOver, timeShapeMove } = this.state;

    if (gameOver) {
      return;
    }

    this.timeoutShapeMove = setTimeout(() => {
      Object.keys(gameShapes).forEach((key) => this.moveDown(key));

      this.moveShapesOnTimer();
    }, timeShapeMove * 1000);
  };

  onMoveDown = () => {
    const { shapeIndex, gameShapes } = this.state;
    const shape = gameShapes[shapeIndex];

    if (this.controlledShapeId && this.controlledShapeId !== shape.id) {
      return;
    }

    this.controlledShapeId = shape.id;
    this.moveDown();
  };

  onKeyDown = (key: string) => {
    const { gameOver } = this.state;
    const keyHandlers = {
      [TControlKeys.ArrowLeft]: this.moveLeft,
      [TControlKeys.ArrowRight]: this.moveRight,
      [TControlKeys.ArrowDown]: this.onMoveDown,
      [TControlKeys.KeyA]: this.moveLeft,
      [TControlKeys.KeyD]: this.moveRight,
      [TControlKeys.KeyS]: this.onMoveDown,
      [TControlKeys.Space]: this.rotate,
    } as { [key: string]: () => void };
    const time = new Date().getTime();
    const timeExpired =
      !this.keyHandlersTimes[key] ||
      time - this.keyHandlersTimes[key] >= TIME_KEY_HANDLER_DELAY * 1000;
    const keyHandler = keyHandlers[key] as () => void;

    if (!gameOver && keyHandler && timeExpired) {
      keyHandler();
      this.keyHandlersTimes[key] = time;
    }
  };

  onKeyUp = (key: TControlKeys) => {
    if ([TControlKeys.ArrowDown, TControlKeys.KeyS].includes(key)) {
      this.controlledShapeId = '';
    }
  };

  onSmile = (smile: Smiles) => send(Actions.smile, { smile });

  onSetSmile = ({ player, data }: IData<{ smile: Smiles }>) => {
    const { smile } = data;

    if (smile && player) {
      this.playerSmiles[player.id] = smile;
    }
  };

  getFieldRef = (ref: HTMLDivElement) =>
    !this.state.fieldElement && this.setState({ fieldElement: ref });

  renderSmiles = () => (
    <div className='game__smiles'>
      {[Smiles.hi, Smiles.smile, Smiles.sadness].map((smile) => (
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
  );

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
  );

  render() {
    const { onBack, online } = this.props;
    const { field, fieldElement, gameOver, gameShapes, help } = this.state;

    return (
      <Content className={cn('game', { 'game--over': gameOver })}>
        <Control
          onKeyDown={this.onKeyDown}
          onKeyUp={this.onKeyUp}
          touchTarget={fieldElement}
          blockAxis
        />

        <div className='game__main'>
          <Field {...field} cellSize={CELL_SIZE} getRef={this.getFieldRef}>
            {Object.values(gameShapes).map(
              (shape) =>
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
          {help && <Help onClose={this.onHelpClose} />}
          <Button
            className='game__help'
            text='?'
            type='light'
            onClick={this.onHelp}
          />
        </div>
      </Content>
    );
  }
}
