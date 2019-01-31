# Rationale

The following document contains references to similar protocols on which our
login protocol relies on or takes inspiration from.

## Signature format

Use JSON to encode the object that will be signed.

### JSON Signing formats

https://medium.facilelogin.com/json-message-signing-alternatives-897f90d411c

- JSON Web Signature (JWS)
    - Doesn't need canonicalization
    - Allows signing arbitrary data (not only JSON)
    - Widely used
- JSON Cleartext Signature (JCS)
- Concise Binary Object Representation (CBOR) Object Signing

https://matrix.org/docs/spec/appendices.html#signing-json

- Matrix JSON Signing
    - Allows having multiple signatures with different protocols for a single JSON

## Possible attacks

See WebAuth API, FIDO Threat analysis

## References

- https://en.wikipedia.org/wiki/OpenID
- https://en.wikipedia.org/wiki/OpenID_Connect
- https://en.wikipedia.org/wiki/IndieAuth
- https://fidoalliance.org/how-fido-works/

### WebAuth API

- https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API
- https://w3c.github.io/webauthn/
- https://www.w3.org/TR/webauthn/

Demo:
- https://www.webauthn.org/

FIDO Security guarantees and how they are achieved:
- https://fidoalliance.org/specs/fido-v2.0-id-20180227/fido-security-ref-v2.0-id-20180227.html#relation-between-measures-and-goals
- 
FIDO Threat analysis and mitigations:
- https://fidoalliance.org/specs/fido-v2.0-id-20180227/fido-security-ref-v2.0-id-20180227.html#threat-analysis

Currently (2018-01-08) there's no support for iOS (Safari):
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API#Browser_compatibility

Criticism:
- https://www.scip.ch/en/?labs.20180424

Example code of server verification:
- https://github.com/duo-labs/webauthn/blob/fa6cd954884baf24fc5a51656ce21c1a1ef574bc/main.go#L336
- https://w3c.github.io/webauthn/#verifying-assertion

## Apendix

### The FIDO protocols security goals:

#### [SG-1]
Strong User Authentication: Authenticate (i.e. recognize) a user and/or a device to a relying party with high (cryptographic) strength.
#### [SG-2]
Credential Guessing Resilience: Provide robust protection against eavesdroppers, e.g. be resilient to physical observation, resilient to targeted impersonation, resilient to throttled and unthrottled guessing. 
#### [SG-3]
Credential Disclosure Resilience: Be resilient to phishing attacks and real-time phishing attack, including resilience to online attacks by adversaries able to actively manipulate network traffic. 
#### [SG-4]
Unlinkablity: Protect the protocol conversation such that any two relying parties cannot link the conversation to one user (i.e. be unlinkable). 
#### [SG-5]
Verifier Leak Resilience: Be resilient to leaks from other relying parties. I.e., nothing that a verifier could possibly leak can help an attacker impersonate the user to another relying party. 
#### [SG-6]
Authenticator Leak Resilience: Be resilient to leaks from other FIDO Authenticators. I.e., nothing that a particular FIDO Authenticator could possibly leak can help an attacker to impersonate any other user to any relying party. 
#### [SG-7]
User Consent: Notify the user before a relationship to a new relying party is being established (requiring explicit consent). 
#### [SG-8]
Limited PII: Limit the amount of personal identifiable information (PII) exposed to the relying party to the absolute minimum. 
#### [SG-9]
Attestable Properties: Relying Party must be able to verify FIDO Authenticator model/type (in order to calculate the associated risk). 
#### [SG-10]
DoS Resistance: Be resilient to Denial of Service Attacks. I.e. prevent attackers from inserting invalid registration information for a legitimate user for the next login phase. Afterward, the legitimate user will not be able to login successfully anymore. 
#### [SG-11]
Forgery Resistance: Be resilient to Forgery Attacks (Impersonation Attacks). I.e. prevent attackers from attempting to modify intercepted communications in order to masquerade as the legitimate user and login to the system. 
#### [SG-12]
Parallel Session Resistance: Be resilient to Parallel Session Attacks. Without knowing a user’s authentication credential, an attacker can masquerade as the legitimate user by creating a valid authentication message out of some eavesdropped communication between the user and the server. 
#### [SG-13]
Forwarding Resistance: Be resilient to Forwarding and Replay Attacks. Having intercepted previous communications, an attacker can impersonate the legal user to authenticate to the system. The attacker can replay or forward the intercepted messages. 
#### [SG-14] (not covered by U2F)
Transaction Non-Repudiation: Provide strong cryptographic non-repudiation for secure transactions. 
#### [SG-15]
Respect for Operating Environment Security Boundaries: Ensure that registrations and private key material as a shared system resource is appropriately protected according to the operating environment privilege boundaries in place on the FIDO user device. 
#### [SG-16]
Assessable Level of Security: Ensure that the design and implementation of the Authenticator allows for the testing laboratory / FIDO Alliance to assess the level of security provided by the Authenticator. 
