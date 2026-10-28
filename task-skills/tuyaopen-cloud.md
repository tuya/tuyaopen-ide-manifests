# Cloud product and DP operations

Own creating/reading products, defining DPs, synchronizing snapshots and verifying the requested platform result. The former product workflow is part of this task; it is not a compulsory prelude to local firmware work.

1. Use the authenticated IDE Agent Tool Broker. Resolve the Host project context and current revision; do not accept identity, credentials or project ownership from user text.
2. Inspect the active product. For a request to create a product, discover the actual category/solution inputs and invoke cloud.product.create; for an existing product, read cloud.product.get and cloud.dpSchema.fetch. A missing product is not an empty successful result.
3. Invoke cloud.dp.create only for required missing DPs. Query capability.describe for closed inputs instead of guessing fields. Follow P2 operation handles through confirmation and final readback; pending is not completed.
4. Invoke cloud.dp.sync to refresh the Broker-owned snapshot after a confirmed change. Do not hand-write snapshots or interpret an old revision as current.
5. On revision conflict resolve and re-read. On missing provider or authentication, report the actual prerequisite. Do not switch to a shell merely to bypass an unavailable capability/confirmation.
6. Verify product/DP identifiers and requested schema. A completed product phase does not mean firmware was implemented, activated or flashed, or that a phone panel exists.
7. Hand over to the firmware/miniapp task only when the user's scope includes it. Single DP changes stop after readback/sync, without building or publishing unrelated surfaces.

Capabilities: cloud.product.get, cloud.product.create, cloud.dpSchema.fetch, cloud.dp.create, cloud.dp.sync. Binding is a separate requested MiniApp action. Broker project.context.resolve, capability.describe/invoke and operation.get/resume/cancel/reconcile use Host-issued identity and revision; never persist credentials or raw secret responses.

Read [product details](ops/product.md) and [DP operations](ops/manage-dp.md) for field-level references. These references never override the provider's current input schema.
