# Apex Solar Invoice Generator - Desktop Application

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/ArindamTripathi619/InvoiceGeneratorDesktop/releases)
[![Platform](https://img.shields.io/badge/platform-Windows-0078D6.svg)](https://www.microsoft.com/windows)
[![Tauri](https://img.shields.io/badge/Tauri-1.5-FFC131.svg)](https://tauri.app/)

A professional Windows desktop application for generating and managing invoices for Apex Solar. Built with Tauri, React, TypeScript, and Tailwind CSS.

## 🎉 Version 1.0.0 Release

The first stable release is here! See [RELEASE_v1.0.0.md](./RELEASE_v1.0.0.md) for full release notes.

## 🚀 Features

- ✨ **Beautiful Modern UI** - Clean, professional interface optimized for Windows
- 📄 **PDF Invoice Generation** - Create detailed, professionally formatted invoices
- 💾 **Local Data Storage** - All data stored securely on your computer using Tauri's filesystem API
- 👥 **Customer Management** - Save and reuse customer information
- 📊 **Invoice History** - Track all generated invoices
- ⚙️ **Company Settings** - Configure bank details, logos, and signatures
- 🔍 **Search Functionality** - Quickly find invoices and customers
- 💰 **GST Calculations** - Automatic CGST and SGST calculations
- 🔄 **Auto-save Drafts** - Never lose your work

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Windows Prerequisites

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Choose LTS version recommended for most users

2. **Rust** (Latest stable version)
   - Download from: https://www.rust-lang.org/tools/install
   - Use rustup installer for Windows
   - After installation, restart your terminal

3. **Visual Studio C++ Build Tools**
   - Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
   - Select "Desktop development with C++" workload
   - OR install full Visual Studio with C++ support

4. **WebView2** (Usually pre-installed on Windows 10/11)
   - If needed, download from: https://developer.microsoft.com/en-us/microsoft-edge/webview2/

### Verify Installations

Open PowerShell or Command Prompt and run:

```bash
node --version
npm --version
rustc --version
cargo --version
```

All commands should return version numbers.

## 🛠️ Installation & Setup

### 1. Navigate to Project Directory

```bash
cd C:\path\to\InvoiceGeneratorDesktop
```

### 2. Install Dependencies

```bash
npm install
```

This will install all JavaScript/TypeScript dependencies including:
- React and React DOM
- Tauri API
- Lucide React (icons)
- jsPDF and jspdf-autotable (PDF generation)
- Tailwind CSS
- TypeScript and Vite

### 3. Initialize Tauri (If needed)

If the src-tauri directory doesn't have Cargo.lock:

```bash
cd src-tauri
cargo fetch
cd ..
```

## 🏃‍♂️ Development

### Start Development Server

```bash
npm run tauri:dev
```

This will:
1. Start the Vite development server
2. Compile the Rust backend
3. Launch the application in development mode
4. Enable hot-reload for both frontend and backend

**First run may take 5-10 minutes** as Rust dependencies compile.

### Development Features

- **Hot Reload**: Changes to React components update instantly
- **DevTools**: Press `Ctrl+Shift+I` to open Chrome DevTools
- **Debug Mode**: Rust console logs visible in terminal

## 📦 Building for Production

### Create Windows Installer

```bash
npm run tauri:build
```

This process will:
1. Build optimized React bundle with Vite
2. Compile Rust code in release mode with optimizations
3. Create Windows installer (.msi) and executable (.exe)
4. Bundle required WebView2 runtime

### Build Artifacts

After successful build, find installers in:

```
src-tauri/target/release/bundle/
├── msi/
│   └── Apex Solar Invoice Generator_1.0.0_x64_en-US.msi
└── nsis/
    └── Apex Solar Invoice Generator_1.0.0_x64-setup.exe
```

### Build Options

**Debug Build** (faster compilation, larger file):
```bash
npm run tauri:build:debug
```

**Release Build** (optimized, smaller file):
```bash
npm run tauri:build
```

## 📁 Project Structure

```
InvoiceGeneratorDesktop/
├── src/                          # Frontend React code
│   ├── components/               # React components
│   │   ├── InvoiceForm.tsx      # Main invoice creation form
│   │   ├── InvoiceHistory.tsx   # Invoice list and management
│   │   ├── CustomerManagement.tsx # Customer CRUD operations
│   │   └── Settings.tsx         # Company settings and uploads
│   ├── services/
│   │   └── pdfGenerator.ts      # PDF generation logic (DO NOT MODIFY)
│   ├── types/
│   │   ├── invoice.ts           # TypeScript interfaces
│   │   └── jspdf-autotable.d.ts # Type definitions
│   ├── utils/
│   │   ├── tauriStorage.ts      # Tauri filesystem storage wrapper
│   │   └── numberToWords.ts     # Number to words conversion
│   ├── App.tsx                  # Main app component
│   ├── main.tsx                 # React entry point
│   └── index.css                # Global styles with Tailwind
├── src-tauri/                   # Rust backend code
│   ├── src/
│   │   └── main.rs              # Rust entry point
│   ├── Cargo.toml               # Rust dependencies
│   ├── tauri.conf.json          # Tauri configuration
│   └── build.rs                 # Build script
├── public/                      # Static assets
├── index.html                   # HTML entry point
├── package.json                 # Node.js dependencies and scripts
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This file
```

## 💾 Data Storage

### Storage Location

All application data is stored in:

```
C:\Users\<YourUsername>\AppData\Roaming\com.apexsolar.invoicegenerator\
```

### Stored Files

- `invoices.json` - All generated invoices
- `customers.json` - Customer database
- `company_settings.json` - Bank details and settings
- `draft_invoice.json` - Auto-saved draft
- `stamp_signature.txt` - Base64 encoded stamp image
- `company_logo.txt` - Base64 encoded logo image
- `generated/` - Folder containing generated PDF invoices

### Backup Your Data

To backup, simply copy the entire folder above to a safe location.

## 🎨 Customization

### Company Branding

1. Launch the application
2. Go to **Settings** tab
3. Upload your company logo (PNG recommended)
4. Upload stamp and signature image
5. Update bank account details
6. Save settings

### PDF Template

**⚠️ IMPORTANT**: The PDF generation template in `src/services/pdfGenerator.ts` is **fine-tuned for company requirements**. Do not modify this file unless absolutely necessary.

If modifications are needed:
1. Create a backup of the original file
2. Test thoroughly before deployment
3. Verify PDF output matches company standards

## 🔧 Configuration

### Window Settings

Edit `src-tauri/tauri.conf.json` to customize:

```json
{
  "tauri": {
    "windows": [{
      "width": 1400,
      "height": 900,
      "minWidth": 1200,
      "minHeight": 700,
      "title": "Apex Solar - Invoice Generator"
    }]
  }
}
```

### Permissions

Tauri uses a permission system. Current permissions in `tauri.conf.json`:

- **fs** - File system access (read/write invoices, settings)
- **dialog** - Save/open file dialogs
- **path** - Access to app data directory
- **shell** - Open PDFs in default viewer

## 🐛 Troubleshooting

### Build Errors

**Error: "WebView2 not found"**
- Solution: Install WebView2 runtime from Microsoft

**Error: "Rust compiler not found"**
- Solution: Reinstall Rust using rustup and restart terminal

**Error: "VCRUNTIME140.dll not found"**
- Solution: Install Visual C++ Redistributable

**Error: "npm install fails"**
- Solution: Delete `node_modules` and `package-lock.json`, then run `npm install` again

### Runtime Errors

**PDFs not generating**
- Check if app has write permissions to AppData folder
- Verify company logo and stamp are uploaded
- Check browser console for errors (Ctrl+Shift+I)

**Data not saving**
- Ensure application has write permissions
- Check AppData folder exists and is accessible
- Try running as administrator (not recommended for regular use)

**Application won't start**
- Delete `src-tauri/target` folder and rebuild
- Check Windows Event Viewer for error details
- Try running from command line to see errors

## 📝 Usage Guide

### Creating an Invoice

1. Click **Create Invoice** tab
2. Enter invoice number (e.g., "022")
3. Select invoice date
4. Choose existing customer or enter new customer details
5. Add line items with descriptions and rates
6. Review calculated totals
7. Click **Generate PDF**
8. Choose save location
9. PDF is automatically saved to `generated/` folder and your chosen location

### Managing Customers

1. Click **Customers** tab
2. Click **Add Customer** button
3. Fill in company details
4. Click **Save Customer**
5. Use Edit icon to modify, Delete icon to remove

### Viewing Invoice History

1. Click **Invoice History** tab
2. Use search bar to filter invoices
3. Click **PDF** button to regenerate invoice
4. Click **Delete** button to remove invoice

### Configuring Settings

1. Click **Settings** tab
2. Update bank account details
3. Upload company logo (appears on letterhead)
4. Upload stamp and signature (appears on invoice)
5. Click **Save Settings**

## 🚀 Deployment

### For Single Computer

1. Build the installer: `npm run tauri:build`
2. Run the generated `.msi` or `.exe` installer
3. Follow installation wizard
4. Application will be added to Start Menu

### For Multiple Computers

1. Build once: `npm run tauri:build`
2. Copy the installer file from `src-tauri/target/release/bundle/`
3. Distribute to other computers
4. Install on each machine

**Note**: Each installation creates separate data storage.

### Creating Portable Version

Tauri doesn't support truly portable apps, but you can:
1. Install on one machine
2. Copy the installed folder from `C:\Program Files\Apex Solar Invoice Generator`
3. May require bundled WebView2 for portability

## 🔒 Security

- All data stored locally on user's computer
- No cloud services or external connections
- No telemetry or analytics
- No user tracking
- Filesystem access limited to app data directory

## 🆘 Support

### Getting Help

1. Check this README thoroughly
2. Review error messages in console (Ctrl+Shift+I)
3. Check Windows Event Viewer for system errors
4. Verify all prerequisites are installed correctly

### Common Questions

**Q: Can I use this on Mac or Linux?**
A: This version is optimized for Windows. Tauri supports other platforms but requires additional testing and configuration.

**Q: Where are my invoices stored?**
A: PDFs are saved in the `generated/` folder within AppData and your chosen location.

**Q: Can I backup my data?**
A: Yes, backup the entire folder at `C:\Users\<YourUsername>\AppData\Roaming\com.apexsolar.invoicegenerator\`

**Q: How do I update the app?**
A: Install the new version over the existing one. Data will be preserved.

**Q: Can I run multiple instances?**
A: Yes, but they'll share the same data storage.

## 📄 License

Copyright © 2025 Apex Solar. All rights reserved.

## 🔄 Updates

To update the application:
1. Pull latest code
2. Run `npm install` to update dependencies
3. Rebuild: `npm run tauri:build`
4. Install new version

## 📞 Technical Specifications

- **Framework**: Tauri v1.5
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Rust
- **PDF Generation**: jsPDF 3.0
- **Build Tool**: Vite 5
- **Target Platform**: Windows 10/11 (x64)
- **Minimum RAM**: 4GB
- **Disk Space**: 150MB installed

---

**Built with ❤️ for Apex Solar**
