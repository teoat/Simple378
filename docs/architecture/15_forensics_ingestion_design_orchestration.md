# Forensics & Ingestion Page Design Orchestration

## Overview
This document outlines the design orchestration for the Forensics & Ingestion page, the primary entry point for data and evidence into the fraud detection system. The design focuses on seamless file uploads, real-time processing feedback, forensic analysis visualization, and premium glassmorphism aesthetics.

## Current State Analysis

### Existing Implementation
- **Location:** `frontend/src/pages/Ingestion.tsx`
- **Current Features:**
  - Basic file upload form
  - CSV ingestion support
  - Simple progress indicators
  - Integration with backend ingestion API
  - Basic error handling

### Gaps Identified
- No drag-and-drop interface
- Limited file type support
- No forensic analysis display
- Basic processing feedback
- No glassmorphism effects
- Limited error visualization
- No batch upload support
- No preview functionality

## Design Goals

### 1. Seamless Upload Experience
- **Drag-and-Drop:** Full-screen drop zone for intuitive uploads
- **Multi-file Support:** Upload multiple files simultaneously
- **File Validation:** Client-side validation before upload
- **Progress Tracking:** Real-time upload and processing progress

### 2. Forensic Analysis Display
- **Metadata Extraction:** Display EXIF, PDF metadata, file properties
- **Manipulation Detection:** Visual indicators for tampered files
- **OCR Results:** Show extracted text from images/PDFs
- **Chain of Custody:** Track file handling and processing steps

### 3. CSV Ingestion Wizard
- **Column Mapping:** Interactive wizard for mapping CSV columns
- **Data Preview:** Show sample data before import
- **Validation:** Real-time validation of data formats
- **Error Reporting:** Clear feedback on import errors

### 4. Visual Design
- **Glassmorphism:** Premium glass effects on upload zones and cards
- **Processing States:** Animated progress bars and status indicators
- **Split View:** Original file vs. extracted data comparison
- **Responsive Design:** Optimized for desktop and tablet

## Design Specifications

### 1. Upload Interface

#### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│  Forensics & Ingestion        [Upload History] [Help]  │
├─────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────┐ │
│  │                                                   │ │
│  │         📁  Drag files here or click to browse   │ │
│  │                                                   │ │
│  │         Supported: PDF, PNG, JPG, CSV, XLSX      │ │
│  │         Max size: 50MB per file                  │ │
│  │                                                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                          │
│  Recent Uploads:                                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 📄 receipt_001.pdf    ████████░░ 80%  [View]   │   │
│  │ 📊 transactions.csv   ✓ Complete      [View]   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

#### Drop Zone Design
- **Default State:**
  - Large, centered icon (upload cloud)
  - Instructional text
  - Supported file types list
  - File size limits
- **Hover State (Drag Over):**
  - Animated border glow
  - Background color change
  - Icon animation (pulse)
  - "Drop to upload" text
- **Active Upload:**
  - Replace with progress indicators
  - Show file list with individual progress bars
  - Cancel buttons for each file

#### Glassmorphism Drop Zone
```css
backdrop-blur-xl 
bg-white/5 dark:bg-slate-800/10
border-2 border-dashed border-white/20 dark:border-slate-700/30
hover:border-purple-400/50 dark:hover:border-cyan-400/50
hover:bg-white/10 dark:hover:bg-slate-800/20
shadow-2xl shadow-purple-500/10
rounded-2xl
transition-all duration-300
```

### 2. Processing Pipeline Visualization

#### Processing Stages
```
Upload → Virus Scan → OCR → Metadata → Forensics → Indexing → Complete
  ✓         ✓         ⟳       ○          ○           ○          ○
```

**Visual Design:**
- Horizontal stepper/progress bar
- Each stage with icon and label
- Active stage with animated spinner
- Completed stages with checkmark
- Failed stages with error icon
- Estimated time remaining

#### Stage Details
1. **Upload:** File transfer to server
2. **Virus Scan:** Malware/virus detection
3. **OCR:** Text extraction from images/PDFs
4. **Metadata:** EXIF, PDF metadata extraction
5. **Forensics:** Manipulation detection, image analysis
6. **Indexing:** Search index creation (Meilisearch, Qdrant)
7. **Complete:** Ready for analysis

