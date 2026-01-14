# Apex Solar Invoice Generator - Desktop Application

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/ArindamTripathi619/InvoiceGeneratorDesktop/releases)
[![Platform](https://img.shields.io/badge/platform-Windows-0078D6.svg)](https://www.microsoft.com/windows)
[![Tauri](https://img.shields.io/badge/Tauri-1.5-FFC131.svg)](https://tauri.app/)

A professional Windows desktop application for generating and managing GST-compliant invoices for Apex Solar. Built with Tauri, React, TypeScript, and SQLite.

## 🎉 Latest Updates (v1.1.0)
- **⚡ SQLite Migration**: Now using SQLite for robust, ACID-compliant data storage.
- **☁️ Disaster Recovery**: One-time setup Google Drive recovery link to restore your data anytime.
- **🔄 Local Sync Strategy**: Automatic backup to your synced cloud folders (Drive, OneDrive).
- **🇮🇳 Indian Localization**: Dates now fully localized to **DD-MM-YYYY** format.
- **🔒 Hardened Security**: Strict CSP and FileSystem scopes to protect your data.

## 🚀 Key Features
- ✨ **Modern UI** - Clean, professional interface with Dark/Light theme support.
- 💾 **Local Persistence** - SQLite database for high reliability and scale.
- 🔄 **Auto-Backup** - Set a backup folder once, and the app exports your data on every change.
- 🇮🇳 **GST Ready** - Automatic CGST/SGST calculations and Amount-to-Words (Indian numbering).
- 📄 **PDF Generation** - High-quality, brand-accurate invoice PDFs.
- 👥 **Customer Management** - Persistent database of your habitual customers.

## 📦 Installation & Setup

### For Users (Download)
1. Download the latest `.msi` or `.exe` from [Releases](https://github.com/ArindamTripathi619/InvoiceGeneratorDesktop/releases).
2. **Windows Protection**: Since the app is newly published, Windows may show a protection warning. Click **More Info** → **Run Anyway**.
3. Follow the installation wizard.

### For Developers (Build from Source)
**Prerequisites**: Node.js (v18+), Rust (latest stable), Visual Studio C++ Build Tools.

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Run Development Mode**:
   ```bash
   npm run tauri dev
   ```
3. **Build Installer**:
   ```bash
   npm run tauri build
   ```

## 💾 Data & Backup Location
Your data (SQLite DB, Logos, Signatures) is stored locally at:
`%APPDATA%/com.apexsolar.invoicegenerator/`

### To Backup:
1. Go to **Settings**.
2. Select your **Google Drive** or **OneDrive** folder.
3. Enable **Auto-Backup**. The app will now keep your cloud folder updated automatically.

## 🛠 Project Structure
- `src/`: React frontend with localized components.
- `src-tauri/`: Rust backend, SQLite schema, and filesystem commands.
- `docs/`: Historical documentation and design assets.

## 🔒 Security
- **Strict CSP**: Prevents XSS and unauthorized script execution.
- **Scoped FS**: The app can only access its own data and user-selected folders.
- **Privacy**: No telemetry, no cloud accounts, no tracking. Your data is yours.

---
**Built with ❤️ for Apex Solar**
copyright © 2026 Apex Solar. All rights reserved.
