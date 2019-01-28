# iden3js - protocols

## Login

### Generate New Request of Identity Assert
- input
	- `originAddr`: address of the emitter of the request, in Hex representation
	- `sessionId`: id of the session
	- `timeout`: unixtime format, valid until that date
- output
	- `signatureRequest`: `Object`
```js
const signatureRequest = iden3.protocols.login.newRequestIdenAssert(originAddr, sessionId, timeout);
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
	- `signedPacket`: object generated in the `signIdenAssertV01` function
- output
	- `verified`: `bool` that indicates if is verified or not
```js
const verified = iden3.protocols.login.verifySignedPacket(signedPacket);
```
