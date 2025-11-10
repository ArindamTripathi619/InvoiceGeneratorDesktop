# Security Policy

## Supported Versions

We are currently supporting the following versions of Invoice Generator Desktop with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Features

Invoice Generator Desktop is designed with security in mind:

- **Local Data Storage**: All data is stored locally on your machine using Tauri's secure file system APIs
- **No Cloud Dependencies**: No data is sent to external servers or cloud services
- **Data Privacy**: Customer information, invoices, and company settings remain private on your device
- **File System Isolation**: Uses Tauri's sandboxed file system access with restricted permissions
- **Input Validation**: All user inputs are validated to prevent injection attacks

## Data Storage Locations

All application data is stored in the following secure locations:

### Windows
- `%APPDATA%\com.apexsolar.invoicegenerator\`
  - `invoices.json` - Invoice records
  - `customers.json` - Customer information
  - `company_settings.json` - Company configuration
  - `draft_invoice.json` - Auto-saved draft
  - `company_logo.txt` - Company logo (Base64)
  - `stamp_signature.txt` - Stamp & signature (Base64)

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### How to Report

1. **DO NOT** create a public GitHub issue for security vulnerabilities
2. Email the security team at: **security@apexsolar.com** (or create a private security advisory on GitHub)
3. Include the following information:
   - Description of the vulnerability
   - Steps to reproduce the issue
   - Affected versions
   - Potential impact
   - Any suggested fixes (optional)

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your report within 48 hours
- **Investigation**: We will investigate the issue and determine its severity
- **Timeline**: We aim to provide an initial response within 5 business days
- **Resolution**: Critical vulnerabilities will be patched as soon as possible
- **Disclosure**: We follow responsible disclosure practices

### Security Update Process

1. Security patches will be released as soon as they are ready
2. Users will be notified through:
   - GitHub release notes
   - Security advisories
   - In-app notifications (for critical updates)

## Best Practices for Users

To ensure the security of your data:

1. **Keep Software Updated**: Always use the latest version of the application
2. **Backup Your Data**: Regular backups of your invoice and customer data
3. **Secure Your Device**: Use proper OS-level security (antivirus, firewall, user authentication)
4. **File Permissions**: Ensure the AppData directory has appropriate access controls
5. **Sensitive Data**: Be cautious when sharing generated PDF invoices containing sensitive information

## Known Security Considerations

- **PDF Export**: Generated PDFs may contain embedded images (logo, stamp, signature)
- **Data Export**: Currently no built-in data export/import feature (manual file backup required)
- **Auto-Save**: Draft invoices are automatically saved locally (can be disabled in settings if needed)

## Security Auditing

This project uses:
- Tauri's security features and sandboxing
- React for UI (regular dependency updates)
- No external API calls or network requests
- Local-only data persistence

## Contact

For security-related questions or concerns:
- GitHub: [@ArindamTripathi619](https://github.com/ArindamTripathi619)
- Repository: [InvoiceGeneratorDesktop](https://github.com/ArindamTripathi619/InvoiceGeneratorDesktop)

---

Last Updated: November 10, 2025
