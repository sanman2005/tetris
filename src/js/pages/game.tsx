import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';

import Game from 'components/Game';
import { pagesPath } from './';

interface IGamePage {
  online?: string;
}

export default withRouter((props: RouteComponentProps<IGamePage>) => {
  const { online } = props.match.params;

  return (
    <Game
      online={!!online}
      onBack={() => props.history.push(online ? pagesPath.lobby : '/')}
    />
  );
});
