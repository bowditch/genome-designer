/* eslint-disable */

import { expect } from 'chai';
import { Block as exampleBlock } from '../../schemas/_examples';
import request from 'supertest';
import { set as dbSet } from '../../../server/utils/database';

const devServer = require('../../../server/devServer');

describe('REST', () => {
  let server;
  const sessionkey = '123456';
  beforeEach('server setup', () => {
    server = devServer.listen();
    return dbSet(sessionkey, {});
  });
  afterEach(() => {
    server.close();
  });

  describe('Project', () => {

    //todo - should fold block and project APIs together, and just test them once... will only need to test project validation separately then

  });
});
