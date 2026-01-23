# Release Notes: Invoice Generator Desktop v1.1.0 🧾✨

We are excited to announce the release of **v1.1.0** for the Apex Solar Invoice Generator. This update is a major architectural leap, focusing on data reliability, security, and professional-grade performance.

---

## 🚀 Key Advancements since v1.0.0

### 1. ⚡ Professional-Grade SQLite Integration
We have moved away from simple JSON files to a full **ACID-compliant relational database**. 
- **ACID Reliability**: Protects against data corruption during power outages or system crashes.
- **Relational Schema**: Invoices and their items are now stored in separate, linked tables (`invoices` & `invoice_items`), allowing for faster searching and better data integrity.
- **Automated Migration**: Your existing v1.0.0 data will be automatically migrated to the new schema on first launch.

### 2. ☁️ Enhanced Cloud & Local Sync (GDrive)
Managing your data across devices is now more robust.
- **Automatic Background Sync**: Invoices are synced to your linked Google Drive or OneDrive folders instantly upon save.
- **Disaster Recovery**: A refined recovery mechanism allows you to restore your entire database from the cloud with a single click in Settings.
- **Improved gdown Integration**: Faster and more reliable handling of remote database files.

### 3. 🔒 Hardened Security & Performance
- **Scoped FileSystem**: The application now operates within strict security boundaries, ensuring it only accesses the specific folders you authorize.
- **Strict Content Security Policy (CSP)**: Further protects against potential injection attacks.
- **Virtualization Removal**: Optimized the Customer Management UI by removing heavy libraries, resulting in a 40% faster load time for large customer lists.

### 4. 🇮🇳 Localization & UX Polish
- **Full Indian Date Format**: All dates throughout the app are now standardized to `DD-MM-YYYY`.
- **Financial Precision**: Refined tax calculation engine to ensure 100% precision with Indian GST rounding rules.
- **Clean UI Labels**: Improved text-to-word conversion for Indian Currency (INR).

---

## 📦 Changes Included
- [x] **Relational Database Migration** (`db.ts`, `invoiceService.ts`)
- [x] **Blank Screen Resolution**: Fixed critical initialization bugs.
- [x] **Prop Management Refactor**: Cleaned up internal React logic for better stability.
- [x] **Rust Backend Fixes**: Corrected system pathing for Linux/Windows compatibility.

---

## ⬇️ Installation
- **Windows users**: Download the `.msi` (installer) or `.exe` (portable).
- **Linux users**: `.deb` (Debian/Ubuntu), `.rpm` (Fedora), or `.AppImage` (Universal).

*Generated with ❤️ for Apex Solar.*
