import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';

import Game from 'components/Game';
import { pagesPath } from './';

interface IGamePage extends RouteComponentProps {
  online?: string;
}

export default withRouter((props: IGamePage) => (
  <Game
    online={!!props.online}
    onBack={() => props.history.replace(pagesPath.lobby)}
  />
));
