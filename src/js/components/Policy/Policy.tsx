import * as React from 'react';
import { withRouter } from 'react-router-dom';
import Policy from '../../models/policy';
import { Terms } from '../Terms/Terms';

class Policies extends Terms {
  getItems = () => Policy.all();
}

export default withRouter(Policies);
