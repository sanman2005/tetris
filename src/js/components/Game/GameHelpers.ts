import { IShape, IVector } from './Parts/Shape';
import { IField } from './Parts/Field';

const checkShapeCellsPosition = (
  position: IVector,
  cells: { [key: string]: IVector },
  shape: IShape,
  onSuccess: () => void,
  onFail?: (() => void) | null,
) => {
  for (let i = 0; i < shape.cells.length; i++) {
    const cell = shape.cells[i];
    const cellPosition = {
      x: position.x + cell.offset.x,
      y: position.y + cell.offset.y,
    };

    if (cells[getPositionKey(cellPosition)]) {
      onFail?.();
      return;
    }
  }

  onSuccess();
};

export const getShapeBottom = (shape: IShape) =>
  shape.cells.reduce(
    (result: number, cell) => Math.max(result, cell.offset.y),
    0,
  );

export const getShapeTop = (shape: IShape) =>
  shape.cells.reduce(
    (result: number, cell) => Math.min(result, cell.offset.y),
    0,
  );

const checkShapesPositionConflict = (
  position: IVector,
  shape: IShape,
  shapes: IShape[],
  onSuccess: (position: IVector) => void,
  onFail: ((position?: IVector) => void) | null,
) => {
  const positionCorrect = { ...position };
  const shapeCells = shape.cells.reduce(
    (result: { [key: string]: IVector }, cell) => {
      const cellPosition = {
        x: position.x + cell.offset.x,
        y: position.y + cell.offset.y,
      };

      result[getPositionKey(cellPosition)] = cellPosition;
      return result;
    },
    {},
  );
  let shapeIndex = -1;

  const checkNextShape = () => {
    let shapeNext = shapes[++shapeIndex];

    while (shapeNext && (shapeNext.id === shape.id || shapeNext.frozen)) {
      shapeNext = shapes[++shapeIndex];
    }

    if (shapeNext) {
      checkShapeCellsPosition(
        shapeNext.position,
        shapeCells,
        shapeNext,
        checkNextShape,
        onFail ? () => onFail() : null,
      );
    } else {
      onSuccess(positionCorrect);
    }
  };

  checkNextShape();
};

export const correctShapeFieldPosition = (
  position: IVector,
  positionOld: IVector,
  field: IField,
  shape: IShape,
  shapes: IShape[],
  onSuccess: (position: IVector) => void,
  onStop?: () => void,
) => {
  const correctPosition = { ...position };
  const shapeLeftEdge = shape.cells.reduce(
    (result: number, cell) => Math.min(result, cell.offset.x),
    0,
  );
  const shapeRightEdge = shape.cells.reduce(
    (result: number, cell) => Math.max(result, cell.offset.x),
    0,
  );
  const shapeBottomEdge = getShapeBottom(shape);

  if (position.x + shapeLeftEdge < 0) {
    correctPosition.x -= position.x + shapeLeftEdge;
  } else if (position.x + shapeRightEdge >= field.size.x) {
    correctPosition.x -= position.x + shapeRightEdge - field.size.x + 1;
  }

  if (position.y + shapeBottomEdge >= field.size.y) {
    if (onStop) {
      onStop();
    }

    return;
  }

  const onCheckFieldCellsSuccess = () =>
    checkShapesPositionConflict(
      correctPosition,
      shape,
      shapes,
      () => onSuccess(correctPosition),
      onStop && positionOld === position
        ? () => {
            onSuccess(correctPosition);
            onStop();
          }
        : null,
    );

  checkShapeCellsPosition(
    correctPosition,
    field.filledCells,
    shape,
    onCheckFieldCellsSuccess,
    () => onStop && positionOld.y < position.y && onStop(),
  );
};

export const getPositionKey = (position: IVector) =>
  `${position.x}_${position.y}`;

export const pointRotate = (vector: IVector, degrees: number) => {
  const angle = degrees * (Math.PI / 180);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return {
    x: Math.round(cos * vector.x - sin * vector.y),
    y: Math.round(sin * vector.x + cos * vector.y),
  };
};
