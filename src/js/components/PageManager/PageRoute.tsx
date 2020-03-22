import * as React from 'react';
import { Redirect, Route, RouteProps, RouteComponentProps } from 'react-router-dom';

import { PageContent } from './PageContent';
import { ModelStatus } from 'models/index';
import Account from 'models/account';
import { pagesPath } from 'pages/index';

export type TPageRouteProps = {
  isLast?: boolean;
  needAuth?: boolean;
  onActive?: (
    content: HTMLDivElement,
    path: string,
    theme?: string,
  ) => void;
  onDeactive?: (ref?: HTMLDivElement, theme?: string) => void;
  path?: string;
  theme?: 'login' | 'page404';
};

export class PageRoute extends React.PureComponent<TPageRouteProps & RouteProps> {
  component: React.FC<RouteComponentProps<any>> = null;

  constructor(props: TPageRouteProps & RouteProps) {
    super(props);
    const { isLast, onActive, onDeactive, component: CONTENT, theme } = props;

    this.component = (routeProps: RouteComponentProps<any>) => (
      <PageContent
        isLast={isLast}
        onActive={onActive}
        onDeactive={onDeactive}
        path={routeProps.location.pathname}
        theme={theme}>
        <CONTENT {...routeProps} />
      </PageContent>
    );
  }

  render() {
    const { isLast, needAuth, onActive, onDeactive, ...routeProps } = this.props;

    if (needAuth) {
      const account = Account.getData();

      if (!account.value && account.status !== ModelStatus.fetching) {
        return <Redirect to={pagesPath.login} />;
      }
    }

    return <Route {...routeProps} component={this.component} />;
  }
}
