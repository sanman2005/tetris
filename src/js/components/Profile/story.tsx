import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Profile from './';

storiesOf('Profile', module)
  .add(
    'Default',
    () => <Profile />,
    { info: { inline: true } },
  );
