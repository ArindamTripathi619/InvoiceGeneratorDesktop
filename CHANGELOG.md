# Changelog

All notable changes to Invoice Generator Desktop will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-10

### 🎉 Initial Release

The first stable release of Invoice Generator Desktop - a professional desktop application for generating GST-compliant invoices for Apex Solar.

### ✨ Features

#### Invoice Management
- **Create Professional Invoices**: Generate GST-compliant invoices with automatic calculations
- **Auto-numbering System**: Automatic invoice numbering with financial year tracking (AS/YY-YY/XXX format)
- **Line Items Management**: Add multiple line items with description, quantity, rate, and GST
- **Tax Calculations**: Automatic CGST (9%) and SGST (9%) calculations
- **Amount in Words**: Automatic conversion of grand total to words (English)
- **PDF Generation**: High-quality PDF export with company branding
- **Draft Auto-Save**: Automatically saves invoice drafts to prevent data loss

#### Customer Management
- **Customer Templates**: Save customer information for quick invoice creation
- **Complete Address Management**: Multi-line address support with city, state, and pincode
- **GST & PAN Details**: Store customer GST and PAN numbers
- **CRUD Operations**: Full create, read, update, and delete functionality
- **Quick Selection**: Select saved customers when creating new invoices

#### Invoice History
- **View All Invoices**: Browse complete invoice history
- **Search & Filter**: Search by invoice number, customer name, or work order
- **PDF Regeneration**: Re-download PDFs for any historical invoice
- **Invoice Details**: View complete invoice information at a glance
- **Delete Invoices**: Remove invoices with confirmation dialog

#### Company Settings
- **Bank Account Details**: Configure account name, bank name, IFSC, and account number
- **GST Configuration**: Set company GST number
- **Logo Upload**: Upload company logo for invoice letterhead (PNG/JPG, max 5MB)
- **Stamp & Signature**: Upload stamp and signature image for invoices (PNG recommended)
- **Settings Persistence**: All settings saved locally and reused across invoices

#### User Interface
- **Modern Dark Theme**: Beautiful dark mode interface with smooth transitions
- **Light Theme Support**: Full light theme with excellent contrast
- **Theme Toggle**: Switch between light and dark modes instantly
- **Responsive Design**: Fully responsive from 480px to full screen
- **Windows 11 Snap Support**: Works with Windows 11 snap layouts (2, 3, 4-window modes)
- **Ultra-Compact Mode**: Optimized for 25% screen space (480px minimum width)
- **Splash Screen**: Professional animated splash screen with company branding
- **Icon-Only Navigation**: Compact navigation for small screen sizes

#### Technical Features
- **Local Data Storage**: All data stored securely on your device (Windows AppData)
- **No Internet Required**: Fully offline application, no cloud dependencies
- **Fast Performance**: Native desktop performance with Tauri + React
- **Windows Optimized**: Specifically optimized for Windows 10/11
- **WebView2 Runtime**: Uses Microsoft Edge WebView2 for modern web rendering
- **Small Footprint**: Efficient application size with optimized builds

### 🎨 Design & UX
- Smooth theme transitions (200ms duration)
- Consistent color palette across all components
- Professional typography and spacing
- Loading states for async operations
- Confirmation dialogs for destructive actions
- Success/error notifications for user feedback
- Keyboard-friendly inputs and navigation

### 🔒 Security & Privacy
- **Local-Only Storage**: All data stays on your machine
- **No Tracking**: No analytics, telemetry, or external connections
- **Sandboxed Access**: Tauri's secure file system permissions
- **Data Privacy**: Customer and invoice data remains private

### 📦 Deliverables
- Windows Installer (.msi)
- Windows Executable (.exe)
- Complete source code (MIT License)
- Comprehensive documentation

### 📋 System Requirements
- **OS**: Windows 10 (1809+) or Windows 11
- **Runtime**: Microsoft Edge WebView2 (automatically installed if missing)
- **Disk Space**: ~50MB for application
- **RAM**: 200MB minimum
- **Screen**: 480px minimum width (supports up to 4K displays)

### 🛠️ Tech Stack
- **Frontend**: React 18.3, TypeScript 5.5, Tailwind CSS 3.4
- **Desktop**: Tauri 1.5 (Rust + WebView2)
- **PDF Generation**: jsPDF 3.0 with autoTable
- **Icons**: Lucide React
- **Build**: Vite 5.4

### 📖 Documentation
- README.md with installation and usage instructions
- SETUP_GUIDE.md for development environment setup
- DEVELOPER_NOTES.md with project structure and guidelines
- USER_GUIDE.md for end users
- API documentation for Tauri storage utilities

### 🐛 Known Issues
None at this time.

### 🔮 Future Considerations
- Data export/import functionality
- Backup and restore features
- Custom invoice templates
- Multi-language support
- Email integration
- Batch PDF generation
- Advanced search filters
- Custom tax rates
- Multi-company support

---

## Release Notes Format

### Types of Changes
- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for vulnerability fixes

---

For full release details and downloads, visit: [Releases](https://github.com/ArindamTripathi619/InvoiceGeneratorDesktop/releases)
