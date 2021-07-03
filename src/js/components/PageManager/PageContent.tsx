import React from 'react';

import { TPageRouteProps } from './PageRoute';

export class PageContent extends React.PureComponent<TPageRouteProps> {
  ref = React.createRef<HTMLDivElement>();

  componentDidMount() {
    const { isLast, onActive, path } = this.props;

    if (onActive && isLast) {
      onActive(this.ref.current, path);
    }
  }

  componentWillUnmount() {
    const { isLast, onDeactive } = this.props;

    if (onDeactive && isLast) {
      onDeactive(this.ref.current);
    }
  }

  render() {
    return (
      <div className='page-content' ref={this.ref}>
        {this.props.children}
      </div>
    );
  }
}
