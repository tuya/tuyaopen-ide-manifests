# Device credentials, provisioning and activation

Own local license bookkeeping, credential write/readback, and diagnosing the provisioning/activation chain. A build or local-only feature does not require cloud authorization.

1. Establish the user's requested cloud outcome and the current device. If authorization is the requested task, handle it directly; do not demand an unrelated rebuild first.
2. Check device credential state without printing the secret. Local CLI licenses, IDE license storage and credentials already on the device are different records. A nonempty local store does not prove the device is authorized.
3. If a credential is needed, explain the actual acquisition routes and ask the user to provide it securely. Do not invent a UUID or claim a local license-store command issues platform codes. Reuse the user's prior confirmation that a code is available; do not repeatedly request it.
4. Establish the target port and confirm the code is not simultaneously assigned to another active device. Use the installed authorize contract, then read back its status without exposing AuthKey.
5. Device credential presence is not cloud activation. In the verified SDK client no active is printed when client->is_activated is false, which can occur with credentials present before provisioning/activation. Do not prescribe another code from that log alone.
6. Verify the stages separately: credential state, network/provisioning state, cloud activation, MQTT connection and requested DP exchange. Absence of a log line is not success evidence.
7. Phone pairing may require the user's phone/account; give precise current steps and report that hand-off, not a completed pairing you did not observe. Where tools expose actual state, use it rather than insisting it is inherently unobservable.

AuthKey must not appear in assistant output, source or shell history. Prefer the local store/stdin at the outer CLI. The underlying tyutool wrapper may still pass a secret to its own child argv; this is an existing exposure boundary, not something an env prefix eliminates. Consult the current tool contract; do not copy obsolete token/P2-env rituals.