#### Processing Card
```css
backdrop-blur-lg 
bg-white/10 dark:bg-slate-900/20
border border-white/20 dark:border-slate-700/30
shadow-xl shadow-blue-500/10
rounded-xl
```

**Content:**
- File name and icon
- Processing stage indicator
- Progress bar (0-100%)
- Time elapsed / remaining
- Cancel button
- View details button

### 3. Forensic Analysis Results

#### Split View Layout
```
┌─────────────────────────────────────────────────────────┐
│  receipt_001.pdf - Analysis Complete                   │
├─────────────────────┬───────────────────────────────────┤
│  Original Document  │  Extracted Data & Analysis        │
│  ┌───────────────┐  │  ┌─────────────────────────────┐ │
│  │               │  │  │ Metadata:                   │ │
│  │  [PDF/Image   │  │  │ • Created: 2024-01-15       │ │
│  │   Preview]    │  │  │ • Modified: 2024-01-15      │ │
│  │               │  │  │ • Author: John Doe          │ │
│  └───────────────┘  │  └─────────────────────────────┘ │
│                     │  ┌─────────────────────────────┐ │
│  [Zoom] [Download]  │  │ OCR Text:                   │ │
│                     │  │ Invoice #12345              │ │
│                     │  │ Amount: $1,234.56           │ │
│                     │  └─────────────────────────────┘ │
│                     │  ┌─────────────────────────────┐ │
│                     │  │ Forensics:                  │ │
│                     │  │ ✓ No manipulation detected  │ │
│                     │  │ ✓ Authentic EXIF data       │ │
│                     │  └─────────────────────────────┘ │
└─────────────────────┴───────────────────────────────────┘
```

#### Forensic Indicators
- **Manipulation Detection:**
  - ✓ No manipulation (green badge)
  - ⚠ Possible manipulation (yellow badge)
  - ✗ Manipulation detected (red badge)
- **EXIF Data:**
  - Camera model, GPS, timestamp
  - Software used for editing
  - Metadata consistency check
- **Image Analysis:**
  - Error Level Analysis (ELA) visualization
  - Clone detection
  - Noise analysis

#### Metadata Display
- **Structured Layout:** Key-value pairs
- **Expandable Sections:** Click to expand full metadata
- **Copy Functionality:** Copy values to clipboard
- **Export:** Download metadata as JSON

### 4. CSV Ingestion Wizard

#### Step 1: File Upload
- Drag-and-drop CSV/XLSX file
- File validation (format, size)
- Preview first 10 rows

