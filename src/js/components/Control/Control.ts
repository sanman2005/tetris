import * as React from 'react';

interface IControlProps {
  onKeyDown: (key: string) => void;
  touchTarget?: HTMLElement;
}

const TOUCH_MOVE_MIN_DISTANCE = 10;

export default class Control extends React.Component<IControlProps> {
  touchX = 0;
  touchY = 0;
  touching = false;
  moving = false;

  onKeyDown = (event: KeyboardEvent) => {
    event.stopPropagation();
    this.props.onKeyDown(event.code);
  }

  onTouchStart = (event: any) => {
    const { touchTarget } = this.props;

    if (touchTarget && event.target !== touchTarget) {
      return;
    }

    const { clientX, clientY } = event.touches && event.touches[0] || event;

    this.touchX = clientX;
    this.touchY = clientY;
    this.touching = true;
  }

  onTouchMove = (event: any) => {
    const { onKeyDown, touchTarget } = this.props;

    if (!this.touching || (touchTarget && event.target !== touchTarget)) {
      return;
    }

    const { clientX, clientY } = event.touches && event.touches[0] || event;

    if (clientX && Math.abs(clientX - this.touchX) >= TOUCH_MOVE_MIN_DISTANCE) {
      onKeyDown(clientX < this.touchX ? 'ArrowLeft' : 'ArrowRight');
      this.touchX = clientX;
      this.moving = true;
    }

    if (clientY && Math.abs(clientY - this.touchY) >= TOUCH_MOVE_MIN_DISTANCE) {
      onKeyDown(clientY > this.touchY ? 'ArrowDown' : 'ArrowUp');
      this.touchY = clientY;
      this.moving = true;
    }
  }

  onTouchEnd = () => {
    if (!this.moving) {
      this.props.onKeyDown('Space');
    }

    this.moving = this.touching = false;
  }

  componentDidMount() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('touchstart', this.onTouchStart);
    window.addEventListener('touchmove', this.onTouchMove);
    window.addEventListener('touchend', this.onTouchEnd);
    window.addEventListener('mousedown', this.onTouchStart);
    window.addEventListener('mousemove', this.onTouchMove);
    window.addEventListener('mouseup', this.onTouchEnd);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.onTouchEnd);
    window.removeEventListener('mousedown', this.onTouchStart);
    window.removeEventListener('mousemove', this.onTouchMove);
    window.removeEventListener('mouseup', this.onTouchEnd);
  }

  render() {
    return '';
  }
}
