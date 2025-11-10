# Quick Start Guide - Windows Development

## ✅ Setup Complete!

All prerequisites for Tauri development on Windows are installed and ready.

### Installed Components:

| Component | Version | Status |
|-----------|---------|--------|
| **Node.js** | v24.11.0 | ✅ Installed |
| **npm** | v11.6.1 | ✅ Installed |
| **Rust** | v1.91.0 | ✅ Installed |
| **Cargo** | v1.91.0 | ✅ Installed |
| **Visual Studio Build Tools** | 2022 | ✅ Installed |
| **WebView2** | Latest | ✅ Installed |
| **npm packages** | 379 packages | ✅ Installed |
| **Rust dependencies** | 415 crates | ✅ Downloaded |

---

## 🚀 Start Development

### Option 1: Full Tauri Development Server

```powershell
npm run tauri:dev
```

**What this does:**
- Starts Vite dev server (React frontend)
- Compiles Rust backend (first time: 5-10 minutes)
- Opens native Windows application
- Enables hot-reload for both frontend and backend

**First run:** Expect 5-10 minutes for initial Rust compilation. Subsequent runs will be much faster (2-3 seconds).

### Option 2: Frontend Only (Faster)

```powershell
npm run dev
```

**What this does:**
- Starts Vite dev server only
- Opens in your web browser at http://localhost:5173
- Fast hot-reload for React development
- **Note:** Tauri APIs won't work in browser

---

## 📦 Build Production App

```powershell
npm run tauri:build
```

**Build time:** 10-15 minutes (first time)

**Output location:**
```
src-tauri/target/release/bundle/
├── msi/
│   └── Apex Solar Invoice Generator_1.0.0_x64_en-US.msi
└── nsis/
    └── Apex Solar Invoice Generator_1.0.0_x64-setup.exe
```

---

## 🔧 Common Commands

```powershell
# Install/update npm dependencies
npm install

# Start development with Tauri
npm run tauri:dev

# Start frontend only
npm run dev

# Build production app
npm run tauri:build

# Build debug version (faster)
npm run tauri:build:debug

# Run linter
npm run lint

# Build frontend only
npm run build

# Check for security issues
npm audit
```

---

## 📁 Project Structure

```
InvoiceGeneratorDesktop/
├── src/                    # React frontend
│   ├── components/         # React components
│   ├── services/           # PDF generation, etc.
│   ├── types/              # TypeScript types
│   ├── utils/              # Helper functions
│   ├── App.tsx             # Main app
│   └── main.tsx            # Entry point
├── src-tauri/              # Rust backend
│   ├── src/
│   │   └── main.rs         # Rust entry point
│   ├── Cargo.toml          # Rust dependencies
│   └── tauri.conf.json     # Tauri config
├── public/                 # Static assets
└── package.json            # npm dependencies
```

---

## 💡 Development Tips

### Performance Optimization

Add these folders to Windows Defender exclusions for faster builds:

1. Open Windows Security → Virus & threat protection → Manage settings
2. Click "Add or remove exclusions"
3. Add these folders:
   - `C:\Projects\Programming\Web\InvoiceGeneratorDesktop\node_modules`
   - `C:\Projects\Programming\Web\InvoiceGeneratorDesktop\src-tauri\target`
   - `C:\Users\arind\.cargo`

### Hot Reload

- **Frontend changes** (`.tsx`, `.ts`, `.css`): Instant reload
- **Rust changes** (`.rs`, `Cargo.toml`): Requires recompilation (~5-30s)
- **Config changes** (`tauri.conf.json`): Restart dev server

### DevTools

Press `Ctrl+Shift+I` in the app to open Chrome DevTools for debugging frontend.

---

## 🐛 Troubleshooting

### "npm install" slow or failing
Already fixed! npm packages are installed natively on Windows.

### Rust compilation errors
- Ensure Visual Studio Build Tools are installed with C++ components
- Restart terminal after installing Rust
- Run: `rustc --version` to verify

### App won't start
- Check if WebView2 is installed
- Try running as administrator once
- Check Windows Event Viewer for errors

### Changes not showing
- Clear browser cache (Ctrl+Shift+R)
- Restart dev server
- Delete `src-tauri/target` and rebuild

---

## 📊 Development Workflow

### Making Changes

1. **Edit frontend code** in `src/` folder
   - Changes appear instantly
   - Use browser DevTools for debugging

2. **Edit backend code** in `src-tauri/src/` folder
   - Automatic recompilation
   - App restarts after build

3. **Test your changes**
   - Use DevTools console for frontend logs
   - Check terminal for Rust logs

4. **Build for testing**
   ```powershell
   npm run tauri:build:debug
   ```

5. **Build for production**
   ```powershell
   npm run tauri:build
   ```

---

## 🎯 Next Steps

1. **Start development server:**
   ```powershell
   npm run tauri:dev
   ```
   
2. **Wait for first compilation** (5-10 minutes)

3. **Start coding!** The app will open automatically

4. **Check out the existing features:**
   - Invoice creation
   - Customer management
   - Invoice history
   - Settings & branding

---

## 📚 Resources

- **Tauri Docs:** https://tauri.app/v1/guides/
- **React Docs:** https://react.dev/
- **Rust Book:** https://doc.rust-lang.org/book/
- **Vite Docs:** https://vitejs.dev/

---

**Last Updated:** 2025-11-10  
**Status:** ✅ Ready for development!
