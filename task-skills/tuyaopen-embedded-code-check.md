# Changed C/C++ file checks

Own formatting, SDK file-header/character rules and sensitive-data review for the files changed by this task. It does not prove runtime, security or hardware correctness.

Resolve this payload's scripts/check_files.py. Pass --sdk-root for the real SDK rules and --project-root for the allowed source tree; paths may be absolute or relative to that project root. Independent APPs outside the SDK are supported. Missing files, special escapes and unavailable clang-format fail explicitly; they are never reported as a pass.

Use the project's own clang-format configuration when present, otherwise the SDK configuration. The SDK's real checker supplies header and forbidden-character rules. Do not duplicate a historical year into every source file or reformat unrelated third-party code. Never show source diffs containing real credentials; inspect/sanitize before reporting.

When a UI needs Chinese text, use the project's localization/resources strategy; do not remove the feature merely to satisfy an inappropriate generic style rule. Explain any actual SDK rule conflict and keep the check's scope explicit.
