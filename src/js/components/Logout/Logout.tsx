import * as React from 'react';
import { Redirect } from 'react-router-dom';

import Account from 'models/account';

export default ({ text = 'Список пуст' }: { text?: string }) => {
  Account.logout();

  return <Redirect to='/' />;
};
