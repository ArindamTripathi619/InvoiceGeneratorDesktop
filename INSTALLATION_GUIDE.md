# Installation Guide - Invoice Generator Desktop v1.0.0

## 🚀 Quick Start

Choose your installation method and follow the steps below.

---

## ⚠️ Important: Windows Security Warning

**You WILL see a Windows SmartScreen warning when installing.** This is expected and normal.

### Why This Happens

- This is a **brand new application** without an established Windows reputation
- We don't yet have a **code signing certificate** (costs $400-600/year)
- Windows doesn't recognize new publishers until they build reputation

### This Does NOT Mean:
- ❌ The software is malicious
- ❌ Your computer is at risk
- ❌ The software has viruses

### This DOES Mean:
- ✅ Windows is being cautious with new software
- ✅ You need to explicitly approve the installation

### How to Proceed

When you see **"Windows protected your PC"**:

1. Click **"More info"**
2. Click **"Run anyway"**
3. Proceed with installation

**Visual Guide:**

```
┌─────────────────────────────────────────┐
│ Windows protected your PC               │
│ Windows Defender SmartScreen            │
│ prevented an unrecognized app from      │
│ starting. Running this app might put    │
│ your PC at risk.                        │
│                                         │
│ Publisher: Unknown                      │
│                                         │
│ [Don't run]    [More info] ← Click here│
└─────────────────────────────────────────┘

Then:

┌─────────────────────────────────────────┐
│ Windows protected your PC               │
│ Windows Defender SmartScreen            │
│ prevented an unrecognized app from      │
│ starting. Running this app might put    │
│ your PC at risk.                        │
│                                         │
│ Publisher: Unknown                      │
│                                         │
│ [Run anyway] ← Click here               │
└─────────────────────────────────────────┘
```

---

## 📦 Installation Methods

### Method 1: MSI Installer (Recommended)

**Best for**: Most users, standard Windows installation experience

**File**: `Apex Solar Invoice Generator_1.0.0_x64_en-US.msi` (4.36 MB)

**Steps**:
1. Download the MSI file from GitHub Releases
2. Locate the file in your Downloads folder
3. Double-click the MSI file
4. **Handle SmartScreen warning** (see above)
5. Click "Next" through the installation wizard
6. Choose installation location (default: `C:\Program Files\Apex Solar Invoice Generator`)
7. Click "Install"
8. Click "Finish"

**Result**: 
- Application installed in Program Files
- Start Menu shortcut created
- Desktop shortcut created (optional)
- Can be uninstalled via Windows Settings

---

### Method 2: NSIS Setup Executable

**Best for**: Users who prefer NSIS installers

**File**: `Apex Solar Invoice Generator_1.0.0_x64-setup.exe` (3.64 MB)

**Steps**:
1. Download the setup EXE file from GitHub Releases
2. Locate the file in your Downloads folder
3. Double-click the EXE file
4. **Handle SmartScreen warning** (see above)
5. Choose "Install for me only" or "Install for all users"
6. Select installation location
7. Choose additional options (shortcuts, auto-start, etc.)
8. Click "Install"
9. Launch application

**Result**:
- Application installed in chosen location
- Start Menu entry created
- Optional desktop shortcut
- Uninstaller included

---

## 🔍 Verify Download Integrity (Optional)

To ensure your download wasn't tampered with, verify the SHA256 checksum:

### Windows PowerShell Method:

```powershell
# For MSI
Get-FileHash "Apex Solar Invoice Generator_1.0.0_x64_en-US.msi" -Algorithm SHA256

# For NSIS
Get-FileHash "Apex Solar Invoice Generator_1.0.0_x64-setup.exe" -Algorithm SHA256
```

### Expected Checksums:

**MSI**: `460B2D0C1B4C735DD889890DC455ACE1BB7C8CF07B9C5C7A37294EB5E28AC288`

**NSIS**: `699AACE715E949A0E8E16D905F38CD71B4BBE749EE8B00DEBE370C53CF74B9C6`

If the checksums match, your download is authentic and untampered.

---

## 🎯 First Launch

After installation:

