const chai = require('chai');
const { expect } = chai;
const mimc7HashBuffer = require('./kc-utils').mimc7HashBuffer;

describe('[kc-utils] Test single functions', () => {
  it('mimc7HashBuffer', () => {
    const msg = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
    const h = mimc7HashBuffer(new Buffer.from(msg, 'utf-8'));
    expect(h.toString()).to.be.equal('16855787120419064316734350414336285711017110414939748784029922801367685456065')
  });
});
