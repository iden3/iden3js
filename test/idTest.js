const chai = require('chai');
const expect = chai.expect;
const iden3 = require('../index');



let web3httpURL = 'https://ropsten.infura.io/TFnR8BWJlqZOKxHHZNcs';
let privK = 'da7079f082a1ced80c5dee3bf00752fd67f75321a637e5d5073ce1489af062d8';

describe('new ID()', function() {
    it('new ID without privK', function() {
        let id = new iden3.Id(web3httpURL);
        expect(id.account).to.not.equal(undefined);
        expect(id.address).to.not.equal(undefined);
        expect(id.privateKey).to.not.equal(undefined);
        expect(id.web3).to.not.equal(undefined);
    });

    it('new ID with privK', function() {
        let id = new iden3.Id(web3httpURL, privK);
        expect(id.account).to.not.equal(undefined);
        expect(id.address).to.not.equal(undefined);
        expect(id.privateKey).to.not.equal(undefined);
        expect(id.web3).to.not.equal(undefined);
        expect(id.address).to.be.equal('0xBc8C480E68d0895f1E410f4e4eA6E2d6b160Ca9F');
        expect(id.privateKey).to.be.equal('0xda7079f082a1ced80c5dee3bf00752fd67f75321a637e5d5073ce1489af062d8');
    });
});
describe('id.sign', function() {
    let id = new iden3.Id(web3httpURL, privK);
    let signatureObj = {};

    it('signature', function() {
        signatureObj = id.sign('test');
        expect(signatureObj.signature).to.be.equal('0x5413b44384531e9e92bdd80ff21cea7449441dcfff6f4ed0f90864583e3fcade3d5c8857672b473f71d09355e034dba11bb2ca4aa73c55c534293fdca68941041c');
    });

    it('verify signature', function() {
        let verified = id.verify('test', signatureObj.signature, id.address);
        expect(verified).to.be.equal(true);
    });
});