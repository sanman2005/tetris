import { IShape, IVector } from './Shape';
import { IField } from './Field';

const checkShapeCellsPosition = (
  position: IVector,
  cells: { [key: string]: IVector },
  shape: IShape,
  onSuccess: () => void,
  onFail?: () => void,
) => {
  for (let i = 0; i < shape.cells.length; i++) {
    const cell = shape.cells[i];
    const cellPosition = {
      x: position.x + cell.offset.x,
      y: position.y + cell.offset.y,
    };

    if (cells[getPositionKey(cellPosition)]) {
      if (onFail) {
        onFail();
      }

      return;
    }
  }

  onSuccess();
};

const checkShapesPositionConflict = (
  position: IVector,
  shape: IShape,
  shapes: IShape[],
  onSuccess: (position: IVector) => void,
) => {
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

    if (shapeNext && shapeNext.id === shape.id) {
      shapeNext = shapes[++shapeIndex];
    }

    if (shapeNext) {
      checkShapeCellsPosition(
        shapeNext.position,
        shapeCells,
        shapeNext,
        checkNextShape,
      );
    } else {
      onSuccess(position);
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
  const shapeBottomEdge = shape.cells.reduce(
    (result: number, cell) => Math.max(result, cell.offset.y),
    0,
  );

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
