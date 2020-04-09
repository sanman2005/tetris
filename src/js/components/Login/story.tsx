import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './';

storiesOf('Login', module)
  .add(
    'Default',
    () => (
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    ),
    { info: { inline: true } },
  );
