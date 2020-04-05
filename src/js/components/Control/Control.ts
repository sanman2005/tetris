import * as React from 'react';

interface IControlProps {
  onKeyDown: (key: string) => void;
  touchTarget?: HTMLElement;
}

const TOUCH_MOVE_MIN_DISTANCE = 10;

export default class Control extends React.Component<IControlProps> {
  touchX = 0;
  touchY = 0;

  onKeyDown = (event: KeyboardEvent) => {
    event.stopPropagation();
    this.props.onKeyDown(event.code);
  }

  onClick = (event: MouseEvent) => {
    const { touchTarget } = this.props;

    if (touchTarget && event.target !== touchTarget) {
      return;
    }

    this.props.onKeyDown('Space');
  }

  onTouchStart = (event: TouchEvent) => {
    const { touchTarget } = this.props;

    if (touchTarget && event.target !== touchTarget) {
      return;
    }

    const { clientX, clientY } = event.touches[0] || {};

    this.touchX = clientX;
    this.touchY = clientY;
  }

  onTouchMove = (event: TouchEvent) => {
    const { onKeyDown, touchTarget } = this.props;

    if (touchTarget && event.target !== touchTarget) {
      return;
    }

    const { clientX, clientY } = event.touches[0] || {};

    if (Math.abs(clientX - this.touchX) >= TOUCH_MOVE_MIN_DISTANCE) {
      onKeyDown(clientX < this.touchX ? 'ArrowLeft' : 'ArrowRight');
      this.touchX = clientX;
    }

    if (Math.abs(clientY - this.touchY) >= TOUCH_MOVE_MIN_DISTANCE) {
      onKeyDown(clientY > this.touchY ? 'ArrowDown' : 'ArrowUp');
      this.touchY = clientY;
    }
  }

  componentDidMount() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('click', this.onClick);
    window.addEventListener('touchstart', this.onTouchStart);
    window.addEventListener('touchmove', this.onTouchMove);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('click', this.onClick);
    window.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchmove', this.onTouchMove);
  }

  render() {
    return '';
  }
}
