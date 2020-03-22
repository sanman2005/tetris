import express from 'express';
import * as path from 'path';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { isDev } from './helpers';
import ssr from './ssr';
import { apiHasActiveCalls } from './api';
import store from './store';

import RootPage from './pages';
import Template from './pages/template';
import { buildPath, devPath } from '../../config/build.config.json';
import { ssr as ssrConfig } from '../../config/app.config.json';

const { serverPort, serverStaticRoot } = ssrConfig;
const app = express();
const targetPath = path.resolve(process.cwd(), isDev ? devPath : buildPath);
let hasActiveRequest = false;

app.use(serverStaticRoot, express.static(targetPath));
app.disable('x-powered-by'); // hide unnecessary 'powered by express'
app.listen(serverPort);

// раз в 10 минут чистим кэш для обновления данных
setInterval(() => !hasActiveRequest && store.reset(), 10 * 60 * 1000);

app.get('/*', async (req, res) => {
  hasActiveRequest = true;

  const { url } = req;
  const appComponent = (
    <StaticRouter location={url} context={{}}>
      <RootPage />
    </StaticRouter>
  );

  try {
    let renderedContent = renderToString(appComponent);

    while (apiHasActiveCalls()) {
      await ssr(url);
      renderedContent = renderToString(appComponent);
    }

    const response = Template(
      'TeamMaker',
      store,
      renderedContent,
      serverStaticRoot,
    );

    res.send(response);
  } catch (error) {
    let message = 'error\n';

    Object.keys(error).forEach((key: string) => message = `${message}${key}: ${error[key]}\n`);

    res.send(message);
  }

  hasActiveRequest = false;
});
