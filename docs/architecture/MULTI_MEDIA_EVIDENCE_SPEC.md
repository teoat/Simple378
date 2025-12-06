# Multi-Media Evidence Integration Specification

**Version:** 1.0.0  
**Date:** December 6, 2025  
**Status:** 📋 Planned

---

## Overview

This specification defines how the Simple378 fraud detection system handles, processes, and integrates multiple evidence types (PDFs, chat histories, videos, photos) throughout the investigation workflow.

---

## Table of Contents

1. [Supported Media Types](#supported-media-types)
2. [Workflow Integration](#workflow-integration)
3. [Processing Pipeline](#processing-pipeline)
4. [Storage Architecture](#storage-architecture)
5. [API Specifications](#api-specifications)
6. [UI Components](#ui-components)
7. [AI/ML Integration](#aiml-integration)
8. [Security & Privacy](#security--privacy)
9. [Implementation Roadmap](#implementation-roadmap)

---

## Supported Media Types

### 1. Documents (PDFs)

**Formats:** PDF, DOCX, XLSX, TXT  
**Max Size:** 100MB per file  
**Use Cases:**
- Bank statements
- Contracts and agreements
- Financial reports
- Legal documents
- Invoices and receipts (PDF format)

**Processing Capabilities:**
- OCR text extraction (Tesseract/Cloud Vision API)
- Table detection and parsing (Camelot, Tabula)
- Metadata extraction (creation date, author, software)
- Redaction detection (black boxes, whited-out text)
- Document classification (ML-based)
- Entity extraction (NER - Named Entity Recognition)

### 2. Chat Histories

**Formats:** 
- WhatsApp export (.txt, .zip)
- Telegram JSON export
- Email (.mbox, .eml, .msg)
- SMS/iMessage (.db, .csv)
- Slack export (JSON)

**Max Size:** 50MB per file  
**Use Cases:**
- Communication evidence
- Payment instructions
- Conspiracy detection
- Timeline reconstruction
- Network analysis

**Processing Capabilities:**
- Message parsing and normalization
- Participant identification
- Timestamp extraction and timezone conversion
- Attachment extraction
- Thread reconstruction
- Sentiment analysis
- Language detection and translation
- Keyword/phrase extraction
- Network graph generation

### 3. Videos

**Formats:** MP4, AVI, MOV, MKV, WebM  
**Max Size:** 2GB per file  
**Use Cases:**
- Surveillance footage
- Screen recordings
- Interview recordings
- Security camera feeds
- Body camera footage

**Processing Capabilities:**
- Thumbnail generation (every 10 seconds)
- Audio transcription (Whisper AI, Google Speech-to-Text)
- Scene detection and segmentation
- Facial recognition (optional, privacy-aware)
- Object detection (YOLO, TensorFlow)
- Activity recognition
- Timestamp extraction from video metadata
- Frame extraction for key moments
- Video compression for storage optimization

### 4. Photos/Images

**Formats:** JPG, PNG, HEIC, HEIF, WebP, TIFF  
**Max Size:** 25MB per file  
**Use Cases:**
- Receipts
- ID cards and documents
- Property/asset photos
- Screenshots
- Location evidence

**Processing Capabilities:**
- OCR for text extraction
- EXIF metadata extraction (GPS, timestamp, camera model)
- Image classification (receipt, ID, property, etc.)
- Face detection and recognition
- Object detection
- QR/Barcode scanning
- Image enhancement (auto-rotate, brightness, contrast)
- Duplicate detection (perceptual hashing)

---

## Workflow Integration

### Phase 1: Login (Page 01)
**Media Handling:** N/A

---

### Phase 2: Cases (Page 02)

**Evidence Library Tab**

```typescript
interface EvidenceLibrary {
  documents: Document[];
  chats: ChatHistory[];
  videos: Video[];
  photos: Photo[];
  totalSize: number;
  lastUpdated: Date;
}

interface Document {
  id: string;
  filename: string;
  type: 'pdf' | 'docx' | 'xlsx' | 'txt';
  size: number;
  uploadedAt: Date;
  uploadedBy: User;
  ocrStatus: 'pending' | 'processing' | 'completed' | 'failed';
  extractedText?: string;
  extractedTables?: Table[];
  entities?: Entity[];
  pageCount: number;
  thumbnails: string[];
  tags: string[];
  linkedTransactions?: string[];
  annotations: Annotation[];
}

interface ChatHistory {
  id: string;
  filename: string;
  platform: 'whatsapp' | 'telegram' | 'email' | 'sms' | 'slack';
  participants: Participant[];
  messageCount: number;
  dateRange: { start: Date; end: Date };
  uploadedAt: Date;
  parsedMessages: Message[];
  keywords: KeywordMatch[];
  sentiment: SentimentScore;
  networkGraph?: NetworkGraph;
  tags: string[];
}

interface Video {
  id: string;
  filename: string;
  duration: number; // seconds
  resolution: { width: number; height: number };
  fps: number;
  size: number;
  uploadedAt: Date;
  transcriptionStatus: 'pending' | 'processing' | 'completed' | 'failed';
  transcript?: Transcript;
  thumbnails: Thumbnail[];
  detectedFaces?: Face[];
  detectedObjects?: DetectedObject[];
  keyMoments: KeyMoment[];
  tags: string[];
}

interface Photo {
  id: string;
  filename: string;
  size: number;
  dimensions: { width: number; height: number };
  uploadedAt: Date;
  exifData?: ExifData;
  ocrText?: string;
  classification: 'receipt' | 'id' | 'property' | 'screenshot' | 'other';
  detectedObjects?: string[];
  detectedText?: OCRResult[];
  gpsLocation?: { lat: number; lng: number };
  linkedTransaction?: string;
  tags: string[];
}
```

**UI Components:**

1. **Evidence Grid View**
   - Filterable by type, date, uploader
   - Sortable by name, date, size, relevance
   - Bulk selection and actions
   - Quick preview on hover

2. **Document Viewer**
   - PDF.js for in-browser rendering
   - Annotation tools (highlight, comment, redact)
   - Side-by-side comparison mode
   - Full-text search within document
   - Jump to page/section

3. **Chat Viewer**
   - Threaded conversation display
   - Participant avatars and colors
   - Search and filter by participant/keyword
   - Export to PDF
   - Link messages to transactions

4. **Video Player**
   - HTML5 video player with controls
   - Synchronized transcript sidebar
   - Timestamp annotations
   - Frame capture tool
   - Clip extraction (create sub-clips)
   - Playback speed control

5. **Photo Gallery**
   - Grid/list view toggle
   - Lightbox for full-screen viewing
   - EXIF data panel
   - Annotation tools (draw, highlight, text)
   - Comparison slider (before/after)
   - GPS map integration

---

### Phase 3: Ingestion & Mapping (Page 03)

**Enhanced Upload Zone**

```typescript
interface UploadConfig {
  acceptedTypes: {
    documents: string[];
    chats: string[];
    videos: string[];
    photos: string[];
  };
  maxSizes: {
    document: number; // 100MB
    chat: number;     // 50MB
    video: number;    // 2GB
    photo: number;    // 25MB
  };
  processingPipeline: ProcessingStep[];
}

interface ProcessingStep {
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  estimatedTime?: number; // seconds
  error?: string;
}
```

**Processing Pipeline Stages:**

1. **Upload & Validation**
   - File type verification
   - Size check
   - Virus scan (ClamAV)
   - Duplicate detection

2. **Media-Specific Processing**

   **For PDFs:**
   - OCR extraction (if scanned)
   - Table detection and parsing
   - Metadata extraction
   - Page thumbnail generation
   - Entity recognition (NER)

   **For Chats:**
   - Format parsing
   - Message extraction
   - Participant identification
   - Timestamp normalization
   - Attachment extraction

   **For Videos:**
   - Thumbnail generation
   - Audio extraction
   - Transcription (Whisper AI)
   - Scene detection
   - Facial recognition (optional)

   **For Photos:**
   - EXIF extraction
   - OCR (if text present)
   - Image classification
   - Object detection
   - GPS extraction

3. **Indexing**
   - Full-text search indexing (Meilisearch)
   - Vector embedding generation (for semantic search)
   - Metadata indexing

4. **Storage**
   - Original file → S3/MinIO
   - Processed data → PostgreSQL
   - Search index → Meilisearch
   - Thumbnails/previews → CDN

**Real-time Progress Tracking:**

```typescript
// WebSocket events
interface UploadProgress {
  fileId: string;
  stage: ProcessingStep;
  progress: number;
  message: string;
}

// Example
{
  fileId: "file_abc123",
  stage: "ocr_extraction",
  progress: 67,
  message: "Processing page 12 of 18..."
}
```

---

### Phase 4: Transaction Categorization (Page 04)

**Media Integration:**

1. **Receipt Matching**
   - Auto-link receipt photos to transactions
   - Extract amount, merchant, date from receipt
   - Flag discrepancies (receipt $50 vs transaction $45)

2. **Chat Context**
   - Show related chat messages when categorizing
   - "Payment to John Smith" → find chats mentioning John

3. **Document References**
   - Link invoices/contracts to transactions
   - Extract payment terms and amounts

**API Endpoints:**

```typescript
// Link receipt to transaction
POST /api/v1/categorization/link-receipt
{
  transactionId: "txn_123",
  receiptId: "photo_456",
  confidence: 0.95
}

// Get related evidence for transaction
GET /api/v1/categorization/transactions/{id}/evidence
Response: {
  receipts: Photo[],
  relatedChats: Message[],
  relatedDocuments: Document[]
}
```

---

### Phase 5: Reconciliation (Page 05)

**Media Integration:**

1. **Document-Based Reconciliation**
   - Match PDF bank statements to database records
   - Auto-reconcile based on extracted transactions

2. **Receipt Verification**
   - Compare receipt amounts to transactions
   - Flag missing receipts for large transactions

3. **Chat Evidence**
   - Show payment instructions from chats
   - Link "Send $500 to John" → $500 transaction

**UI Enhancements:**

```
┌─────────────────────────────────────────────────────────┐
│ Transaction: $5,000 to ABC Corp                        │
├─────────────────────────────────────────────────────────┤
│ Bank Record:    $5,000.00  Nov 15, 2025                │
│ PDF Statement:  $5,000.00  Nov 15, 2025  ✓ Matched    │
│ Receipt Photo:  $5,000.00  Nov 15, 2025  ✓ Matched    │
│ Chat Message:   "Send 5k to ABC by Nov 15"  ✓ Linked  │
└─────────────────────────────────────────────────────────┘
```

---

### Phase 6: Dashboard (Page 06)

**Media Analytics:**

```typescript
interface MediaMetrics {
  totalFiles: number;
  byType: {
    documents: number;
    chats: number;
    videos: number;
    photos: number;
  };
  processingStatus: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };
  storageUsed: number; // bytes
  recentUploads: RecentUpload[];
}
```

**Dashboard Cards:**

1. **Evidence Overview**
   - Total files uploaded
   - Processing status
   - Storage usage

2. **Recent Activity**
   - "New video uploaded to Case #1234"
   - "Chat history processed: 234 messages extracted"
   - "Receipt matched to transaction #5678"

3. **Processing Queue**
   - Files awaiting processing
   - Estimated completion time

---

### Phase 7: Adjudication (Page 07)

**Evidence Panel:**

```
┌─────────────────────────────────────────────────────────┐
│ Alert #5678: Suspicious $50,000 Transfer               │
├─────────────────────────────────────────────────────────┤
│ 📊 Transaction Details                                  │
│ 📎 Related Evidence (4 items)                           │
│                                                         │
│ 📄 Bank_Statement_Nov.pdf                              │
│    → Page 3, Line 12: $50,000 wire to offshore account│
│    [View Document]                                      │
│                                                         │
│ 💬 WhatsApp_Export.txt                                 │
│    → "Send the 50k to the usual account by Friday"    │
│    [View Conversation]                                  │
│                                                         │
│ 🎥 Interview_Recording.mp4                             │
│    → Subject denies knowledge of transfer (12:34)      │
│    [Play Video]                                         │
│                                                         │
│ 📸 Receipt_Wire_Transfer.jpg                           │
│    → $50,000 wire confirmation, Nov 15                 │
│    [View Photo]                                         │
│                                                         │
│ 🤖 AI Analysis:                                         │
│ "Subject's chat message contradicts interview claim.   │
│  Timeline: Chat (Nov 10) → Transaction (Nov 15) →      │
│  Interview (Nov 20). Recommend escalation."            │
└─────────────────────────────────────────────────────────┘
```

**Features:**

1. **Evidence Carousel**
   - Swipe through related evidence
   - Quick preview without leaving adjudication

2. **Quote Evidence**
   - Select text from document/chat
   - Add to decision rationale
   - Auto-cite source

3. **Video Clips**
   - Embed relevant video timestamps
   - Play inline in decision panel

---

### Phase 8: Visualization (Page 08)

**Multi-Media Timeline:**

```
Timeline View:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Oct 1        Oct 15       Nov 1        Nov 15       Dec 1
  │            │            │            │            │
  📸           💬           📄           🎥           📸
  Receipt      Chat         Statement    Video        Photo
  $500         "Send 50k"   $50k wire    Interview    Receipt
```

**Evidence Network Graph:**

```
         [Subject A]
         /    |    \
        /     |     \
    [Chat] [Video] [Photo]
       |      |       |
       └──────┼───────┘
              |
         [Transaction]
              |
         [Bank Stmt PDF]
```

**Visualization Types:**

1. **Evidence Timeline**
   - Chronological view of all evidence
   - Filter by type, date range
   - Zoom in/out
   - Overlay with transaction timeline

2. **Communication Network**
   - Graph of chat participants
   - Edge weight = message frequency
   - Node size = total messages
   - Color = sentiment

3. **Location Map**
   - Plot photo GPS coordinates
   - Show movement patterns
   - Correlate with transaction locations

4. **Document Flow Diagram**
   - Sankey diagram of document references
   - Show how evidence links together

---

### Phase 9: Summary (Page 09)

**Evidence Report Generation:**

```typescript
interface EvidenceReport {
  caseId: string;
  generatedAt: Date;
  summary: {
    totalEvidence: number;
    byType: MediaMetrics['byType'];
    keyFindings: string[];
  };
  evidenceList: {
    documents: DocumentSummary[];
    chats: ChatSummary[];
    videos: VideoSummary[];
    photos: PhotoSummary[];
  };
  timeline: TimelineEvent[];
  networkGraph: NetworkGraphData;
  exportFormat: 'pdf' | 'docx' | 'html';
}
```

**Report Sections:**

1. **Executive Summary**
   - Key evidence items
   - Main findings
   - Recommendations

2. **Evidence Inventory**
   - Complete list with thumbnails
   - Metadata table
   - Chain of custody

3. **Timeline of Events**
   - Chronological evidence presentation
   - Integrated with transactions

4. **Appendices**
   - Full document text
   - Chat transcripts
   - Video transcripts
   - Photo gallery

---

### Phase 10: Frenly AI (Page 10)

**AI-Powered Evidence Analysis:**

```typescript
interface EvidenceAnalysis {
  contradictions: Contradiction[];
  patterns: Pattern[];
  recommendations: Recommendation[];
  crossReferences: CrossReference[];
}

interface Contradiction {
  id: string;
  type: 'statement_vs_evidence' | 'timeline_mismatch' | 'location_conflict';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence: {
    source1: EvidenceItem;
    source2: EvidenceItem;
  };
  confidence: number; // 0-1
}

// Example
{
  type: 'statement_vs_evidence',
  severity: 'high',
  description: 'Subject claims no contact with John Smith, but WhatsApp shows 50 messages in November',
  evidence: {
    source1: { type: 'video', id: 'vid_123', timestamp: '12:34', quote: 'I never spoke to John' },
    source2: { type: 'chat', id: 'chat_456', messageCount: 50, dateRange: 'Nov 1-30' }
  },
  confidence: 0.95
}
```

**AI Capabilities:**

1. **Cross-Media Search**
   ```
   Query: "John Smith $50,000 November"
   
   Results:
   📄 Bank_Statement.pdf - Page 3: "$50,000 wire to J. Smith, Nov 15"
   💬 WhatsApp - Nov 10: "Send John the 50k by Friday"
   📸 Receipt.jpg - Nov 15: "Wire confirmation, $50,000, John Smith"
   🎥 Interview.mp4 - 12:34: "I don't know any John Smith"
   ```

2. **Contradiction Detection**
   - Compare statements across evidence types
   - Flag inconsistencies
   - Provide confidence scores

3. **Pattern Recognition**
   - Identify recurring entities across evidence
   - Detect suspicious patterns
   - Timeline anomalies

4. **Automated Linking**
   - Auto-link related evidence
   - Suggest connections
   - Build evidence chains

---

## Processing Pipeline

### Architecture Overview

```
┌─────────────┐
│   Upload    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Validation │ ← Virus scan, type check, size check
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Storage   │ ← S3/MinIO (original files)
└──────┬──────┘
       │
       ├──────────────┬──────────────┬──────────────┐
       ▼              ▼              ▼              ▼
   ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐
   │  PDF   │    │  Chat  │    │ Video  │    │ Photo  │
   │ Process│    │ Process│    │ Process│    │ Process│
   └────┬───┘    └────┬───┘    └────┬───┘    └────┬───┘
        │             │             │             │
        │             │             │             │
        └─────────────┴─────────────┴─────────────┘
                      │
                      ▼
              ┌───────────────┐
              │   Indexing    │ ← Meilisearch, PostgreSQL
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │  AI Analysis  │ ← NER, sentiment, linking
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │   Complete    │
              └───────────────┘
```

### Processing Services

#### 1. PDF Processing Service

```python
class PDFProcessor:
    async def process(self, file_path: str) -> PDFResult:
        # Extract text
        text = await self.ocr_extract(file_path)
        
        # Extract tables
        tables = await self.extract_tables(file_path)
        
        # Generate thumbnails
        thumbnails = await self.generate_thumbnails(file_path)
        
        # Extract metadata
        metadata = await self.extract_metadata(file_path)
        
        # Entity recognition
        entities = await self.extract_entities(text)
        
        # Detect redactions
        redactions = await self.detect_redactions(file_path)
        
        return PDFResult(
            text=text,
            tables=tables,
            thumbnails=thumbnails,
            metadata=metadata,
            entities=entities,
            redactions=redactions
        )
```

#### 2. Chat Processing Service

```python
class ChatProcessor:
    async def process(self, file_path: str, platform: str) -> ChatResult:
        # Parse messages
        messages = await self.parse_messages(file_path, platform)
        
        # Extract participants
        participants = self.extract_participants(messages)
        
        # Sentiment analysis
        sentiment = await self.analyze_sentiment(messages)
        
        # Keyword extraction
        keywords = await self.extract_keywords(messages)
        
        # Build network graph
        network = self.build_network_graph(messages)
        
        return ChatResult(
            messages=messages,
            participants=participants,
            sentiment=sentiment,
            keywords=keywords,
            network=network
        )
```

#### 3. Video Processing Service

```python
class VideoProcessor:
    async def process(self, file_path: str) -> VideoResult:
        # Generate thumbnails
        thumbnails = await self.generate_thumbnails(file_path)
        
        # Extract audio
        audio_path = await self.extract_audio(file_path)
        
        # Transcribe audio
        transcript = await self.transcribe(audio_path)
        
        # Scene detection
        scenes = await self.detect_scenes(file_path)
        
        # Facial recognition (optional)
        faces = await self.detect_faces(file_path)
        
        # Object detection
        objects = await self.detect_objects(file_path)
        
        return VideoResult(
            thumbnails=thumbnails,
            transcript=transcript,
            scenes=scenes,
            faces=faces,
            objects=objects
        )
```

#### 4. Photo Processing Service

```python
class PhotoProcessor:
    async def process(self, file_path: str) -> PhotoResult:
        # Extract EXIF
        exif = await self.extract_exif(file_path)
        
        # OCR if text present
        text = await self.ocr_extract(file_path)
        
        # Image classification
        classification = await self.classify_image(file_path)
        
        # Object detection
        objects = await self.detect_objects(file_path)
        
        # Face detection
        faces = await self.detect_faces(file_path)
        
        return PhotoResult(
            exif=exif,
            text=text,
            classification=classification,
            objects=objects,
            faces=faces
        )
```

---

## Storage Architecture

### File Storage

```
S3/MinIO Buckets:
├── originals/           # Original uploaded files
│   ├── documents/
│   ├── chats/
│   ├── videos/
│   └── photos/
├── processed/           # Processed versions
│   ├── thumbnails/
│   ├── transcripts/
│   └── extracted/
└── exports/             # Generated reports
    ├── pdf/
    └── docx/
```

### Database Schema

```sql
-- Evidence table
CREATE TABLE evidence (
    id UUID PRIMARY KEY,
    case_id UUID REFERENCES cases(id),
    type VARCHAR(20) NOT NULL, -- 'document', 'chat', 'video', 'photo'
    filename VARCHAR(255) NOT NULL,
    original_path TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100),
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP NOT NULL,
    processing_status VARCHAR(20) DEFAULT 'pending',
    processed_at TIMESTAMP,
    metadata JSONB,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Document-specific data
CREATE TABLE documents (
    id UUID PRIMARY KEY REFERENCES evidence(id),
    page_count INTEGER,
    extracted_text TEXT,
    extracted_tables JSONB,
    entities JSONB,
    thumbnails TEXT[],
    ocr_confidence FLOAT
);

-- Chat-specific data
CREATE TABLE chats (
    id UUID PRIMARY KEY REFERENCES evidence(id),
    platform VARCHAR(50),
    message_count INTEGER,
    participant_count INTEGER,
    date_range TSTZRANGE,
    participants JSONB,
    messages JSONB,
    keywords JSONB,
    sentiment JSONB,
    network_graph JSONB
);

-- Video-specific data
CREATE TABLE videos (
    id UUID PRIMARY KEY REFERENCES evidence(id),
    duration INTEGER, -- seconds
    resolution JSONB,
    fps INTEGER,
    transcript TEXT,
    transcript_confidence FLOAT,
    thumbnails TEXT[],
    scenes JSONB,
    detected_faces JSONB,
    detected_objects JSONB,
    key_moments JSONB
);

-- Photo-specific data
CREATE TABLE photos (
    id UUID PRIMARY KEY REFERENCES evidence(id),
    dimensions JSONB,
    exif_data JSONB,
    ocr_text TEXT,
    classification VARCHAR(50),
    detected_objects JSONB,
    detected_text JSONB,
    gps_location POINT
);

-- Evidence links (cross-references)
CREATE TABLE evidence_links (
    id UUID PRIMARY KEY,
    evidence_id_1 UUID REFERENCES evidence(id),
    evidence_id_2 UUID REFERENCES evidence(id),
    link_type VARCHAR(50), -- 'supports', 'contradicts', 'references', 'related'
    confidence FLOAT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(evidence_id_1, evidence_id_2)
);

-- Evidence annotations
CREATE TABLE evidence_annotations (
    id UUID PRIMARY KEY,
    evidence_id UUID REFERENCES evidence(id),
    user_id UUID REFERENCES users(id),
    annotation_type VARCHAR(50), -- 'highlight', 'comment', 'redaction', 'timestamp'
    content JSONB,
    position JSONB, -- page/timestamp/coordinates
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Specifications

### Upload Endpoints

```typescript
// Upload evidence
POST /api/v1/evidence/upload
Content-Type: multipart/form-data

Request:
{
  file: File,
  caseId: string,
  type: 'document' | 'chat' | 'video' | 'photo',
  tags?: string[],
  metadata?: Record<string, any>
}

Response (202 Accepted):
{
  evidenceId: string,
  status: 'processing',
  estimatedTime: number // seconds
}

// Get processing status
GET /api/v1/evidence/{id}/status

Response:
{
  id: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  progress: number, // 0-100
  currentStage: string,
  error?: string
}

// Get evidence details
GET /api/v1/evidence/{id}

Response:
{
  id: string,
  caseId: string,
  type: string,
  filename: string,
  size: number,
  uploadedAt: string,
  uploadedBy: User,
  processingStatus: string,
  metadata: any,
  tags: string[],
  // Type-specific data
  document?: DocumentData,
  chat?: ChatData,
  video?: VideoData,
  photo?: PhotoData
}

// Search evidence
POST /api/v1/evidence/search

Request:
{
  query: string,
  caseId?: string,
  types?: string[],
  dateRange?: { start: Date, end: Date },
  tags?: string[],
  page: number,
  perPage: number
}

Response:
{
  results: Evidence[],
  total: number,
  page: number,
  perPage: number,
  facets: {
    types: { [key: string]: number },
    tags: { [key: string]: number }
  }
}

// Link evidence items
POST /api/v1/evidence/link

Request:
{
  evidenceId1: string,
  evidenceId2: string,
  linkType: 'supports' | 'contradicts' | 'references' | 'related',
  confidence?: number
}

// Get related evidence
GET /api/v1/evidence/{id}/related

Response:
{
  supports: Evidence[],
  contradicts: Evidence[],
  references: Evidence[],
  related: Evidence[]
}

// Add annotation
POST /api/v1/evidence/{id}/annotations

Request:
{
  type: 'highlight' | 'comment' | 'redaction' | 'timestamp',
  content: any,
  position: any
}

// Get annotations
GET /api/v1/evidence/{id}/annotations

Response:
{
  annotations: Annotation[]
}
```

### Processing Endpoints

```typescript
// Trigger reprocessing
POST /api/v1/evidence/{id}/reprocess

// Extract specific data
POST /api/v1/evidence/{id}/extract
Request:
{
  extractionType: 'entities' | 'keywords' | 'faces' | 'objects'
}

// Generate thumbnail
POST /api/v1/evidence/{id}/thumbnail
Request:
{
  timestamp?: number, // for videos
  page?: number       // for documents
}
```

---

## UI Components

### 1. Universal Evidence Viewer

```typescript
interface EvidenceViewerProps {
  evidenceId: string;
  caseId: string;
  onClose: () => void;
  allowAnnotations?: boolean;
  allowLinking?: boolean;
}

// Renders appropriate viewer based on evidence type
<EvidenceViewer evidenceId="ev_123" caseId="case_456" />
```

### 2. Evidence Upload Component

```typescript
interface EvidenceUploadProps {
  caseId: string;
  acceptedTypes?: string[];
  maxSize?: number;
  onUploadComplete: (evidence: Evidence) => void;
  onUploadError: (error: Error) => void;
}

<EvidenceUpload 
  caseId="case_123"
  acceptedTypes={['document', 'photo']}
  onUploadComplete={(ev) => console.log('Uploaded:', ev)}
/>
```

### 3. Evidence Timeline

```typescript
interface EvidenceTimelineProps {
  caseId: string;
  dateRange?: { start: Date; end: Date };
  types?: string[];
  onItemClick: (evidence: Evidence) => void;
}

<EvidenceTimeline 
  caseId="case_123"
  onItemClick={(ev) => openViewer(ev)}
/>
```

### 4. Evidence Search

```typescript
interface EvidenceSearchProps {
  caseId?: string;
  placeholder?: string;
  onResultClick: (evidence: Evidence) => void;
}

<EvidenceSearch 
  caseId="case_123"
  placeholder="Search documents, chats, videos..."
  onResultClick={(ev) => openViewer(ev)}
/>
```

---

## AI/ML Integration

### 1. Entity Extraction (NER)

```python
from transformers import pipeline

ner = pipeline("ner", model="dslim/bert-base-NER")

def extract_entities(text: str) -> List[Entity]:
    results = ner(text)
    entities = []
    for result in results:
        entities.append(Entity(
            text=result['word'],
            type=result['entity'],
            confidence=result['score'],
            start=result['start'],
            end=result['end']
        ))
    return entities
```

### 2. Sentiment Analysis

```python
from transformers import pipeline

sentiment = pipeline("sentiment-analysis")

def analyze_sentiment(messages: List[str]) -> SentimentScore:
    results = sentiment(messages)
    positive = sum(1 for r in results if r['label'] == 'POSITIVE')
    negative = sum(1 for r in results if r['label'] == 'NEGATIVE')
    
    return SentimentScore(
        positive=positive / len(messages),
        negative=negative / len(messages),
        neutral=1 - (positive + negative) / len(messages)
    )
```

### 3. Contradiction Detection

```python
from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer('all-MiniLM-L6-v2')

def detect_contradictions(statements: List[str]) -> List[Contradiction]:
    embeddings = model.encode(statements)
    contradictions = []
    
    for i in range(len(statements)):
        for j in range(i + 1, len(statements)):
            similarity = util.cos_sim(embeddings[i], embeddings[j])
            
            # Low similarity might indicate contradiction
            if similarity < 0.3:
                contradictions.append(Contradiction(
                    statement1=statements[i],
                    statement2=statements[j],
                    confidence=1 - similarity
                ))
    
    return contradictions
```

### 4. Cross-Media Linking

```python
def link_evidence(evidence_items: List[Evidence]) -> List[EvidenceLink]:
    links = []
    
    # Extract all entities from all evidence
    all_entities = {}
    for item in evidence_items:
        entities = extract_entities(item.text)
        all_entities[item.id] = entities
    
    # Find common entities
    for i, item1 in enumerate(evidence_items):
        for j, item2 in enumerate(evidence_items[i+1:], i+1):
            common = find_common_entities(
                all_entities[item1.id],
                all_entities[item2.id]
            )
            
            if len(common) > 0:
                links.append(EvidenceLink(
                    evidence1=item1.id,
                    evidence2=item2.id,
                    linkType='related',
                    commonEntities=common,
                    confidence=len(common) / max(
                        len(all_entities[item1.id]),
                        len(all_entities[item2.id])
                    )
                ))
    
    return links
```

---

## Security & Privacy

### 1. Access Control

```typescript
// Evidence permissions
interface EvidencePermissions {
  canView: boolean;
  canDownload: boolean;
  canAnnotate: boolean;
  canDelete: boolean;
  canShare: boolean;
}

// Role-based access
const permissions = {
  analyst: {
    canView: true,
    canDownload: true,
    canAnnotate: true,
    canDelete: false,
    canShare: false
  },
  supervisor: {
    canView: true,
    canDownload: true,
    canAnnotate: true,
    canDelete: true,
    canShare: true
  },
  admin: {
    canView: true,
    canDownload: true,
    canAnnotate: true,
    canDelete: true,
    canShare: true
  }
};
```

### 2. Encryption

- **At Rest:** AES-256 encryption for stored files
- **In Transit:** TLS 1.3 for all API calls
- **End-to-End:** Optional E2E encryption for sensitive cases

### 3. Audit Logging

```sql
CREATE TABLE evidence_audit_log (
    id UUID PRIMARY KEY,
    evidence_id UUID REFERENCES evidence(id),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50), -- 'view', 'download', 'annotate', 'delete', 'share'
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT NOW(),
    metadata JSONB
);
```

### 4. Redaction

```typescript
// Auto-redact sensitive data
interface RedactionRule {
  pattern: RegExp;
  replacement: string;
  type: 'ssn' | 'credit_card' | 'phone' | 'email' | 'custom';
}

const redactionRules: RedactionRule[] = [
  { pattern: /\d{3}-\d{2}-\d{4}/, replacement: '***-**-****', type: 'ssn' },
  { pattern: /\d{4}-\d{4}-\d{4}-\d{4}/, replacement: '****-****-****-****', type: 'credit_card' }
];
```

### 5. Data Retention

```typescript
interface RetentionPolicy {
  evidenceType: string;
  retentionPeriod: number; // days
  autoDelete: boolean;
  archiveAfter?: number; // days
}

const policies: RetentionPolicy[] = [
  { evidenceType: 'document', retentionPeriod: 2555, autoDelete: false }, // 7 years
  { evidenceType: 'chat', retentionPeriod: 1825, autoDelete: false },      // 5 years
  { evidenceType: 'video', retentionPeriod: 1095, autoDelete: true, archiveAfter: 365 }, // 3 years, archive after 1 year
  { evidenceType: 'photo', retentionPeriod: 1825, autoDelete: false }      // 5 years
];
```

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)
**Status:** 🚧 In Progress

- [x] Database schema design
- [x] S3/MinIO storage setup
- [ ] Basic upload API
- [ ] File validation service
- [ ] Virus scanning integration

### Phase 2: PDF Processing (Weeks 5-8)
**Status:** 📋 Planned

- [ ] OCR integration (Tesseract)
- [ ] Table extraction (Camelot)
- [ ] PDF viewer component
- [ ] Annotation tools
- [ ] Entity extraction (NER)

### Phase 3: Photo Processing (Weeks 9-10)
**Status:** 📋 Planned

- [ ] EXIF extraction
- [ ] Image OCR
- [ ] Photo gallery component
- [ ] GPS mapping
- [ ] Receipt matching

### Phase 4: Chat Processing (Weeks 11-14)
**Status:** 📋 Planned

- [ ] WhatsApp parser
- [ ] Telegram parser
- [ ] Email parser
- [ ] Chat viewer component
- [ ] Network graph visualization
- [ ] Sentiment analysis

### Phase 5: Video Processing (Weeks 15-18)
**Status:** 📋 Planned

- [ ] Video transcription (Whisper AI)
- [ ] Thumbnail generation
- [ ] Video player component
- [ ] Scene detection
- [ ] Facial recognition (optional)

### Phase 6: AI Integration (Weeks 19-22)
**Status:** 📋 Planned

- [ ] Cross-media search
- [ ] Contradiction detection
- [ ] Automated linking
- [ ] Pattern recognition
- [ ] Evidence recommendations

### Phase 7: Advanced Features (Weeks 23-26)
**Status:** 📋 Planned

- [ ] Evidence timeline
- [ ] Report generation
- [ ] Bulk operations
- [ ] Advanced analytics
- [ ] Export capabilities

### Phase 8: Testing & Optimization (Weeks 27-30)
**Status:** 📋 Planned

- [ ] Performance optimization
- [ ] Security audit
- [ ] User acceptance testing
- [ ] Documentation
- [ ] Deployment

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| **Upload Speed** | >10 MB/s | TBD |
| **PDF OCR** | <30s for 20-page doc | TBD |
| **Video Transcription** | <2x real-time | TBD |
| **Search Response** | <500ms | TBD |
| **Thumbnail Generation** | <5s | TBD |
| **Storage Efficiency** | >70% compression | TBD |

---

## Cost Estimates

### Storage (per month)

| Type | Volume | Cost |
|------|--------|------|
| Documents | 100 GB | $2.30 |
| Photos | 50 GB | $1.15 |
| Videos | 500 GB | $11.50 |
| **Total** | **650 GB** | **$15** |

### Processing (per month)

| Service | Volume | Cost |
|---------|--------|------|
| OCR (Cloud Vision) | 10,000 pages | $15 |
| Transcription (Whisper) | 100 hours | $30 |
| NER (Hugging Face) | Self-hosted | $0 |
| **Total** | - | **$45** |

### **Total Monthly Cost:** ~$60 for 1000 cases

---

## Monitoring & Metrics

```typescript
interface ProcessingMetrics {
  totalFilesProcessed: number;
  averageProcessingTime: {
    documents: number;
    chats: number;
    videos: number;
    photos: number;
  };
  successRate: number;
  failureReasons: { [reason: string]: number };
  storageUsed: number;
  apiCalls: {
    ocr: number;
    transcription: number;
    ner: number;
  };
}
```

---

## References

- [Tesseract OCR Documentation](https://github.com/tesseract-ocr/tesseract)
- [Whisper AI](https://github.com/openai/whisper)
- [Hugging Face Transformers](https://huggingface.co/docs/transformers)
- [PDF.js](https://mozilla.github.io/pdf.js/)
- [Camelot Table Extraction](https://camelot-py.readthedocs.io/)

---

**Document Version:** 1.0.0  
**Last Updated:** December 6, 2025  
**Maintained by:** Antigravity Agent
