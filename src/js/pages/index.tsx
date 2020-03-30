import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import * as dayjs from 'dayjs';
import * as relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ru';

import Layout from 'components/Layout';
import { PageManager, PageRoute } from 'components/PageManager';
import Lobby from 'components/Lobby';
import Login, { Stages } from 'components/Login';
import Logout from 'components/Logout';
import Page404 from 'components/NotFound';
import Profile from 'components/Profile';

import Game from './game';
import Home from './home';

import {
  getLang,
  addLangUpdateListener,
  removeLangUpdateListener,
} from '../i18n';

dayjs.extend(relativeTime);
dayjs.locale(getLang());

export const pagesPath = {
  game: `/game`,
  lobby: `/lobby`,
  login: `/${Stages.login}`,
  logout: '/logout',
  profile: '/profile',
};

class Root extends React.Component<RouteComponentProps & any> {
  onLangUpdate = () => {
    dayjs.locale(getLang());
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
          <PageRoute path='/' exact component={Home} isLast />
          <PageRoute
            path={`${pagesPath.login}/:stage?`}
            component={Login}
            theme='login'
            isLast
          />
          <PageRoute path={`${pagesPath.game}/:online?`} component={Game} />
          <PageRoute path={pagesPath.logout} component={Logout} />
          <PageRoute path={pagesPath.lobby} component={Lobby} />
          <PageRoute
            path={pagesPath.profile}
            component={Profile}
            isLast
            needAuth
          />
          <PageRoute component={Page404} theme='page404' isLast />
        </PageManager>
      </Layout>
    );
  }
}

export default withRouter(Root);

