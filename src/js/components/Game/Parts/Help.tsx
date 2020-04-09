import * as React from 'react';

import Button from 'components/Button';
import { Column, Row } from 'components/Grid';
import Modal from 'components/Modal';
import i18n from 'js/i18n';

interface IHelpProps {
  onClose: () => void;
}

export default ({ onClose }: IHelpProps) => (
  <Modal onClose={onClose}>
    <div className='help'>
      <div className='title'>{i18n`help`}</div>
      <div className='help__title'>{i18n`control`}</div>
      <Row>
        <Column xs={12} md={6}>
          <div className='help__subtitle'>{i18n`movement`}</div>
          <div className='help__content'>
            <div className='help__keys'>
              <Button text='W' />
            </div>
            <div className='help__keys'>
              <Button text='A' />
              <Button text='S' />
              <Button text='D' />
            </div>
          </div>
          <div className='help__content'>
            <div className='help__delimiter'>{i18n`or`}</div>
            <div className='help__keys'>
              <Button text='⇧' />
            </div>
            <div className='help__keys'>
              <Button text='⇦' />
              <Button text='⇩' />
              <Button text='⇨' />
            </div>
          </div>
          <div className='help__content'>
            <div className='help__delimiter'>{i18n`or`}</div>
            <div className='help__mouse help__mouse--move'>
              <div className='help__mouse-key help__mouse-key--down' />
              <div className='help__mouse-key' />
            </div>
          </div>
          <div className='help__content-mobile'>
            <div className='help__screen'>
              <div className='help__finger help__finger--move' />
            </div>
          </div>
        </Column>
        <Column xs={12} md={6}>
          <div className='help__subtitle'>{i18n`rotation`}</div>
          <div className='help__content'>
            <div className='help__keys'>
              <Button className='help__space' />
            </div>
          </div>
          <div className='help__content'>
            <div className='help__delimiter'>{i18n`or`}</div>
            <div className='help__mouse'>
              <div className='help__mouse-key help__mouse-key--click' />
              <div className='help__mouse-key' />
            </div>
          </div>
          <div className='help__content-mobile'>
            <div className='help__screen'>
              <div className='help__finger help__finger--click' />
            </div>
          </div>
        </Column>
      </Row>
    </div>
  </Modal>
);
