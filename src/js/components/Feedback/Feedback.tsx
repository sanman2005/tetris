import * as React from 'react';
import Icons from '../icons';

export default () => (
  <section className='feedback'>
    <nav className='feedback__nav'>
      <a className='feedback__link' href='tel:+71111111111'>
        <span className='feedback__icon'>
          <Icons.phone/>
        </span>+7 111 111 11 11
      </a>
      <a className='feedback__link' href='mailto:help@sanman.ru'>
        <span className='feedback__icon'>
          <Icons.mail/>
        </span>help@sanman.ru
      </a>
    </nav>
  </section>
);
