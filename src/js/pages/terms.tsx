import * as React from 'react';
import { Content } from '../../components/Grid';
import Page from '../../components/PAGE';
import Terms from '../../components/Terms';

export default () => (
  <Page>
    <Content>
      <h1 className='page__heading'>Пользовательское соглашение</h1>
      <p className='page__description'>
        Настоящее Пользовательское соглашение (далее – «Соглашение») - это
        правила пользования Сервисом ClassGuru, которые определяют условия,
        сроки, стоимость, перечень и объем оказания услуг/предоставления товаров
        на Сайте, и распространяются на отношения между Администратором и
        Пользователем по поводу использования Сервиса ClassGuru, оказания
        услуг/предоставления товаров на Сайте.
      </p>
      {/*<Terms />*/}
    </Content>
  </Page>
);
