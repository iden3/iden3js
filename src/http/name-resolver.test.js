// @flow

import { describe, it } from 'mocha';
import { NameResolver, testNamesJSON } from './name-resolver';

const chai = require('chai');

const { expect } = chai;

const testName = 'iden3.io';
const testEntityIdAddr = '0x0123456789abcdef0123456789abcdef01234567';

describe('[NameResolver]', () => {
  it('new & resolve', () => {
    const nameResolver = new NameResolver(testNamesJSON);
    const testIdAddr = nameResolver.resolve(testName);
    expect(testIdAddr).to.be.not.equal(undefined);
    if (testIdAddr == null) { return; }
    expect(testIdAddr).to.be.equal(testEntityIdAddr);
  });
});
