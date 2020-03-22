import * as React from 'react';
import ModalReact from 'react-modal';
import cn from 'classnames';
import Icons from '../icons';
import { scrollEnable, scrollDisable } from '../../helpers';

interface IModalProps {
  children: JSX.Element;
  onClose?: () => void;
  noPad?: boolean;
}

export default class Modal extends React.Component<IModalProps> {
  componentDidMount() {
    scrollDisable();
  }

  componentWillUnmount() {
    scrollEnable();
  }

  render() {
    const { children, onClose, noPad } = this.props;
    const style = {
      overlay: {
        zIndex: 100,
      },
      content: {
        padding: 0,
        borderRadius: 0,
        background: 'none',
        border: 'none',
        overflow: 'visible',
      },
    };

    return (
      <ModalReact isOpen style={style}>
        {onClose && (
          <div
            className='modal-close'
            role='button'
            onClick={onClose}>
            <Icons.close />
          </div>
        )}
        <div className={cn('modal-content', { 'modal-content--nopad': noPad })}>
          {children}
        </div>
      </ModalReact>
    );
  }
}
