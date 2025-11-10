# Windows Setup Guide for Apex Solar Invoice Generator

This guide provides detailed, step-by-step instructions for setting up the development environment and building the Apex Solar Invoice Generator desktop application on Windows.

## 📋 Table of Contents

1. [Prerequisites Installation](#prerequisites-installation)
2. [Project Setup](#project-setup)
3. [Development](#development)
4. [Building](#building)
5. [Troubleshooting](#troubleshooting)

---

## 1. Prerequisites Installation

### Step 1.1: Install Node.js

1. Visit https://nodejs.org/
2. Download the **LTS** version (recommended for most users)
3. Run the installer (.msi file)
4. Follow the installation wizard:
   - Accept the license agreement
   - Choose installation location (default is fine)
   - **Important**: Check "Automatically install necessary tools" option
5. Click "Install" and wait for completion
6. Restart your computer

**Verify Installation:**
Open PowerShell or Command Prompt and run:
```powershell
node --version
npm --version
```
Should show versions like `v20.x.x` and `10.x.x`

### Step 1.2: Install Rust

1. Visit https://www.rust-lang.org/tools/install
2. Download `rustup-init.exe` for Windows
3. Run the installer
4. In the terminal window that appears, press `1` and Enter to proceed with default installation
5. Wait for installation to complete (5-10 minutes)
6. Close and reopen your terminal/PowerShell

**Verify Installation:**
```powershell
rustc --version
cargo --version
```
Should show versions like `rustc 1.75.x` and `cargo 1.75.x`

### Step 1.3: Install Visual Studio Build Tools

**Option A: Visual Studio Build Tools (Smaller download)**

1. Visit https://visualstudio.microsoft.com/visual-cpp-build-tools/
2. Download "Build Tools for Visual Studio 2022"
3. Run the installer
4. In the Workloads tab, select:
   - ✅ Desktop development with C++
5. Click "Install" (this will download ~6GB)
6. Wait for installation (may take 30-60 minutes)
7. Restart your computer

**Option B: Full Visual Studio Community (If you want an IDE)**

1. Visit https://visualstudio.microsoft.com/vs/community/
2. Download Visual Studio Community 2022
3. Run the installer
4. Select "Desktop development with C++" workload
5. Install and restart

### Step 1.4: Verify WebView2

Windows 10/11 usually has WebView2 pre-installed. To verify:

1. Open PowerShell as Administrator
2. Run:
```powershell
Get-AppxPackage -Name Microsoft.WebView2
```

If not installed, download from:
https://developer.microsoft.com/en-us/microsoft-edge/webview2/

---

## 2. Project Setup

### Step 2.1: Open Project in Terminal

**Using Command Prompt:**
```cmd
cd C:\Users\YourUsername\Desktop\InvoiceGeneratorDesktop
```

**Using PowerShell:**
```powershell
cd C:\Users\YourUsername\Desktop\InvoiceGeneratorDesktop
```

**Using VS Code (Recommended):**
1. Open VS Code
2. File → Open Folder
3. Select InvoiceGeneratorDesktop folder
4. Open integrated terminal: `Ctrl + `` (backtick)

### Step 2.2: Install Node Dependencies

```bash
npm install
```

**What this does:**
- Downloads all JavaScript/TypeScript packages
- Creates `node_modules` folder
- May take 2-5 minutes depending on internet speed

**Expected output:**
```
added 324 packages, and audited 325 packages in 2m
```

### Step 2.3: Build Rust Dependencies (First Time)

```bash
cd src-tauri
cargo fetch
cd ..
```

**What this does:**
- Downloads Rust dependencies
- Takes 3-5 minutes on first run
- Creates `Cargo.lock` file

---

## 3. Development

### Step 3.1: Start Development Server

```bash
npm run tauri:dev
```

**What happens:**
1. Vite starts frontend dev server on http://localhost:1420
2. Rust compiles (first time takes 5-10 minutes)
3. Application window opens
4. Console shows logs

**First Run:**
```
   Compiling tauri v1.5.9
   Compiling invoice-generator-desktop v1.0.0
    Finished dev [unoptimized + debuginfo] target(s) in 8m 23s
```

**Subsequent Runs:**
```
    Finished dev [unoptimized + debuginfo] target(s) in 2.3s
```

### Step 3.2: Using Dev Tools

**Open DevTools:**
- Press `Ctrl + Shift + I`
- Or right-click anywhere → "Inspect Element"

**Console Logs:**
- Frontend logs appear in browser DevTools console
- Rust logs appear in your terminal

### Step 3.3: Making Changes

**Frontend (React/TypeScript):**
- Edit files in `src/` folder
- Changes appear instantly (hot reload)
- Example: Edit `src/App.tsx`

**Backend (Rust):**
- Edit files in `src-tauri/src/` folder
- Requires compilation (automatic)
- App restarts after compilation

**Stop Development Server:**
- Press `Ctrl + C` in terminal
- Or close the application window

---

## 4. Building for Production

### Step 4.1: Create Release Build

```bash
npm run tauri:build
```

**Build Process:**
1. **Frontend Build** (1-2 minutes)
   - Vite creates optimized React bundle
   - Minifies JavaScript and CSS
   - Outputs to `dist/` folder

2. **Rust Compilation** (5-15 minutes first time)
   - Compiles in release mode with optimizations
   - Creates smaller, faster executable

3. **Bundling** (2-3 minutes)
   - Creates Windows installer (.msi)
   - Creates NSIS installer (.exe)
   - Bundles WebView2 runtime

**Total Time:**
- First build: 15-20 minutes
- Subsequent builds: 8-12 minutes

### Step 4.2: Locate Installers

After successful build:

```
src-tauri/target/release/bundle/
├── msi/
│   └── Apex Solar Invoice Generator_1.0.0_x64_en-US.msi  (Windows Installer)
└── nsis/
    └── Apex Solar Invoice Generator_1.0.0_x64-setup.exe  (NSIS Installer)
```

**File Sizes (Approximate):**
- .msi: ~12-15 MB
- .exe: ~10-12 MB

### Step 4.3: Test the Installer

1. Close any running instances of the app
2. Navigate to the bundle folder
3. Double-click the `.msi` or `.exe` file
4. Follow installation wizard
5. App appears in Start Menu

**Installation Location:**
```
C:\Program Files\Apex Solar Invoice Generator\
```

**App Data Location:**
```
C:\Users\YourUsername\AppData\Roaming\com.apexsolar.invoicegenerator\
```

---

## 5. Troubleshooting

### Problem: "npm install" fails

**Error:** `EPERM: operation not permitted`

**Solutions:**
1. Close VS Code and any terminals
2. Run PowerShell as Administrator
3. Navigate to project folder
4. Run `npm install` again

**Error:** `Network timeout`

**Solutions:**
1. Check internet connection
2. Try different network (not behind strict firewall)
3. Use npm mirror:
   ```bash
   npm config set registry https://registry.npmjs.org/
   npm install
   ```

### Problem: Rust compilation fails

**Error:** `link.exe not found`

**Cause:** Visual Studio Build Tools not installed or not found

**Solution:**
1. Reinstall Visual Studio Build Tools
2. Ensure "Desktop development with C++" is selected
3. Add to PATH (usually automatic):
   ```
   C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC\[version]\bin\Hostx64\x64
   ```

**Error:** `rustc not found`

**Solution:**
1. Reinstall Rust using rustup
2. Add to PATH manually:
   ```
   C:\Users\YourUsername\.cargo\bin
   ```
3. Restart terminal/computer

### Problem: "tauri:dev" opens blank window

**Symptoms:**
- Window opens but shows blank screen
- Console shows errors

**Solutions:**

1. **Clear cache:**
   ```bash
   npm run build
   rm -rf dist
   npm run tauri:dev
   ```

2. **Check Vite server:**
   - Should start on http://localhost:1420
   - Open in browser to verify

3. **Check firewall:**
   - Windows Firewall might block localhost
   - Add exception for Node.js and Rust

### Problem: Build succeeds but app won't install

**Error:** "This app can't run on your PC"

**Solution:**
- You built for wrong architecture
- Rebuild:
  ```bash
  npm run tauri:build
  ```

**Error:** "Windows protected your PC"

**Solution:**
- Click "More info" → "Run anyway"
- This appears for unsigned apps
- To sign: Need code signing certificate (costs money)

### Problem: App crashes on startup

**Check Event Viewer:**
1. Open Start Menu
2. Search "Event Viewer"
3. Windows Logs → Application
4. Look for errors from your app

**Common Causes:**
1. **Missing WebView2**: Install WebView2 runtime
2. **Corrupted data**: Delete AppData folder and restart
3. **Permissions**: Run as administrator once

### Problem: Cannot save files / PDFs

**Error:** "Permission denied"

**Solutions:**
1. Check AppData folder permissions:
   ```
   C:\Users\YourUsername\AppData\Roaming\com.apexsolar.invoicegenerator\
   ```
2. Right-click folder → Properties → Security → Edit
3. Give your user account Full Control

**Error:** "Path not found"

**Solution:**
- Create folders manually if missing:
  ```powershell
  mkdir "C:\Users\$env:USERNAME\AppData\Roaming\com.apexsolar.invoicegenerator"
  mkdir "C:\Users\$env:USERNAME\AppData\Roaming\com.apexsolar.invoicegenerator\generated"
  ```

### Problem: Development is slow

**Symptoms:**
- Rust recompiles frequently
- Hot reload takes long

**Solutions:**

1. **Exclude from antivirus:**
   - Add project folder to Windows Defender exclusions
   - Add `src-tauri/target` to exclusions

2. **Use SSD:**
   - Move project to SSD if on HDD

3. **Increase swap file:**
   - System → Advanced → Performance Settings
   - Increase virtual memory

---

## 📝 Quick Reference Commands

### Development
```bash
npm run tauri:dev          # Start development server
npm run dev                # Start frontend only
npm run build              # Build frontend only
```

### Production
```bash
npm run tauri:build        # Create production build
npm run tauri:build:debug  # Create debug build (faster)
```

### Maintenance
```bash
npm install                # Install/update dependencies
npm run lint               # Check for code issues
cargo clean                # Clean Rust build artifacts
rm -rf node_modules        # Clean node dependencies
```

---

## 🎓 Learning Resources

### Tauri
- Official Docs: https://tauri.app/v1/guides/
- Discord: https://discord.gg/tauri
- GitHub: https://github.com/tauri-apps/tauri

### React
- Official Docs: https://react.dev/
- Tutorial: https://react.dev/learn

### Rust
- The Rust Book: https://doc.rust-lang.org/book/
- Rust by Example: https://doc.rust-lang.org/rust-by-example/

---

## 💡 Best Practices

1. **Always test after changes**: Run in dev mode before building
2. **Backup data regularly**: Copy AppData folder
3. **Version control**: Use Git to track changes
4. **Test on clean Windows**: Test installer on fresh Windows installation
5. **Keep dependencies updated**: Run `npm update` periodically
6. **Document changes**: Update README when modifying code

---

## 🚀 Next Steps

After successful setup:

1. ✅ Run development server and explore the app
2. ✅ Make a test build to ensure everything works
3. ✅ Test the installer on your machine
4. ✅ Configure company branding in Settings
5. ✅ Create a test invoice
6. ✅ Deploy to production machines

---

**Need help?** Double-check each step above. Most issues come from:
- Missing or incorrectly installed prerequisites
- Antivirus/firewall blocking compilation
- Insufficient permissions
- Outdated Node.js or Rust

Good luck! 🎉
