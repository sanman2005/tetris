import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Feedback from './';

storiesOf('Feedback', module)
  .add(
    'Default',
    () => <Feedback />,
    { info: { inline: true } },
  );
