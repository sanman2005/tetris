import * as React from 'react';
import { observer } from 'mobx-react';

import { ModelStatus } from 'models/index';
import { pagesPath } from 'pages/index';
import i18n from 'js/i18n';

import Button from 'components/Button';
import Loading from 'components/Loading';
import NotFound from 'components/NotFound';
import { Content } from 'components/Grid';

const CLASS = 'project-detail';

@observer
export default class Game extends React.Component {
  state = {
    showVacancyForm: false,
  };

  render() {

    return (
      <Content fill>
        <Button
          className={`${CLASS}__item-link`}
          text={i18n`join`}
          type='main2'
          autosize
          shadow
        />
      </Content>
    );
  }
}
