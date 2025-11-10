# Troubleshooting Guide - Windows Development

## Issue Resolved: npm Install Performance

### **Problem**
Package installation was extremely slow or hanging when attempted via WSL or Docker.

### **Root Cause**
Node.js was not installed on native Windows. Attempts to install via WSL accessing Windows filesystem (`/mnt/c/`) or Docker resulted in severe I/O performance issues.

### **Solution** ✅
Installed Node.js v24.11.0 LTS directly on Windows using:
```powershell
winget install OpenJS.NodeJS.LTS
```

**Result:** npm install completed in **37 seconds** with all 379 packages installed successfully.

## Windows Development Setup

For Tauri development on Windows, you need:

1. **Node.js** - ✅ Already installed (v24.11.0)
2. **Rust** - Required for Tauri
3. **Visual Studio Build Tools** - Required for Rust compilation

## Current Status

✅ **Node.js installed** - v24.11.0 LTS
✅ **npm packages installed** - All 379 packages (37 seconds)
✅ **Ready for development** - Frontend is ready to run

## Next Steps for Full Tauri Development

### 1. Install Rust

```powershell
winget install Rustlang.Rustup
```

After installation, close and reopen your terminal.

**Verify:**
```powershell
rustc --version
cargo --version
```

### 2. Install Visual Studio Build Tools

**Option A: Build Tools Only (Recommended)**
- Download: https://visualstudio.microsoft.com/visual-cpp-build-tools/
- Select: "Desktop development with C++"
- Size: ~6GB

**Option B: Full Visual Studio Community**
- Download: https://visualstudio.microsoft.com/vs/community/
- Select: "Desktop development with C++" workload

### 3. Start Development

**Full Tauri app:**
```powershell
npm run tauri:dev
```

**Frontend only (no Tauri):**
```powershell
npm run dev
```

## Verify Installation

```powershell
node --version       # Should show v24.11.0
npm --version        # Should show 10.x.x
npm list --depth=0   # Should list all packages
```

## Performance Tips

- **Windows Defender:** Add exclusions for `node_modules` and `src-tauri\target` folders to improve build speeds
- **Antivirus:** Temporarily disable during Rust compilation if builds are very slow
- **Corporate Networks:** If behind a proxy, configure npm: `npm config set proxy http://proxy:port`

## Common Commands

```powershell
# Install dependencies
npm install

# Start Tauri development
npm run tauri:dev

# Start frontend only
npm run dev

# Build for production
npm run tauri:build

# Check for issues
npm audit

# Update dependencies
npm update
```

---

**Last Updated:** 2025-11-10
**Status:** ✅ All installation issues resolved
