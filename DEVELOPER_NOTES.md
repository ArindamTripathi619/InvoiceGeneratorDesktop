# Developer Notes - Apex Solar Invoice Generator

Technical documentation for developers working on this project.

## 🏗️ Architecture Overview

### Technology Stack

**Frontend:**
- **React 18**: UI framework with hooks
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **jsPDF & jspdf-autotable**: PDF generation
- **Vite**: Build tool and dev server

**Backend:**
- **Rust**: Systems programming language
- **Tauri**: Desktop application framework
- **serde & serde_json**: JSON serialization

**Build & Dev Tools:**
- **npm**: Package manager
- **Cargo**: Rust package manager
- **TypeScript Compiler**: Type checking
- **ESLint**: Code linting

### Application Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend (Port 1420)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ InvoiceForm  │  │   History    │  │  Customers   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │               │
│         └──────────────────┴──────────────────┘               │
│                            │                                   │
│                    ┌───────▼────────┐                         │
│                    │ tauriStorage.ts│                         │
│                    └───────┬────────┘                         │
└────────────────────────────┼──────────────────────────────────┘
                             │ Tauri API calls
                             │
┌────────────────────────────▼──────────────────────────────────┐
│                     Rust Backend (Tauri)                       │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  File System API (read/write JSON files)               │  │
│  └────────────────────────────────────────────────────────┘  │
│                            │                                   │
│  ┌─────────────────────────▼──────────────────────────────┐  │
│  │  AppData Directory                                      │  │
│  │  ~/AppData/Roaming/com.apexsolar.invoicegenerator/     │  │
│  │  - invoices.json                                        │  │
│  │  - customers.json                                       │  │
│  │  - company_settings.json                                │  │
│  │  - draft_invoice.json                                   │  │
│  │  - stamp_signature.txt                                  │  │
│  │  - company_logo.txt                                     │  │
│  │  - generated/ (PDF files)                               │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

## 📂 Directory Structure Deep Dive

### Frontend Structure (`src/`)

```
src/
├── components/         # React UI components
│   ├── InvoiceForm.tsx         # Main invoice creation (460 lines)
│   ├── InvoiceHistory.tsx      # List and regenerate invoices (170 lines)
│   ├── CustomerManagement.tsx  # CRUD for customers (220 lines)
│   └── Settings.tsx            # Company settings and uploads (260 lines)
│
├── services/           # Business logic layer
│   └── pdfGenerator.ts         # PDF creation (400+ lines)
│                               # ⚠️ CRITICAL: Do not modify without backup
│
├── types/              # TypeScript type definitions
│   ├── invoice.ts              # Main data types (Invoice, Customer, etc.)
│   └── jspdf-autotable.d.ts    # Type defs for jspdf-autotable
│
├── utils/              # Utility functions
│   ├── tauriStorage.ts         # Tauri filesystem wrapper (async functions)
│   └── numberToWords.ts        # Indian number system conversion
│
├── App.tsx             # Main app component with routing
├── main.tsx            # React DOM render entry point
├── index.css           # Global styles + Tailwind imports
└── vite-env.d.ts       # Vite environment types
```

### Backend Structure (`src-tauri/`)

```
src-tauri/
├── src/
│   └── main.rs         # Rust entry point
│                       # - Initializes Tauri
│                       # - Creates app directories
│                       # - Sets up Windows-specific configs
│
├── Cargo.toml          # Rust dependencies and features
│                       # - tauri = "1.5" with "api-all" features
│                       # - serde & serde_json for JSON
│
├── tauri.conf.json     # Tauri configuration
│                       # - Window settings
│                       # - Permissions (fs, dialog, path, shell)
│                       # - Bundle settings
│                       # - Build commands
│
└── build.rs            # Build script (runs before compilation)
```

## 🔧 Key Technical Decisions

### 1. Storage: Tauri FS API vs LocalStorage

**Web App (original):**
```javascript
localStorage.setItem('invoices', JSON.stringify(invoices));
```

**Desktop App (Tauri):**
```typescript
import { writeTextFile, BaseDirectory } from '@tauri-apps/api/fs';
await writeTextFile('invoices.json', JSON.stringify(invoices), { 
  dir: BaseDirectory.AppData 
});
```

**Why?**
- LocalStorage is browser-specific, not available in Tauri
- Tauri FS API provides true file system access
- Better for desktop apps (no size limits, proper file management)
- All functions are async (returns Promises)

### 2. PDF Generation: Client-Side

**Why client-side PDF generation?**
- No server needed (true desktop app)
- Works offline
- Fast generation
- User has full control

