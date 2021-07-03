import * as React from 'react';

import List from '../List';
import Link from '../Link';
import { Column, Row } from '../Grid';

import { pagesPath } from 'pages/index';

import i18n from 'js/i18n';

export default () => {
  const linksLeft: { [key: string]: React.ReactNode } = {
    [pagesPath.game]: i18n`game`,
  };
  const leftItems = Object.keys(linksLeft).map(link => (
    <Link to={link} exact text={linksLeft[link]} />
  ));

  return (
    <Row className='navigation'>
      <Column xs={6}>
        <List items={leftItems} />
      </Column>
    </Row>
  );
};
