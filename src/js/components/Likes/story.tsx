import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Likes from './';

storiesOf('Likes', module)
  .add(
    'Default',
    () => (
      <Likes
        likes={5}
        dislikes={17}
        onClick={likes => alert(likes)} />
      ),
    { info: { inline: true } },
  );
