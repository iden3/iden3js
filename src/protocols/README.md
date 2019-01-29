# iden3js - protocols

## Login

### Define new NonceDB
```js
const nonceDB = new iden3.protocols.NonceDB();
```

### Generate New Request of Identity Assert
- input
	- `nonceDB`: NonceDB class object
	- `originAddr`: address of the emitter of the request, in Hex representation
	- `sessionId`: id of the session
	- `timeout`: unixtime format, valid until that date. Usually used the `iden3.protocols.login.NONCEDELTATIMEOUT`, as is defined inside iden3js library
- output
	- `signatureRequest`: `Object`
```js
const signatureRequest = iden3.protocols.login.newRequestIdenAssert(nonceDB, originAddr, sessionId, iden3.protocols.login.NONCEDELTATIMEOUT);
```

### Sign Packet
- input
	- `signatureRequest`: object generated in the `newRequestIdenAssert` function
	- `userAddr`: Eth Address of the user that signs the data packet
	- `ethName`: name assigned to the `userAddr`
	- `proofOfEthName`: `proofOfClaim` of the `ethName`
	- `kc`: iden3.KeyContainer object
	- `ksign`: KOperational authorized for the `userAddr`
	- `proofOfKSign`: `proofOfClaim` of the `ksign`
	- `expirationTime`: unixtime format, signature will be valid until that date
- output
	- `signedPacket`: `String`
```js
const expirationTime = unixtime + (3600 * 60);
const signedPacket = iden3.protocols.login.signIdenAssertV01(signatureRequest, usrAddr, ethName, proofOfEthName, kc, ksign, proofOfKSign, expirationTime);
```

### Verify Signed Packet
- input
	- `nonceDB`: NonceDB class object
	- `signedPacket`: object generated in the `signIdenAssertV01` function
- output
	- `verified`: `bool` that indicates if is verified or not
```js
const verified = iden3.protocols.login.verifySignedPacket(nonceDB, signedPacket);
```
