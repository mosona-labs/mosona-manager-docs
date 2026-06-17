# Security Warning

> To report vulnerabilities, visit [GitHub Security](https://github.com/mosona-labs/mosona-manager/security) for instructions on submitting issues or private reports. We will respond and address them as quickly as possible.

The purpose of this page is to highlight the risks associated with insecure usage of this project. Always follow security best practices to protect your systems and data.

## Why This Project Matters

This project includes remote control and execution capabilities (when remote control is enabled). In SSH mode, it stores connection details—such as host addresses, usernames, passwords, and keys—in the database. Although this data is encrypted, an attacker who gains elevated privileges (e.g., by extracting data from the database or escaping the container) could potentially retrieve the encryption keys and decrypt the information.

Any breach or attack could have severe consequences. Remote probes inherently carry this type of security risk, and no project can fully eliminate it—even local SSH clients remain vulnerable to credential theft by malware. Following security best practices is therefore essential.

History has shown the painful consequences of security oversights across countless projects. While convenience and speed often come at the cost of added risk, we strive to minimize exposure wherever possible.

## Security Best Practices

### 1. Avoid Weak Passwords

Set a strong password that meets the control panel's password strength requirements.

### 2. Enable 2FA Verification

Always enable Two-Factor Authentication (TOTP) or email verification. This ensures that even if your password is compromised, attackers cannot easily log in.

### 3. Enforce Access Isolation

During initial setup, you must bind a base URL. After this, the control panel will only be accessible via that URL. We recommend binding it to a dedicated domain rather than using an IP address.

For Public Pages, best practice is to use a separate dedicated domain instead of sharing access through the main control panel's path. This project blocks all administrative API access from the Public Page domain.

### 4. Use Cloudflare Tunnel or VPN

If you need public internet access to the control panel, use Cloudflare Tunnel or a VPN to avoid exposing your server directly. Attackers who discover your instance's associated IP address may attempt direct attacks; hiding your IP significantly reduces this risk.

### 5. Protect the Control Panel with Cloudflare Access or Zero Trust

Cloudflare Access or Zero Trust provides strong additional authentication and access controls, ensuring only authorized or organization-internal users can reach the control panel. This is one of the most effective security measures available.

### 6. Keep Auto-Updates Enabled

Do not disable automatic updates. Running the latest version ensures you always have the most recent security fixes and improvements.
