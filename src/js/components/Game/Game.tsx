import * as React from 'react';
import { observer } from 'mobx-react';

import { ModelStatus } from 'models/index';
import { pagesPath } from 'pages/index';
import i18n from 'js/i18n';

import Button from 'components/Button';
import Loading from 'components/Loading';
import NotFound from 'components/NotFound';
import { Content } from 'components/Grid';
import Field from './Field';
import Shape, { ICell } from './Shape';

export const CELL_SIZE = 30;

const shapeT: ICell = {
  offsetDirection: { x: 0, y: 0 },
  next: {
    offsetDirection: { x: 1, y: 0 },
    next: {
      offsetDirection: { x: 0, y: -1 },
      next: {
        offsetDirection: { x: 1, y: 1 },
        next: null
      },
    },
  },
};

@observer
export default class Game extends React.Component {
  state = {
    showVacancyForm: false,
  };

  render() {
    const shape: ICell = { ...shapeT, offsetDirection: { x: 4, y: 5 } };

    return (
      <Content className='game'>
        <Field cellSize={CELL_SIZE} sizeX={10} sizeY={20}>
          <Shape cellSize={CELL_SIZE} rootCell={shape} />
        </Field>
      </Content>
    );
  }
}
