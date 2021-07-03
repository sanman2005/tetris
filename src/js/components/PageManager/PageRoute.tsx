import * as React from 'react';
import { Route, RouteProps, RouteComponentProps } from 'react-router-dom';

import { PageContent } from './PageContent';

export type TPageRouteProps = {
  isLast?: boolean;
  onActive?: (content: HTMLDivElement | null, path?: string) => void;
  onDeactive?: (ref?: HTMLDivElement | null) => void;
  path?: string;
};

export class PageRoute extends React.PureComponent<
  TPageRouteProps & RouteProps
> {
  component: React.FC<RouteComponentProps<any>>;

  constructor(props: TPageRouteProps & RouteProps) {
    super(props);
    const { isLast, onActive, onDeactive, component: CONTENT } = props;

    this.component = CONTENT
      ? (routeProps: RouteComponentProps<any>) => (
          <PageContent
            isLast={isLast}
            onActive={onActive}
            onDeactive={onDeactive}
            path={routeProps.location.pathname}
          >
            <CONTENT {...routeProps} />
          </PageContent>
        )
      : () => null;
  }

  render() {
    const { isLast, onActive, onDeactive, ...routeProps } = this.props;

    return <Route {...routeProps} component={this.component} />;
  }
}
