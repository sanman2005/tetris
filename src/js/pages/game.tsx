import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';

import Game from 'components/Game';
import { pagesPath } from './';

interface IGamePage {
  online?: string;
}

export default withRouter((props: RouteComponentProps<IGamePage>) => (
  <Game
    online={!!props.match.params.online}
    onBack={() => props.history.replace(pagesPath.lobby)}
  />
));
