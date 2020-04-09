import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Sms from './';

storiesOf('Sms', module)
  .add(
    'Default',
    () => <Sms onReset={() => {}} />,
    { info: { inline: true } },
  );
