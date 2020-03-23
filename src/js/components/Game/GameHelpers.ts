import { IShape, IVector } from './Shape';

export const correctShapeFieldPosition = (
  position: IVector,
  fieldSize: IVector,
  shape: IShape,
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
  } else if (position.x + shapeRightEdge >= fieldSize.x) {
    correctPosition.x -= position.x + shapeRightEdge - fieldSize.x + 1;
  }

  if (position.y + shapeBottomEdge >= fieldSize.y) {
    correctPosition.y -= position.y + shapeBottomEdge - fieldSize.y + 1;

    if (onStop) {
      onStop();
      return;
    }
  }

  onSuccess(correctPosition);
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
