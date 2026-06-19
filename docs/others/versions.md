# Versions

## v0.1.4 (18/06/2026)

Github: [87faa66...dfa981c](https://github.com/mosona-labs/mosona-manager/compare/87faa66b6dc56047e0c92a4466d8d7ebf2fca980...dfa981c21e88ec7828b14a77af3f10965a108c23)

> This release focuses heavily on security enhancements, better update mechanisms, and improved session/auth handling.

#### New Features

1. Team Data Protection: Team export/import data is now encrypted with a user-provided password for enhanced security.
1. Self-Update Capability: Added a self-update command and background update loop for the agent, with a hub proxy update channel and GitHub fallback.
1. Version Information: Build version is now injected into binaries and exposed via a version API.
1. Automatic Container Updates: Added Watchtower support for automatic Docker container updates.
1. Authentication Improvements:
    - Optional session IP binding with centralized session finalization.
    - Migrated password hashing from SHA256 to the much more secure Argon2id (with backward compatibility and automatic rehashing).

1. Access Control & Isolation: Added site host access control and public page host isolation.
1. Security Hardening: Implemented rate limiting, proxy trust configuration, secure cookies, and path traversal protection.

#### Improvements & Refactors

1. Centralized same-origin checks into a shared pkg/httporigin package.
1. Default session_bind_ip is now enabled.
1. Aligned example environment files.
1. Updated documentation, including quickstart links, security policy (with reporting and disclosure guidelines), and Discord invite link.

#### Dependencies & Maintenance

1. Bumped Go version and updated dependencies.

