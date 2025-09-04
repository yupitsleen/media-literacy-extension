// Extension-specific type definitions

export interface ExtensionSettings {
  extensionEnabled: boolean;
  fallacyDetectionEnabled: boolean;
  hypocrisyDetectionEnabled: boolean;
  campaignFinanceEnabled: boolean;
  analysisLevel: 'basic' | 'detailed' | 'comprehensive';
}

export interface TextExtractionResult {
  url: string;
  text: string;
  stats: TextStats;
  timestamp: number;
}

export interface TextStats {
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  characterCount: number;
}

export interface ExtensionMessage {
  type: 'TEXT_EXTRACTED' | 'SETTINGS_UPDATED' | 'ANALYSIS_COMPLETE';
  data?: unknown;
}

export interface FallacyDetectionResult {
  type: string;
  confidence: number;
  text: string;
  explanation: string;
  position: {
    start: number;
    end: number;
  };
}