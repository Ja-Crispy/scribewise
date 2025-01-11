export interface Revision {
  id: string;
  originalText: string;
  revisedText: string;
  timestamp: Date;
  explanation: string;
}

export interface Annotation {
  text: string;
  comment: string;
}