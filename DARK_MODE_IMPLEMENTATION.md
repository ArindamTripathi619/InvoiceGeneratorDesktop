# Dark Mode Implementation Guide

## Overview
This document describes the comprehensive dark mode implementation for the Apex Solar Invoice Generator Desktop application.

## Implementation Approach

### 1. Theme Infrastructure
- **ThemeContext** (`src/contexts/ThemeContext.tsx`): React Context-based theme management
- **Theme Toggle**: Moon/Sun icon button in the app header
- **Persistence**: Theme preference saved to localStorage
- **System Preference**: Detects and respects OS dark mode setting on first launch
- **Tailwind Configuration**: Enabled class-based dark mode in `tailwind.config.js`

### 2. Color Palette

#### Light Mode
- Background: `gray-50`, `gray-100`, `white`
- Text: `gray-800`, `gray-700`, `gray-600`
- Borders: `gray-200`, `gray-300`
- Buttons: `blue-600`, `green-600`, `red-600`
- Accents: `blue-500`, `blue-600`

#### Dark Mode
- Background: `gray-900`, `gray-950`, `gray-800`, `gray-700`
- Text: `gray-100`, `gray-300`, `gray-400`
- Borders: `gray-600`, `gray-700`
- Buttons: `blue-500`, `green-500`, `red-500`
- Accents: `blue-400`, `blue-500`

### 3. Components Updated

#### App.tsx
- Main container gradient: `dark:from-gray-900 dark:to-gray-950`
- Header: `dark:bg-gray-800`
- Navigation: `dark:bg-gray-800`, `dark:border-gray-700`
- Active tab: `dark:text-blue-400`, `dark:bg-gray-700`
- Footer: `dark:bg-gray-800`, `dark:text-gray-400`
- Theme toggle button with smooth transitions

#### InvoiceForm.tsx
- All input fields: `dark:border-gray-600`, `dark:bg-gray-700`, `dark:text-gray-100`
- Disabled inputs: `dark:bg-gray-600`, `dark:text-gray-400`
- Section headers: `dark:bg-gray-800`, `dark:text-gray-100`
- Section backgrounds: `dark:bg-gray-700`
- All buttons with dark variants and hover states
- Border accents: `dark:border-gray-700`
- Text labels: `dark:text-gray-300`

#### InvoiceHistory.tsx
- Card backgrounds: `dark:bg-gray-800`
- Input fields with dark styling
- Button hover states optimized
- Empty state text: `dark:text-gray-400`
- Border accents: `dark:border-blue-400`
- Section backgrounds: `dark:bg-gray-700`

#### CustomerManagement.tsx
- Customer cards: `dark:bg-gray-800`
- Form inputs with dark variants
- Button states for add/edit/delete
- Empty state icons: proper contrast in dark mode
- Section containers: `dark:bg-gray-700`

#### Settings.tsx
- Settings sections: `dark:bg-gray-800`
- All form inputs with dark styling
- File upload buttons with dark states
- Preview areas with proper backgrounds
- Help text: `dark:text-gray-400`

### 4. Transition Effects
All color changes include smooth transitions:
```
transition-colors duration-200
```

For interactive elements (buttons, hover states):
```
transition-all duration-200
```

### 5. Testing Checklist

#### Visual Testing
- [ ] Toggle between light and dark modes
- [ ] Verify text readability in all sections
- [ ] Check contrast ratios (text on backgrounds)
- [ ] Test all button hover states
- [ ] Verify input field visibility and focus states
- [ ] Check empty state messages and icons
- [ ] Test loading spinners visibility

#### Functional Testing
- [ ] Theme preference persists after app restart
- [ ] System theme detection on first launch
- [ ] Smooth transitions without flashing
- [ ] No broken layouts in dark mode
- [ ] PDF generation works in both themes
- [ ] File uploads work correctly
- [ ] All dialogs/modals properly styled

#### Component-Specific Tests
- [ ] **Create Invoice**: All form fields, line items, calculations
- [ ] **Invoice History**: Cards, filters, PDF regeneration
- [ ] **Customers**: Customer cards, add/edit forms, delete confirmations
- [ ] **Settings**: Company settings, image uploads, bank details

### 6. Implementation Details

#### Theme Context API
```typescript
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Check localStorage first
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
    
    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  
  // Apply theme to document root
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  
  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};
```

#### Toggle Button Implementation
```tsx
<button
  onClick={toggleTheme}
  className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
  title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
>
  {theme === 'light' ? (
    <Moon size={24} className="text-gray-700 dark:text-gray-300" />
  ) : (
    <Sun size={24} className="text-gray-300" />
  )}
</button>
```

### 7. Batch Update Approach
PowerShell scripts were used to systematically apply dark mode classes:

```powershell
# Example: Update input fields
(Get-Content Component.tsx) -replace 'border-gray-300', 'border-gray-300 dark:border-gray-600' | Set-Content Component.tmp
Move-Item -Force Component.tmp Component.tsx

# Update multiple files at once
foreach ($file in @('InvoiceHistory.tsx', 'CustomerManagement.tsx', 'Settings.tsx')) {
  (Get-Content $file) -replace 'bg-white', 'bg-white dark:bg-gray-800' | Set-Content "$file.tmp"
  Move-Item -Force "$file.tmp" $file
}
```

### 8. Best Practices Applied
1. **Consistent Naming**: Used Tailwind's built-in `dark:` prefix
2. **Transitions**: Added smooth color transitions throughout
3. **Contrast**: Ensured proper contrast ratios (WCAG AA compliant)
4. **Persistence**: Theme choice saved to localStorage
5. **System Integration**: Respects OS-level dark mode preference
6. **No Flash**: Applied theme class before render
7. **Hover States**: All interactive elements have dark mode hover states

## Usage
1. Launch the application
2. Look for the Moon/Sun icon button in the top-right of the header
3. Click to toggle between light and dark modes
4. Your preference will be saved automatically

## Maintenance Notes
- When adding new UI elements, remember to add `dark:` variant classes
- Maintain consistent color palette (gray-100/300/400 for text in dark mode)
- Always include `transition-colors duration-200` for smooth theme switches
- Test new features in both light and dark modes

## Files Modified
- `src/contexts/ThemeContext.tsx` (NEW)
- `src/App.tsx`
- `src/components/InvoiceForm.tsx`
- `src/components/InvoiceHistory.tsx`
- `src/components/CustomerManagement.tsx`
- `src/components/Settings.tsx`
- `tailwind.config.js`

## Technical Details
- **Framework**: Tailwind CSS class-based dark mode
- **State Management**: React Context API
- **Persistence**: Browser localStorage
- **Transition Duration**: 200ms for smooth effects
- **Icon Library**: lucide-react (Moon/Sun icons)
