import { IShape, IVector } from './Shape';
import { IField } from './Field';

export const correctShapeFieldPosition = (
  position: IVector,
  positionOld: IVector,
  field: IField,
  shape: IShape,
  onSuccess: (position: IVector) => void,
  onStop: () => void,
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
    correctPosition.y -= position.y + shapeBottomEdge - field.size.y + 1;
    onStop();
    return;
  }

  checkShapeFieldCellsPosition(
    correctPosition,
    positionOld,
    field.filledCells,
    shape,
    () => onSuccess(correctPosition),
    onStop,
  );
};

export const getPositionKey = (position: IVector) =>
  `${position.x}_${position.y}`;

export const checkShapeFieldCellsPosition = (
  position: IVector,
  positionOld: IVector,
  fieldCells: { [key: string]: IVector },
  shape: IShape,
  onSuccess: () => void,
  onStop: () => void,
) => {
  for (let i = 0; i < shape.cells.length; i++) {
    const cell = shape.cells[i];
    const cellPosition = {
      x: position.x + cell.offset.x,
      y: position.y + cell.offset.y,
    };

    if (fieldCells[getPositionKey(cellPosition)]) {
      if (positionOld.y < position.y) {
        onStop();
      }

      return;
    }
  }

  onSuccess();
};

export const pointRotate = (vector: IVector, degrees: number) => {
  const angle = degrees * (Math.PI / 180);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return {
    x: Math.round(cos * vector.x - sin * vector.y),
    y: Math.round(sin * vector.x + cos * vector.y),
  };
};
