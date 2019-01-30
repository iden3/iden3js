# iden3js - protocols

## Login (Identity Assertion)

```
Wallet                                   Service
  +                                         +
  |           signatureRequest              |
  | <-------------------------------------+ |
  |                                         |
  | +---+                                   |
  |     |                                   |
  |     |sign packet                        |
  |     |                                   |
  | <---+                                   |
  |              signedPacket               |
  | +-------------------------------------> |
  |                                         |
  |                                  +---+  |
  |                      verify      |      |
  |                      signedPacket|      |
  |                                  |      |
  |                                  +--->  |
  |                                         |
  |                 ok                      |
  | <-------------------------------------+ |
  |                                         |
  |                                         |
  |                                         |
  +                                         +
```



### Define new NonceDB
```js
const nonceDB = new iden3.protocols.NonceDB();
```

### Generate New Request of Identity Assert
- input
	- `nonceDB`: NonceDB class object
	- `origin`: domain of the emitter of the request
	- `timeout`: unixtime format, valid until that date. We can use for example 2 minutes (`2*60` seconds)
- output
	- `signatureRequest`: `Object`
```js
const signatureRequest = iden3.protocols.login.newRequestIdenAssert(nonceDB, origin, 2*60);
```

The `nonce` of the `signatureRequest` can be getted from:
```js
const nonce = signatureRequest.body.data.challenge;
// nonce is the string containing the nonce value
```

We can add auxiliar data to the `nonce` in the `nonceDB` only one time:
```js
const added = nodeDB.addAuxToNonce(nonce, auxdata);
// added is a bool confirming if the aux data had been added
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
	- `origin`: domain of the emitter of the request
	- `signedPacket`: object generated in the `signIdenAssertV01` function
- output
	- `nonce`: nonce object of the signedPacket, that has been just deleted from the nonceDB when the signedPacket is verified. If the verification fails, the nonce will be `undefined`
```js
const verified = iden3.protocols.login.verifySignedPacket(nonceDB, origin, signedPacket);
```
