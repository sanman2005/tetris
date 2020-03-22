import * as React from 'react';

import AnimatedText from 'components/AnimatedText';
import Button from 'components/Button';
import { Content } from 'components/Grid';

import { pagesPath } from 'pages/index';
import i18n from 'js/i18n';

export default () => (
  <Content className='home' centerContent>
    <AnimatedText
      className='home__title'
      texts={[
        i18n`motivation1`,
        i18n`motivation2`,
        i18n`motivation3`,
      ]}
    />
    <div className='home__links'>
      <Button
        className='home__teams'
        href={pagesPath.game}
        text={i18n`start`}
        type='main2'
      />
    </div>
  </Content>
);
