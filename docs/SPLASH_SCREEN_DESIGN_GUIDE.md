# Splash Screen Design Guide for Apex Solar Invoice Generator

## Overview
This document provides a comprehensive design specification for creating splash screens for the Apex Solar Invoice Generator Desktop application. The splash screen will be displayed during the initial app loading phase and should reflect the professional nature of the solar energy business while maintaining brand consistency.

---

## Design Specifications

### Canvas Dimensions
- **Width**: 1200px
- **Height**: 800px
- **Format**: PNG with transparency support (for shadows and overlays)
- **Export**: Two versions - `splash-light.png` and `splash-dark.png`

---

## Light Theme Design

### Background
**Base Layer:**
- **Color**: Linear gradient from top to bottom
  - Top: `#F9FAFB` (Very light gray - gray-50)
  - Bottom: `#F3F4F6` (Light gray - gray-100)
- **Alternative**: Subtle radial gradient
  - Center: `#FFFFFF` (Pure white)
  - Edges: `#F3F4F6` (Light gray)
  - Opacity: 100%

**Accent Layer (Optional):**
- Add subtle geometric shapes in the background
- Shapes: Large circles or hexagons (representing solar panels)
- Color: `#DBEAFE` (Light blue - blue-100)
- Opacity: 20-30%
- Position: Bottom-right and top-left corners, partially visible
- Size: 400-600px diameter
- Blur: Apply 40-60px Gaussian blur for softness

### Main Content Area (Centered)

**Logo Placement:**
- Position: Center-top, 200px from top edge
- Size: 180x180px (or maintain aspect ratio if different)
- Logo file: Use the company's logo.png
- Effects:
  - Drop shadow: 0px 4px 20px rgba(0, 0, 0, 0.08)
  - Subtle glow (optional): 0px 0px 40px rgba(59, 130, 246, 0.15)

**Company Name:**
- Text: "APEX SOLAR"
- Position: 40px below logo
- Font: Inter or similar modern sans-serif
- Font Weight: Bold (700)
- Font Size: 48px
- Color: `#1F2937` (Dark gray - gray-800)
- Letter Spacing: 2px (slightly expanded for premium feel)
- Effects:
  - Subtle text shadow: 0px 2px 4px rgba(0, 0, 0, 0.05)

**Tagline:**
- Text: "Invoice Generation System"
- Position: 16px below company name
- Font: Inter or similar
- Font Weight: Medium (500)
- Font Size: 18px
- Color: `#6B7280` (Medium gray - gray-500)
- Letter Spacing: 0.5px

**Decorative Elements:**
- **Sun Icon/Shape:**
  - Position: 30px to the left of logo
  - Size: 80x80px
  - Design: Stylized sun with rays (8-12 rays radiating outward)
  - Color: `#FBBF24` (Warm yellow - amber-400)
  - Opacity: 80%
  - Effect: Subtle rotation animation (optional, 360° in 20 seconds)
  
- **Solar Panel Pattern:**
  - Position: Bottom section of screen
  - Design: Abstract representation using rectangles/lines
  - Pattern: 3-4 tilted rectangles suggesting solar panel arrays
  - Color: `#3B82F6` (Blue - blue-500)
  - Opacity: 15%
  - Size: 300px wide, 120px tall
  - Position: Bottom-center, 80px from bottom

**Loading Indicator:**
- Position: 100px below tagline
- Type: Progress bar or animated dots
- Progress Bar Option:
  - Width: 300px
  - Height: 4px
  - Background: `#E5E7EB` (gray-200)
  - Fill Color: `#3B82F6` (blue-600)
  - Border Radius: 2px
  - Animation: Indeterminate sliding animation
- Alternative Dots:
  - 3 circles, 8px diameter each
  - Spacing: 12px between dots
  - Color: `#3B82F6` (blue-600)
  - Animation: Pulsing fade in/out sequentially

**Version Text:**
- Text: "v1.0.0" (use actual version from package.json)
- Position: Bottom-right corner, 24px from edges
- Font Size: 12px
- Font Weight: Regular (400)
- Color: `#9CA3AF` (gray-400)

**Footer Text:**
- Text: "Solar Power Plant Installation and Commissioning"
- Position: Bottom-center, 24px from bottom
- Font Size: 11px
- Font Weight: Regular (400)
- Color: `#9CA3AF` (gray-400)
- Letter Spacing: 0.3px

