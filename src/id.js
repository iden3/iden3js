const Web3 = require('web3');

module.exports = class Id {
  constructor(web3httpURL, privK) {
    this.web3 = new Web3(new Web3.providers.HttpProvider(web3httpURL));
    if (privK != undefined) {
      // import privK
      const account = this.web3.eth.accounts.privateKeyToAccount('0x' + privK);
      this.web3.eth.accounts.wallet.add(account);
      this.web3.eth.defaultAccount = account.address;
      this.account = account;
      this.address = account.address;
      this.privateKey = '0x' + privK;
    } else {
      // generate new id
      this.account = this.web3.eth.accounts.create();
      this.address = this.account.address;
      this.privateKey = this.account.privateKey;
    }
  }

  sign(data) {
    return this.web3.eth.accounts.sign(data, this.privateKey);
  }
  verify(msg, signature, addr) {
    let recoveredAddr = this.web3.eth.accounts.recover(msg, signature);
    return (recoveredAddr.toLowerCase() === addr.toLowerCase());
  }
}