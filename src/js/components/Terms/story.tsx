import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Terms from './';

storiesOf('Terms', module)
  .add(
    'Default',
    () => <Terms />,
    { info: { inline: true } },
  );