---

## Dark Theme Design

### Background
**Base Layer:**
- **Color**: Linear gradient from top to bottom
  - Top: `#111827` (Very dark gray - gray-900)
  - Bottom: `#030712` (Near black - gray-950)
- **Alternative**: Subtle radial gradient
  - Center: `#1F2937` (Dark gray - gray-800)
  - Edges: `#030712` (Near black)
  - Opacity: 100%

**Accent Layer:**
- Same geometric shapes as light theme
- Color: `#1E3A8A` (Dark blue - blue-900)
- Opacity: 25-35%
- Position: Same as light theme
- Size: Same as light theme
- Blur: Apply 40-60px Gaussian blur

### Main Content Area (Centered)

**Logo Placement:**
- Position: Same as light theme (Center-top, 200px from top)
- Size: 180x180px
- Logo file: Same logo.png (ensure logo works on dark background)
- Effects:
  - Drop shadow: 0px 4px 20px rgba(0, 0, 0, 0.4)
  - Glow: 0px 0px 50px rgba(96, 165, 250, 0.2)

**Company Name:**
- Text: "APEX SOLAR"
- Position: Same as light theme
- Font: Inter or similar
- Font Weight: Bold (700)
- Font Size: 48px
- Color: `#F3F4F6` (Very light gray - gray-100)
- Letter Spacing: 2px
- Effects:
  - Subtle glow: 0px 0px 20px rgba(96, 165, 250, 0.3)

**Tagline:**
- Text: "Invoice Generation System"
- Position: Same as light theme
- Font: Inter
- Font Weight: Medium (500)
- Font Size: 18px
- Color: `#9CA3AF` (Medium gray - gray-400)
- Letter Spacing: 0.5px

**Decorative Elements:**
- **Sun Icon/Shape:**
  - Same position and size as light theme
  - Color: `#FCD34D` (Brighter yellow - amber-300)
  - Opacity: 90%
  - Glow effect: 0px 0px 30px rgba(252, 211, 77, 0.4)
  
- **Solar Panel Pattern:**
  - Same position and design as light theme
  - Color: `#60A5FA` (Lighter blue - blue-400)
  - Opacity: 20%
  - Subtle glow: 0px 0px 20px rgba(96, 165, 250, 0.1)

**Loading Indicator:**
- Position: Same as light theme
- Progress Bar Option:
  - Width: 300px
  - Height: 4px
  - Background: `#374151` (gray-700)
  - Fill Color: `#60A5FA` (blue-400)
  - Border Radius: 2px
  - Glow on fill: 0px 0px 8px rgba(96, 165, 250, 0.5)
- Alternative Dots:
  - 3 circles, 8px diameter each
  - Color: `#60A5FA` (blue-400)
  - Glow: 0px 0px 8px rgba(96, 165, 250, 0.4)

**Version Text:**
- Same position as light theme
- Font Size: 12px
- Color: `#6B7280` (gray-500)

**Footer Text:**
- Same position and text as light theme
- Font Size: 11px
- Color: `#6B7280` (gray-500)

---

## Design Implementation Steps (Figma/Adobe XD)

### Step 1: Canvas Setup
1. Create new frame: 1200x1200px (or 1200x800px)
2. Name frame: "Splash Screen - Light"
3. Duplicate frame for dark theme
4. Name second frame: "Splash Screen - Dark"

### Step 2: Background Creation (Light)
1. Select Rectangle tool (R)
2. Draw rectangle covering entire canvas
3. Apply linear gradient:
   - Click Fill → Linear Gradient
   - First stop (top): #F9FAFB
   - Second stop (bottom): #F3F4F6

### Step 3: Add Accent Shapes
1. Select Ellipse tool (O)
2. Draw circle: 500x500px
3. Position: Bottom-right corner, half outside canvas
4. Fill: #DBEAFE
5. Opacity: 25%
6. Effects → Layer Blur → 50px
7. Duplicate and place at top-left

### Step 4: Logo Placement
1. File → Place Image → Select logo.png
2. Resize: 180x180px (maintain aspect ratio)
3. Position: Horizontal center, 200px from top
4. Effects → Drop Shadow:
   - X: 0, Y: 4
   - Blur: 20
   - Color: #000000, Opacity: 8%