#### Step 2: Column Mapping
```
┌─────────────────────────────────────────────────────────┐
│  Map CSV Columns to System Fields                      │
├─────────────────────────────────────────────────────────┤
│  CSV Column          →  System Field                    │
│  ┌────────────────┐     ┌──────────────────────┐       │
│  │ TxnDate        │  →  │ [Select Field ▾]     │       │
│  │ 2024-01-15     │     │ ◉ Transaction Date   │       │
│  └────────────────┘     │ ○ Created Date       │       │
│                         │ ○ Updated Date       │       │
│  ┌────────────────┐     └──────────────────────┘       │
│  │ Amount         │  →  │ [Select Field ▾]     │       │
│  │ 1234.56        │     │ ◉ Amount             │       │
│  └────────────────┘     │ ○ Balance            │       │
│                         └──────────────────────┘       │
│  [Auto-Map] [Reset]                    [Next Step →]  │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Auto-mapping based on column names
- Dropdown for manual mapping
- Preview sample data
- Required field indicators
- Validation warnings

#### Step 3: Data Validation
- Show validation errors
- Row-by-row error display
- Option to skip invalid rows
- Option to fix and re-validate

#### Step 4: Import Confirmation
- Summary of import (total rows, valid, invalid)
- Estimated processing time
- Confirm and start import

### 5. Upload History

#### History List
- **Recent Uploads:** Last 20 uploads
- **Filters:** By file type, status, date range
- **Sorting:** By date, name, status
- **Search:** Search by filename

#### History Item
```css
backdrop-blur-md 
bg-white/5 dark:bg-slate-800/10
border border-white/10 dark:border-slate-700/20
hover:bg-white/10 dark:hover:bg-slate-800/20
rounded-lg
```

**Content:**
- File icon and name
- Upload timestamp
- Status badge (Processing, Complete, Failed)
- File size
- Actions (View, Download, Delete)

### 6. Error Handling

#### Upload Errors
- **File Too Large:** Clear message with size limit
- **Unsupported Format:** List of supported formats
- **Network Error:** Retry button with exponential backoff
- **Server Error:** Error code and support contact

#### Processing Errors
- **Virus Detected:** Warning banner with quarantine option
- **OCR Failed:** Partial results with manual entry option
- **Forensics Failed:** Continue with limited analysis
- **Indexing Failed:** Retry option

#### Error Display
```css
backdrop-blur-lg 
bg-red-500/10 dark:bg-red-500/15
border border-red-400/30
shadow-lg shadow-red-500/20
rounded-xl
```

**Content:**
- Error icon
- Error message
- Suggested actions
- Retry/Cancel buttons

### 7. Glassmorphism Implementation

#### Upload Zone (Active)
```css
backdrop-blur-xl 
bg-purple-500/10 dark:bg-cyan-500/10
border-2 border-dashed border-purple-400/50 dark:border-cyan-400/50
shadow-2xl shadow-purple-500/20
```

#### Processing Card
```css
backdrop-blur-lg 
bg-white/10 dark:bg-slate-900/20
border border-white/20 dark:border-slate-700/30
shadow-xl shadow-blue-500/10
```

#### Results Panel
```css
backdrop-blur-lg 
bg-white/5 dark:bg-slate-800/10
border border-white/10 dark:border-slate-700/20
rounded-xl
```

### 8. Animation Specifications

#### Drop Zone Hover
- **Type:** Border glow + background fade
- **Duration:** 200ms
- **Easing:** `ease-in-out`

#### File Upload Start
- **Type:** Slide in from bottom
- **Duration:** 300ms
- **Easing:** `ease-out`

#### Processing Progress
- **Type:** Width animation (progress bar)
- **Duration:** Smooth, based on actual progress
- **Easing:** `linear`

#### Stage Transition
- **Type:** Checkmark fade in + next stage highlight
- **Duration:** 400ms
- **Easing:** `ease-out`

#### Results Reveal
- **Type:** Split view slide in
- **Duration:** 500ms
- **Easing:** `ease-out`

## Technical Implementation

### Components Structure

```
frontend/src/
├── components/
│   └── ingestion/
│       ├── UploadZone.tsx (new)
│       ├── FileUploadCard.tsx (new)
│       ├── ProcessingPipeline.tsx (new)
│       ├── ForensicResults.tsx (new)
│       ├── MetadataDisplay.tsx (new)
│       ├── CSVWizard.tsx (new)
│       ├── ColumnMapper.tsx (new)
│       ├── UploadHistory.tsx (new)
│       └── ErrorDisplay.tsx (new)
└── pages/
    └── Ingestion.tsx (enhanced)
