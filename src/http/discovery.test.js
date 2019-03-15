// @flow

import { describe, it } from 'mocha';
import { Discovery, testEntititesJSON } from './discovery';

const chai = require('chai');

const { expect } = chai;

const testEntityIdAddr = '0x0123456789abcdef0123456789abcdef01234567';

describe('Discovery', () => {
  it('new & getEntity', () => {
    const discovery = new Discovery(testEntititesJSON);
    const testEntity = discovery.getEntity(testEntityIdAddr);
    expect(testEntity).to.be.not.equal(undefined);
    if (testEntity == null) { return; }
    expect(testEntity.idAddr).to.be.equal(testEntityIdAddr);
  });
});
