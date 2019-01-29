class NonceDB {
	constructor() {
		this.nonces = [];
	}

	deleteElem(nonce) {
	  const n = this.search(nonce);
	  if (n===undefined) {
		return;
	  }
	  this.nonces.splice(n.index, 1);
	}
	deleteOld(timestamp) {
	  for(let i=0;i<this.nonces.length; i++) {
	    if (this.nonces[i].timestamp>=timestamp) {
	      this.nonces.splice(0, i);
	      break;
	    }
	  }
	}

	add(nonce, timeout) {
	  this.nonces.push({
	    nonce: nonce,
	    timestamp: timeout
	  });
	};

	search(nonce) {
	  for(let i=0;i<this.nonces.length; i++) {
	    if (this.nonces[i].nonce==nonce) {
	      return {nonce: this.nonces[i], index: i};
	    }
	  }
	  return undefined;
	}
}

module.exports = NonceDB;
