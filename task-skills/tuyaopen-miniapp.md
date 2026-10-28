# MiniApp development and requested release stages

Own template creation, device schema, build, preview and explicitly requested upload/review/release/binding. It includes the former workflow's phase order and resources. Ray APIs, Smart UI implementation, charts, PRD and quality review remain separate task references.

1. Resolve the Host context and current project line. Use capability.list/describe and the authenticated Agent Tool adapter. Host-owned identity/revision must not be supplied from a prompt.
2. Inspect existing files and state before selecting/creating a template. Do not replace an existing app or overwrite its appid and device integration.
3. For DP-backed changes, synchronize through cloud.dp.sync then miniapp.schema.generate against that snapshot. A local-only UI task does not require creating a cloud product.
4. Implement through the appropriate Ray/Smart UI/chart skill. Preserve the actual project layout from the Host; TuyaOpen and TuyaOS panel directories differ.
5. Build and start preview with the declared capabilities. Retain process ownership, inspect preview status and clean up only sessions owned by this operation. Workspace switches invalidate handles.
6. Use available automated inspection first; otherwise state the exact user-observed evidence needed. Do not claim UI correctness from build output alone.
7. Stop at the requested endpoint. Upload, submit review, publish and bind are separate writes; each follows its P2 operation handle and final typed readback. An upload request is not permission to publish.
8. packagePath must identify the actual archive on the Host; required upload materials are produced by the real build/signing chain, never invented. Query capability.describe rather than copying guessed fields.
9. Report local build/preview, upload, review, publication and binding separately. Authentication, unavailable provider and revision conflicts are real prerequisites, not shell-fallback triggers.

Discover capability inputs for miniapp.template.*, miniapp.build, miniapp.schema.generate, miniapp.preview.*, miniapp.upload, miniapp.review.submit, miniapp.release.publish and miniapp.binding.*. Broker operation states are resumable; never replay a completed write with a fresh request ID.

The inherited scripts/fetch_doc.py, scripts/search_help.py and scripts/validate.mjs remain available under this same payload. Read each script's help and applicability before execution. Validation thresholds are project/tool-specific until supported by an actual platform limit or project agreement; the script is not a universal publication approval.

Resolve files from this payload for its architecture, conventions, Kit/theme and upload checks. Use tuyaopen-miniapp-ray-common for framework/API questions, tuyaopen-miniapp-smart-ui for component implementation, and tuyaopen-miniapp-performance-ux-guard for quality evidence.