```

### Dependencies
Required dependencies (most already installed):
- `react-dropzone` - Drag-and-drop file uploads
- `framer-motion` - Animations
- `lucide-react` - Icons
- `tailwindcss` - Styling
- `react-query` or `swr` - Data fetching
- `papaparse` - CSV parsing
- `react-pdf` or `pdfjs-dist` - PDF preview

### API Integration

#### Endpoints
- `POST /api/v1/ingestion/upload` - Upload file
- `GET /api/v1/ingestion/status/{id}` - Get processing status
- `GET /api/v1/ingestion/results/{id}` - Get analysis results
- `POST /api/v1/ingestion/csv` - CSV import
- `GET /api/v1/ingestion/history` - Upload history

#### WebSocket Events
- `upload_progress` - Upload progress updates
- `processing_stage` - Processing stage changes
- `processing_complete` - Processing finished
- `processing_error` - Processing error occurred

### State Management
- **Upload State:** Active uploads with progress
- **History State:** Recent uploads list
- **Results State:** Forensic analysis results
- **Wizard State:** CSV mapping wizard state
- **WebSocket State:** Real-time processing updates

## Accessibility Requirements

### ARIA Labels
- Drop zone must have descriptive label
- Upload progress must be announced
- Processing stages must be announced
- Error messages must be linked to inputs

### Keyboard Navigation
- Tab through upload zone, history items
- Enter to trigger file browser
- Escape to cancel uploads
- Arrow keys for wizard navigation

### Screen Reader Support
- Upload progress announced
- Processing stages announced
- Completion/error states announced
- File details clearly described

### Color Contrast
- All text meets WCAG 2.1 AA (4.5:1)
- Status indicators distinguishable
- Focus indicators clearly visible

## Implementation Checklist

### Phase 1: Upload Interface
- [ ] Create drag-and-drop zone
- [ ] Implement file validation
- [ ] Add multi-file support
- [ ] Apply glassmorphism styling
- [ ] Add hover animations

### Phase 2: Processing Pipeline
- [ ] Create processing stage component
- [ ] Implement progress tracking
- [ ] Add WebSocket integration
- [ ] Add stage animations
- [ ] Add error handling

### Phase 3: Forensic Results
- [ ] Create split view layout
- [ ] Implement file preview
- [ ] Display metadata
- [ ] Show forensic indicators
- [ ] Add OCR results display

### Phase 4: CSV Wizard
- [ ] Create wizard component
- [ ] Implement column mapping
- [ ] Add data preview
- [ ] Add validation logic
- [ ] Add import confirmation

### Phase 5: Upload History
- [ ] Create history list component
- [ ] Add filtering and sorting
- [ ] Add search functionality
- [ ] Implement actions (view, delete)

### Phase 6: Error Handling
- [ ] Create error display component
- [ ] Add error recovery options
- [ ] Implement retry logic
- [ ] Add user-friendly messages

### Phase 7: Accessibility
- [ ] Add ARIA labels
- [ ] Implement keyboard navigation
- [ ] Test with screen readers
- [ ] Verify color contrast

## Testing Considerations

### Functional Testing
- Test file uploads (single, multiple)
- Verify drag-and-drop functionality
- Test processing pipeline
- Verify forensic analysis
- Test CSV wizard
- Verify error handling

### Visual Testing
- Verify glassmorphism effects
- Test animations and transitions
- Check responsive layouts
- Verify progress indicators

### Performance Testing
- Test large file uploads (50MB)
- Test multiple simultaneous uploads
- Verify WebSocket performance
- Test CSV import with large datasets

### Accessibility Testing
- Test with screen readers
- Verify keyboard navigation
- Check ARIA announcements
- Verify color contrast

## Future Enhancements

### Potential Additions
- **Batch Upload:** Upload entire folders
- **Cloud Import:** Import from Google Drive, Dropbox
- **Email Import:** Import from email attachments
- **API Upload:** Programmatic upload via API
- **Scheduled Imports:** Recurring CSV imports
- **Template Library:** Pre-configured CSV mappings
- **Advanced Forensics:** Deep learning-based analysis
- **Blockchain Anchoring:** Immutable evidence timestamps

### Advanced Features
- **Real-time Collaboration:** Multi-user upload sessions
- **Version Control:** Track file versions
- **Automated Categorization:** AI-based file classification
- **Smart Extraction:** AI-powered data extraction
- **Quality Scoring:** Automatic evidence quality assessment

## References

### Related Documents
- [UI Design Proposals](./04_ui_design_proposals.md) - General UI design guidelines
- [Case Management Design](./13_case_management_design_orchestration.md) - Case management patterns
- [System Architecture](./01_system_architecture.md) - Overall system structure
- [Forensics Security Spec](./08_forensics_security_spec.md) - Forensics implementation

### External Resources
- [React Dropzone](https://react-dropzone.js.org/)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [PapaParse Documentation](https://www.papaparse.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## Implementation Status
**Status:** Pending
**Date:** 2025-12-04

This design orchestration document is ready for implementation.
