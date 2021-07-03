'use strict';
import 'react-hot-loader';
import { hot } from 'react-hot-loader/root';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import App from 'pages/index';
import '../css/main.styl';

const rootId = 'root';

const CLIENT = hot(() => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
));

ReactDOM.render(<CLIENT />, document.getElementById(rootId));
