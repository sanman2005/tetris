import * as React from 'react';

interface IControlProps {
  onKeyDown: (key: string) => void;
}

export default class Control extends React.Component<IControlProps> {
  onKeyDown = (event: { code: string }) => {
    this.props.onKeyDown(event.code);
  }

  componentDidMount() {
    window.addEventListener('keydown', this.onKeyDown);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeyDown);
  }

  render() {
    return '';
  }
}
