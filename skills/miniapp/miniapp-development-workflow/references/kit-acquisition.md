# MiniApp Kit types and runtime

Kit type declarations and runtime availability are different concerns. Use
the IDE MiniApp project surface to inspect or install a supported Kit; do not
copy a platform runtime into the project or ask the Agent to run a package
manager as a substitute for the IDE runtime.

| Concern | Owner | Failure symptom |
|---|---|---|
| Type declarations | project typings | TypeScript errors |
| Runtime version | project metadata managed by the IDE | API missing at runtime |
| Runtime implementation | IDE preview/device runtime | preview or device capability unavailable |

The project template supplies the supported declarations. If a declaration is
missing, use the IDE's dependency/template guidance and then rebuild through
`miniapp.build`. A declaration alone never proves that the runtime is present.

Keep the package and Kit versions supported by the active product line. If a
Kit is unavailable, preserve the typed error and choose a supported capability;
do not import an arbitrary runtime implementation.
