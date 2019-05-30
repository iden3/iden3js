# Login protocol

The login protocol is based on the signature protocol, in which a user signs a
packet using an authorized kSign key.

For the login case, the user desires to assert a particular identity (an
ethereum address in this case) to a server so that they are allowed access into
the service while being identified.

![](login_overview.png)

## Assumptions

- Secure connection between Wallet and Server.
- Secure connection between Web Client and Server.
- Wallet authenticates the Server in the connection.
- Web Client authenticates the Server in the connection.

## What is needed

- Server authenticates the Ethereum Address and Ethereum Name from the Wallet.
- The user transfers the authentication from the Wallet to the Web Client.

## Protocol flow

![](login_flow.png)

Challenges contain a cryptographic nonce and have a timeout that indicates the
validity of the nonce in the challenge.  A signed challenge with a timed out
nonce must be rejected by the server.  The server must store a list of not
timed out nonces that haven't been signed yet to guarantee freshness.

A cryptographic nonce must be securely generated and long enough to avoid
colisions (we use 256 bits).

## Signature Protocol v0.1 spec

A signature may be requested as follows:
```
{
  header: {
    typ: iden3.sig.v0_1
  }
  body: {
    type: TYPE
    data: DATA
  }
}
```

The user will generate a packet following the signature protocol specification,
that may contain data from a signature request, or may be made from scratch.
The packet contains a header and a payload, and is serialized and signed
following the [JWS standard](https://tools.ietf.org/html/rfc7515).  Usually the
`form` will be filled by the user, and `data` will be copied from a request.

The structure of the `data` and `form` in the payload are specified by the
`type` (what is being signed) in the payload.  The rest of the elements are
specified by the `typ` (signature packet) in the header.

```
JWS_PAYLOAD = {
  type: TYPE
  data: DATA
  form: FORM
  ksign: str # ksing public key in compressed form
  proofKSing: proofClaim # Proof of authorize k sign claim (which contains the public key in compressed form)
}

JWS_HEADER = {
  typ: iden3.sig.v0_1
  iss: str # Ethereum Address
  iat: uint # issued at time, unix timestamp
  exp: uint # expiration time, unix timestamp
  alg: ? # algorithm
}

JWS_SIGN(JWS_HEADER, JWS_PAYLOAD)
```

Each Signature request `type` has a view representation for the user, where the
`data` and `form` are presented. Some of the values may be hidden from the user
when necessary, but only if doing so doesn’t compromise the security of the
user. In the request view, the user has the ability to pick some elements of
the `form`.

`ksign` is the compressed public key of a secp256k ECDSA key pair. The
`proofKSing` contains a KSign Authorize Claim for a secp256k public key.

As `JWS_HEADER.alg` we will use a custom algorithm (not defined in the JWS
standard): "EK256K1", which is ECDSA with secp256k1 curve and keccak as hash
function, the same signature algorithm configuration used in Ethereum.

### Auxiliary data structures

```
proofClaim: {
    signature: signature # Relay root + date signed by relay
    date: uint
    leaf: claim
    proofs: proofClaimPartial[]
}

proofClaimPartial: {
    mtp0: mtp # merkle tree proof of leaf existence
    mtp1: mtp # merkle tree proof of leaf non-existence
    root: key # merkle tree root
    aux: nil | { ver: uint, era: uint, id: str } # Necessary data to construct SetRootClaim from root
}
```

Usually the relay returns the `proofClaim` data structure to prove that a claim
is valid and is in the merkle tree.

## Identity Assertion v0.1 spec

payload:
```
type: iden3.iden_assert.v0_1
data: {
  challenge: nonce # 256 bits in base64
  timeout: uint # seconds
  origin: str # domain
}
form: {
  ethName: str # ethereumName
  proofAssignName: proofClaim # proof of claim Assign Name for ethName
}
```

A session id, if necessary, can be computed from the challenge.  This session
id can be used to link the communication between the web service and the wallet service.

view:
```
type: Identity Assertion
data: {
  origin: str # domain
}
form: {
  ethName: str # ethereum name
}
```

## Algorithms

Here we show an overview of the algorithms steps used for verification of the
proofs and signatures used in the login protocol.  The following algorithms
consider the case in which there is a only a single trusted entity (identified
by `relayPk`) that acts as a relay and as a domain name server.

### Signature verification algorithm
```
VerifySignedPacket(jwsHeader, jwsPayload, signature, relayPk):
1. Verify jwsHeader.typ is 'iden3.sig.v0_1'
2. Verify jwsHeader.alg is 'EK256K1'
3. Verify that jwsHeader.iat <= now() < jwsHeader.exp 
4. Verify that jwsPayload.ksign is in jwsPayload.proofKSign.leaf
5. Verify that jwsHeader.iss is in jwsPayload.proofKSign
6. Verify that signature of JWS(jwsHeader, jwsPayload) by jwsPayload.ksign is signature
7. VerifyProofOfClaim(jwsPayload.proofKSign, relayPk)
```

In 4. we verify that the ksign used to sign the packet is authorized by the user, identified by jwsHeader.iss ethereum address.

### Iden Assert verification algorithm
```
VerifyIdenAssertV01(nonceDB, origin, jwsHeader, jwsPayload, signature, relayPk):
1. Verify jwsPayload.type is 'iden3.iden_assert.v0_1'
2. Verify jwsPayload.data.origin is origin
3. Verify jwsPayload.data.challenge is in nonceDB and hasn't expired, delete it
4. Verify that jwsHeader.iss and jwsPayload.form.ethName are in jwsPayload.proofAssignName.leaf
5. VerifyProofOfClaim(jwsPayload.form.ethName, relayPk)
```

### ProofOfClaim verification
```
VerifyProofOfClaim(p, relayPk):
1. Verify signature of p.proofs[-1].root by relayPk is p.signature
   let leaf = p.leaf
2. loop for each proof in p.proofs:
    2.1 Verify proof.mtp0 is existence proof
    2.2 Verify proof.mtp0 with leaf and proof.root
    2.3 Verify proof.mtp1 is non-existence proof
    2.4 Verify proof.mtp1 with ClaimIncrementVersion(leaf) and proof.root
        leaf = NewClaimSetRootClaim(p.root, p.aux.ver, p.aux.era, p.aux.ethAddr)
```

## Rationale

See [this document](login_spec_rationale.md) for the rationale of some decisions made in the design of this protocol.
