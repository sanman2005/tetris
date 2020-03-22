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

@observer
export default class Game extends React.Component {
  state = {
    showVacancyForm: false,
  };

  render() {

    return (
      <Content className='game'>
        <Field sizeX={10} sizeY={20}>
          <span/>
        </Field>
      </Content>
    );
  }
}