**Library Choice: jsPDF**
- Pure JavaScript, works in Tauri
- Extensive formatting options
- Good for invoice-style documents
- jspdf-autotable for complex tables

### 3. Async/Await Pattern

**All storage operations are async:**

```typescript
// ❌ Wrong (web app style)
const invoices = getAllInvoices();

// ✅ Correct (desktop app)
const invoices = await getAllInvoices();
```

**Why it matters:**
- Tauri IPC is asynchronous
- File I/O is inherently async
- Prevents UI blocking
- Better error handling

### 4. State Management: React Hooks

**No Redux or external state library because:**
- Small app with localized state
- Component-level state sufficient
- Props drilling minimal
- Easier to understand and maintain

### 5. TypeScript Strict Mode

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

**Benefits:**
- Catch errors at compile time
- Better IDE autocomplete
- Easier refactoring
- Self-documenting code

## 🎨 UI/UX Patterns

### Component Structure

```tsx
export default function ComponentName() {
  // 1. State declarations
  const [data, setData] = useState<Type>([]);
  
  // 2. Effect hooks
  useEffect(() => {
    loadData();
  }, []);
  
  // 3. Helper functions
  const loadData = async () => {
    // ...
  };
  
  // 4. Event handlers
  const handleClick = async () => {
    // ...
  };
  
  // 5. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Tailwind CSS Patterns

**Consistent spacing:**
- Padding: `p-4`, `p-6`
- Margin: `mb-4`, `mt-6`
- Gap: `gap-4`

**Color scheme:**
- Primary: `blue-600`, `blue-700`
- Success: `green-600`
- Danger: `red-600`
- Gray scale: `gray-50` to `gray-900`

**Responsive:**
- Always mobile-first
- Use `md:` prefix for desktop

## 🚀 Performance Optimizations

### 1. Tauri Build Optimizations

```toml
# Cargo.toml
[profile.release]
panic = "abort"          # No panic handling overhead
codegen-units = 1        # Better optimization
lto = true               # Link-time optimization
opt-level = "s"          # Optimize for size
strip = true             # Remove debug symbols
```

**Result:**
- Smaller binary size (~10MB vs ~20MB)
- Faster startup time
- Better runtime performance

### 2. Vite Production Build

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'chrome105',    // Modern browser features
    minify: 'esbuild',      // Fast minification
    sourcemap: false,       # No source maps in prod
  }
});
```

### 3. React Optimizations

```typescript
// Use useCallback for event handlers
const handleClick = useCallback(async () => {
  // ...
}, [dependencies]);

// Use useMemo for expensive computations
const totals = useMemo(() => calculateTotals(), [lineItems]);
```

## 🔐 Security Considerations

### 1. Tauri Permissions

```json
// tauri.conf.json
{
  "tauri": {
    "allowlist": {
      "all": false,  // ✅ Start with nothing allowed
      "fs": {
        "scope": ["$APPDATA/**"]  // ✅ Limit to app data only
      }
    }
  }
}
```

### 2. Input Validation

```typescript
// Always validate user input
if (!invoiceNumber.trim()) {
  return 'Please enter invoice number';
}

if (!/^\d+$/.test(invoiceNumber)) {
  return 'Only digits allowed';
}
```

### 3. Error Handling

```typescript
try {
  await generateInvoicePDF(invoice, settings);
} catch (error) {
  console.error('PDF generation failed:', error);
  await message('Error generating PDF', { 
    title: 'Error', 
    type: 'error' 
  });
}
```

## 🐛 Common Issues & Solutions

### Issue: Async Function Not Awaited

**Problem:**
```typescript
const loadCustomers = () => {
  const customers = getAllCustomers(); // ❌ Returns Promise, not data
  setCustomers(customers); // ❌ Sets Promise, not array
};
```

**Solution:**
```typescript
const loadCustomers = async () => {
  const customers = await getAllCustomers(); // ✅
  setCustomers(customers); // ✅
};
```

### Issue: React State Not Updating

**Problem:**
```typescript
setLineItems([...lineItems, newItem]);
// State might not update immediately
console.log(lineItems); // ❌ Shows old state
```

**Solution:**
```typescript
setLineItems(prev => [...prev, newItem]);
// Or use useEffect to react to changes
useEffect(() => {
  console.log('Line items changed:', lineItems);
}, [lineItems]);
```

### Issue: PDF Not Saving

**Problem:**
- Silent failure
- No error messages

**Debug:**
```typescript
try {
  console.log('Starting PDF generation...');
  const pdfBlob = doc.output('arraybuffer');
  console.log('PDF blob created:', pdfBlob.byteLength, 'bytes');
  
  await writeBinaryFile(path, new Uint8Array(pdfBlob));
  console.log('PDF saved successfully');
} catch (error) {
  console.error('Detailed error:', error);
}
```

