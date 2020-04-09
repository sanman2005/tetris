import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Reviews from './';

storiesOf('Reviews', module)
  .add(
    'Default',
    () => <Reviews />,
    { info: { inline: true } },
  );