1. **Find the application**:
   - Start Menu → "Apex Solar Invoice Generator"
   - Or desktop shortcut (if created)

2. **Launch the application**

3. **WebView2 Installation** (if needed):
   - If you don't have Microsoft Edge WebView2, it will be installed automatically
   - This is a one-time process
   - Takes 1-2 minutes
   - Requires internet connection

4. **Welcome Screen**:
   - Application opens to the invoice form
   - No login required
   - Start creating invoices immediately

---

## 🛠️ Troubleshooting

### Issue: "WebView2 Not Found"

**Solution**: Install Microsoft Edge WebView2 Runtime manually:
- Download: https://go.microsoft.com/fwlink/p/?LinkId=2124703
- Install and restart the application

### Issue: Application Won't Launch

**Check**:
1. Windows 10 version 1809 or later
2. 64-bit Windows (x64)
3. At least 200MB RAM available
4. Display resolution 480px minimum width

**Solution**:
- Right-click application → Properties → Compatibility
- Try "Run as Administrator"
- Check Windows Event Viewer for error details

### Issue: Installer Blocked by Antivirus

Some antivirus software may flag new applications.

**Solution**:
1. Add exception for the installer file
2. Temporarily disable antivirus
3. Install application
4. Re-enable antivirus
5. Add application folder to exceptions

Common false-positive locations:
- `C:\Program Files\Apex Solar Invoice Generator\`
- `%APPDATA%\com.apexsolar.invoicegenerator\`

### Issue: "Publisher: Unknown" Warning Won't Go Away

**This is expected** for v1.0.0. We're working on obtaining a code signing certificate.

**Workaround**:
- Follow the "More info" → "Run anyway" process
- This is a one-time warning per installer

**Future versions** (v1.1.0+) will be code-signed and won't show this warning.

---

## 🔒 Security & Privacy

### Your Data is Safe

- ✅ **Open Source**: All code visible on GitHub
- ✅ **Offline Operation**: No internet connection required
- ✅ **Local Storage**: All data stored on your computer only
- ✅ **No Tracking**: Zero analytics, telemetry, or phone-home
- ✅ **No Accounts**: No login, no cloud, no registration

### Data Location

All your data is stored locally:
```
C:\Users\YourName\AppData\Roaming\com.apexsolar.invoicegenerator\
├── invoices.json          # All invoice records
├── customers.json         # Customer information
├── company_settings.json  # Bank and GST settings
├── draft_invoice.json     # Auto-saved draft
├── company_logo.txt       # Your logo (Base64)
└── stamp_signature.txt    # Stamp & signature (Base64)
```

### Backup Your Data

To backup your invoices:
1. Press `Win + R`
2. Type: `%APPDATA%\com.apexsolar.invoicegenerator`
3. Press Enter
4. Copy all `.json` and `.txt` files to backup location

---

## 🗑️ Uninstallation

### MSI Installation:
1. Open Windows Settings
2. Apps → Installed apps
3. Find "Apex Solar Invoice Generator"
4. Click → Uninstall

### NSIS Installation:
1. Start Menu → "Apex Solar Invoice Generator"
2. Right-click → Uninstall
3. Or use Windows Settings → Apps → Uninstall

### Manual Cleanup (Optional):
Remove data files if desired:
1. Press `Win + R`
2. Type: `%APPDATA%`
3. Delete folder: `com.apexsolar.invoicegenerator`

---

## 💡 Tips

- **Portable Use**: Install on a USB drive for portability
- **Multiple Devices**: Copy the AppData folder to sync data
- **Backup**: Regularly backup your JSON files
- **Updates**: Check GitHub for new releases

---

## 📞 Support

- **GitHub Issues**: https://github.com/ArindamTripathi619/InvoiceGeneratorDesktop/issues
- **Documentation**: See README.md and USER_GUIDE.md
- **Source Code**: https://github.com/ArindamTripathi619/InvoiceGeneratorDesktop

---

## 🎉 Ready to Go!

Once installed, you can:
- Create professional invoices instantly
- Manage customer database
- Track invoice history
- Customize company settings
- Export PDFs with your branding

**Enjoy your new invoice generator!** 🚀