### Step 5: Sun Icon (Optional - Create or Use Icon)
1. Using Figma/Icon library:
   - Search for "sun" icon
   - Or create custom with circle + 12 lines radiating
2. Size: 80x80px
3. Color: #FBBF24
4. Opacity: 80%
5. Position: 30px left of logo center
6. Effects → Inner Shadow (optional for depth)

### Step 6: Company Name Text
1. Select Text tool (T)
2. Type: "APEX SOLAR"
3. Font: Inter Bold
4. Size: 48px
5. Color: #1F2937
6. Text align: Center
7. Position: 40px below logo
8. Character spacing: 2%
9. Effects → Drop Shadow:
   - X: 0, Y: 2
   - Blur: 4
   - Color: #000000, Opacity: 5%

### Step 7: Tagline Text
1. Text tool (T)
2. Type: "Invoice Generation System"
3. Font: Inter Medium
4. Size: 18px
5. Color: #6B7280
6. Text align: Center
7. Position: 16px below company name
8. Character spacing: 0.5%

### Step 8: Solar Panel Pattern
1. Rectangle tool (R)
2. Create rectangle: 80x240px
3. Rotate: 15 degrees
4. Fill: #3B82F6
5. Opacity: 15%
6. Duplicate 3 times with slight offsets
7. Group all rectangles
8. Position: Bottom-center, 80px from bottom

### Step 9: Loading Indicator
**Progress Bar:**
1. Rectangle tool (R)
2. Background bar: 300x4px
3. Fill: #E5E7EB
4. Border radius: 2px
5. Progress bar: 120x4px (inside background bar)
6. Fill: #3B82F6
7. Position: 100px below tagline, centered

**Or Dots:**
1. Ellipse tool (O)
2. Create circle: 8x8px
3. Fill: #3B82F6
4. Duplicate 2 times, space 12px apart
5. Group dots
6. Center position below tagline

### Step 10: Footer Elements
1. Text tool for version: "v1.0.0"
   - Position: Bottom-right (24px margins)
   - Font: Inter Regular, 12px
   - Color: #9CA3AF

2. Text tool for company description
   - Position: Bottom-center (24px margin)
   - Font: Inter Regular, 11px
   - Color: #9CA3AF

### Step 11: Dark Theme Adaptation
1. Select all elements from light theme
2. Copy to dark theme frame
3. Modify colors:
   - Background gradient: #111827 → #030712
   - Accent shapes: #1E3A8A at 30% opacity
   - Company name: #F3F4F6
   - Tagline: #9CA3AF
   - Sun icon: #FCD34D
   - Solar panels: #60A5FA at 20%
   - Progress bar bg: #374151
   - Progress bar fill: #60A5FA
4. Add glow effects:
   - Logo: Layer Blur + Color overlay (blue)
   - Company name: Outer glow #60A5FA at 30%
   - Sun icon: Outer glow #FCD34D at 40%
   - Progress fill: Outer glow #60A5FA at 50%

### Step 12: Export Settings
1. Select frame
2. Export settings:
   - Format: PNG
   - Scale: 2x (for high DPI displays)
   - Naming: splash-light@2x.png, splash-dark@2x.png
3. Also export 1x versions for compatibility

---

## Color Reference Table

| Element | Light Theme | Dark Theme |
|---------|-------------|------------|
| Background Top | #F9FAFB (gray-50) | #111827 (gray-900) |
| Background Bottom | #F3F4F6 (gray-100) | #030712 (gray-950) |
| Accent Shapes | #DBEAFE (blue-100) 25% | #1E3A8A (blue-900) 30% |
| Company Name | #1F2937 (gray-800) | #F3F4F6 (gray-100) |
| Tagline | #6B7280 (gray-500) | #9CA3AF (gray-400) |
| Sun Icon | #FBBF24 (amber-400) 80% | #FCD34D (amber-300) 90% |
| Solar Panels | #3B82F6 (blue-500) 15% | #60A5FA (blue-400) 20% |
| Progress Background | #E5E7EB (gray-200) | #374151 (gray-700) |
| Progress Fill | #3B82F6 (blue-600) | #60A5FA (blue-400) |
| Footer Text | #9CA3AF (gray-400) | #6B7280 (gray-500) |

