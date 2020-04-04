import * as React from 'react';
import { IVector } from './Shape';

export enum Smiles {
  hi = 'hi',
  smile = 'smile',
  sadness = 'sadness',
}

interface ISmileParams {
  size: IVector;
  position: IVector;
}

export interface ISmile {
  top?: ISmileParams;
  bottom?: ISmileParams;
  right?: ISmileParams;
  type: Smiles;
}

export default ({ bottom, right, top, type }: ISmile) => (
  <div className={`smile smile--${type}`}>
    <div
      className='smile__eyes'
      style={
        top && {
          width: `${top.size.x * 100}%`,
          height: `${top.size.y * 100}%`,
          top: `${top.position.y * 100}%`,
          left: `${top.position.x * 100}%`,
        }
      }
    />
    <div
      className='smile__mouth'
      style={
        bottom && {
          width: `${bottom.size.x * 100}%`,
          height: `${bottom.size.y * 100}%`,
          top: `${bottom.position.y * 100}%`,
          left: `${bottom.position.x * 100}%`,
        }
      }
    />
    <div
      className='smile__hand-right'
      style={
        right && {
          width: `${right.size.x * 100}%`,
          height: `${right.size.y * 100}%`,
          top: `${right.position.y * 100}%`,
          left: `${right.position.x * 100}%`,
        }
      }
    />
  </div>
);
