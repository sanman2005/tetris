import { IShape, IVector } from './Shape';

export const getCorrectShapeFieldPosition = (
  position: IVector,
  fieldSize: IVector,
  shape: IShape,
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
  }

  return correctPosition;
};

export const pointRotate = (vector: IVector, angle: number) => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return {
    x: cos * vector.x + sin * vector.y,
    y: sin * vector.x + cos * vector.y,
  };
};
