export type IngestionStep = 
  | 'source' 
  | 'upload' 
  | 'mapping' 
  | 'preview' 
  | 'confirm';

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transformation?: string;
  confidence?: number;
}
