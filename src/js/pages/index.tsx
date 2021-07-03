import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import Layout from 'components/Layout';
import { PageManager, PageRoute } from 'components/PageManager';
import Lobby from 'components/Lobby';
import Page404 from 'components/NotFound';

import Game from './game';
import Home from './home';

import {
  getLang,
  addLangUpdateListener,
  removeLangUpdateListener,
} from '../i18n';

export const pagesPath = {
  game: `/game`,
  lobby: `/lobby`,
  logout: '/logout',
  profile: '/profile',
};

class Root extends React.Component<RouteComponentProps> {
  onLangUpdate() {
    this.forceUpdate();
  }

  componentDidMount() {
    addLangUpdateListener(this.onLangUpdate);
  }

  componentWillUnmount() {
    removeLangUpdateListener(this.onLangUpdate);
  }

  render() {
    return (
      <Layout key={getLang()}>
        <PageManager key={this.props.location.pathname}>
          <PageRoute path='/' exact component={Home} />
          <PageRoute path={`${pagesPath.game}/:online?`} component={Game} />
          <PageRoute path={pagesPath.lobby} component={Lobby} />
          <PageRoute component={Page404} />
        </PageManager>
      </Layout>
    );
  }
}

export default withRouter(Root);

