import * as React from 'react';
import { RouteProps, Switch } from 'react-router-dom';
import cn from 'classnames';

import { TPageRouteProps } from './PageRoute';

type TPageProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

type TPageManagerProps = {
  children:
    | React.ReactElement<TPageRouteProps & RouteProps>
    | React.ReactElement<TPageRouteProps & RouteProps>[];
  className?: string;
};

export const PAGE = ({ className, ...rest }: TPageProps) => (
  <div className={cn('page', className)} {...rest} />
);

export class PageManager extends React.PureComponent<TPageManagerProps> {
  render() {
    const { children, className } = this.props;

    return (
      <div className={cn(className, 'page-manager', 'page')}>
        <div className='page-wrapper'>
          <PAGE className='page page--current'>
            <Switch>{children}</Switch>
          </PAGE>
        </div>
      </div>
    );
  }
}