---

## Animation Suggestions (Optional - For Future Enhancement)

### Fade-in Sequence
1. Logo fades in (0-0.3s)
2. Company name slides up + fades in (0.2-0.5s)
3. Tagline fades in (0.4-0.7s)
4. Loading indicator appears (0.6-0.9s)
5. Footer elements fade in (0.8-1.1s)

### Loading Animation
- Progress bar: Indeterminate sliding animation (1.5s loop)
- Or: Dots pulsing sequentially (0.6s per dot, infinite loop)
- Sun icon: Subtle rotation (20s for full 360°, infinite)

### Transition Out
- Fade to transparent (0.3s)
- Scale down slightly while fading (0.95x scale)

---

## File Naming Convention

### For Splash Screens
- `splash-light.png` - Light theme, 1x resolution (1200x800px)
- `splash-light@2x.png` - Light theme, 2x resolution (2400x1600px)
- `splash-dark.png` - Dark theme, 1x resolution (1200x800px)
- `splash-dark@2x.png` - Dark theme, 2x resolution (2400x1600px)

### Storage Location
```
InvoiceGeneratorDesktop/
├── src-tauri/
│   ├── icons/
│   │   ├── splash-light.png
│   │   ├── splash-light@2x.png
│   │   ├── splash-dark.png
│   │   └── splash-dark@2x.png
```

---

## Design Principles

### Visual Hierarchy
1. **Primary**: Logo and Company Name (largest, most prominent)
2. **Secondary**: Tagline and sun icon (supporting elements)
3. **Tertiary**: Loading indicator (functional element)
4. **Quaternary**: Footer text and version (informational)

### Consistency
- Use the exact same spacing and proportions in both themes
- Only change colors, not layout or sizes
- Maintain brand identity with logo and company colors

### Accessibility
- Ensure text has sufficient contrast (WCAG AA minimum)
- Light theme: Dark text on light background (4.5:1 ratio)
- Dark theme: Light text on dark background (4.5:1 ratio)
- Loading indicator should be clearly visible in both themes

### Professional Feel
- Clean, minimal design (avoid clutter)
- Generous whitespace around elements
- Subtle shadows and glows (not overdone)
- Modern, sans-serif typography
- Solar energy theme through sun icon and panel patterns

---

## Tips for Best Results

1. **Use Vector Graphics**: Ensure logo and icons are vector-based for sharpness at all sizes
2. **Test on Different Screens**: View designs at actual size (100%) and on high-DPI displays
3. **Consider Timing**: Splash screen typically shows for 1-3 seconds
4. **Balance Detail**: Include enough branding without being too busy
5. **Export High Quality**: Use PNG-24 with transparency for best results
6. **Check Both Themes**: Verify logo visibility on both light and dark backgrounds
7. **Optimize File Size**: Compress PNGs without losing quality (use TinyPNG or similar)
8. **Responsive Design**: If supporting multiple window sizes, create variants

---

## Alternative Design Variations

### Minimal Version
- Just logo, company name, and loading indicator
- No decorative elements
- Clean white/black backgrounds
- Faster to load, more professional

### Detailed Version
- Add subtle grid pattern in background
- Include company address at bottom
- Add more solar panel illustrations
- Richer color gradients

### Abstract Version
- Use geometric shapes more prominently
- Create abstract representation of solar panels
- Modern, artistic interpretation
- More creative freedom

---

## Next Steps After Design

1. Export both light and dark splash screens as specified
2. Place files in `src-tauri/icons/` directory
3. Configure Tauri to use splash screen in `tauri.conf.json`
4. Test loading appearance in development
5. Adjust timing and fade effects as needed
6. Build and test in production mode

---

## Notes

- The splash screen should load instantly and remain visible while the app initializes
- Consider file size: Keep total size under 500KB for fast loading
- Ensure the design looks good at 1x, 1.5x, and 2x display scaling
- The loading indicator should provide feedback that something is happening
- Maintain consistency with the app's overall design language (which uses the same color palette)

---

**Design Created For**: Apex Solar Invoice Generator Desktop v1.0.0  
**Target Platform**: Windows 10/11 Desktop Application  
**Framework**: Tauri v1.5  
**Last Updated**: November 10, 2025
