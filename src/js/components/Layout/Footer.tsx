import * as React from 'react';

import Link from '../Link';
import { Container, Column, Row } from '../Grid';

import { pagesPath } from 'pages/index';
import i18n from 'js/i18n';

const year = new Date().getFullYear();

export default () => (
  <footer className='footer'>
    <Container>
      <Row>
        <Column xs={6} className='footer__copyright'>
          ©
          <a className='link' href='mailto:sanman@mail.ru'>
            Sanman
          </a>
          , {year}
        </Column>
        <Column xs={6} className='footer__agreement'>
          {/*<Link to={pagesPath.terms}>{i18n`terms`}</Link>*/}
        </Column>
      </Row>
    </Container>
  </footer>
);