## 📝 Coding Standards

### TypeScript

```typescript
// ✅ Explicit types for function parameters
function calculateTotal(items: LineItem[]): number {
  return items.reduce((sum, item) => sum + item.amount, 0);
}

// ✅ Interface for objects
interface InvoiceFormProps {
  onSubmit: (invoice: Invoice) => Promise<void>;
}

// ✅ Proper error types
catch (error: unknown) {
  console.error('Error:', error);
}
```

### React

```tsx
// ✅ Destructure props
function Component({ title, onClose }: Props) {
  // ...
}

// ✅ Early returns for conditional rendering
if (!data) {
  return <Loading />;
}

// ✅ Meaningful variable names
const isGenerating = false;  // ✅
const flag = false;  // ❌
```

### Async/Await

```typescript
// ✅ Always handle errors
try {
  const data = await fetchData();
  processData(data);
} catch (error) {
  handleError(error);
}

// ✅ Parallel async operations
const [invoices, customers, settings] = await Promise.all([
  getAllInvoices(),
  getAllCustomers(),
  getCompanySettings()
]);
```

## 🧪 Testing Recommendations

### Manual Testing Checklist

**Invoice Creation:**
- [ ] Create invoice with all fields
- [ ] Create invoice with minimal fields
- [ ] Add multiple line items
- [ ] Remove line items
- [ ] Test auto-calculations
- [ ] Generate PDF
- [ ] Verify PDF content

**Data Persistence:**
- [ ] Save draft
- [ ] Close and reopen app
- [ ] Verify draft loaded
- [ ] Create customer
- [ ] Close and reopen
- [ ] Verify customer exists

**Edge Cases:**
- [ ] Very long descriptions
- [ ] Special characters in names
- [ ] Large numbers (crores)
- [ ] Zero quantities
- [ ] Missing optional fields

### Unit Testing (Future)

**Suggested libraries:**
- Jest: Testing framework
- React Testing Library: Component tests
- MSW: API mocking

**Test files structure:**
```
src/
├── utils/
│   ├── numberToWords.ts
│   └── numberToWords.test.ts  // Unit tests
├── components/
│   ├── InvoiceForm.tsx
│   └── InvoiceForm.test.tsx   // Component tests
```

## 🔄 Future Enhancements

### Planned Features

1. **Database Migration**
   - Move from JSON files to SQLite
   - Better query performance
   - Relations between tables

2. **Export Options**
   - Export to Excel
   - Export to CSV
   - Batch PDF generation

3. **Templates**
   - Multiple invoice templates
   - Customizable layouts
   - Branding options

4. **Backup/Restore**
   - One-click backup
   - Cloud sync option
   - Import/export all data

5. **Reports**
   - Monthly revenue reports
   - Customer-wise reports
   - Tax summaries

### Technical Debt

1. **Error Handling**
   - Implement proper error boundaries
   - Better error messages
   - Retry mechanisms

2. **Validation**
   - Use Zod or Yup for validation
   - Form validation library
   - Client-side validation

3. **Code Organization**
   - Extract constants
   - Create reusable components
   - Centralize API calls

## 📚 Learning Resources

### Tauri
- [Tauri Guides](https://tauri.app/v1/guides/)
- [Tauri API Docs](https://tauri.app/v1/api/js/)
- [Tauri Patterns](https://tauri.app/v1/guides/features/)

### React + TypeScript
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

### Rust (for Tauri backend)
- [The Rust Book](https://doc.rust-lang.org/book/)
- [Rust by Example](https://doc.rust-lang.org/rust-by-example/)

## 🤝 Contributing Guidelines

1. **Before making changes:**
   - Test current functionality
   - Create backup of working code
   - Document your changes

2. **Code style:**
   - Follow existing patterns
   - Use TypeScript strict mode
   - Add comments for complex logic

3. **Testing:**
   - Test all affected features
   - Test on clean Windows installation
   - Verify PDF generation still works

4. **Git:**
   - Commit frequently
   - Write descriptive commit messages
   - Keep commits focused

## 🆘 Getting Help

**Check these first:**
1. Console errors (Ctrl+Shift+I)
2. Rust logs in terminal
3. This documentation
4. README.md
5. SETUP_GUIDE.md

**Still stuck?**
- Check Tauri Discord
- Search GitHub issues
- Stack Overflow with `[tauri]` tag

---

**Last Updated:** November 10, 2025
**Version:** 1.0.0
**Maintainer:** Apex Solar Development Team
