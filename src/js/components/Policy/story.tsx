import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Policy from './';

storiesOf('Policy', module)
  .add(
    'Default',
    () => <Policy />,
    { info: { inline: true } },
  );
