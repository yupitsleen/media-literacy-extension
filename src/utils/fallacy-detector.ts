import fallaciesData from '../data/fallacies.json';

export interface FallacyMatch {
  fallacyId: string;
  fallacyName: string;
  description: string;
  explanation: string;
  confidence: number;
  matchedText: string;
  startIndex: number;
  endIndex: number;
  patternType: string;
}

export interface FallacyPattern {
  type: 'keyword' | 'structure';
  indicators: string[];
  weight: number;
  pattern?: string;
}

export interface Fallacy {
  id: string;
  name: string;
  description: string;
  explanation: string;
  examples: string[];
  patterns: FallacyPattern[];
  confidence_threshold: number;
  enabled: boolean;
}

export class FallacyDetector {
  private fallacies: Fallacy[];
  private enabledFallacies: Set<string>;

  constructor() {
    this.fallacies = fallaciesData.fallacies as Fallacy[];
    this.enabledFallacies = new Set(
      this.fallacies
        .filter(f => f.enabled)
        .map(f => f.id)
    );
  }

  public updateEnabledFallacies(enabledIds: string[]): void {
    this.enabledFallacies = new Set(enabledIds);
  }

  public detectFallacies(text: string): FallacyMatch[] {
    const matches: FallacyMatch[] = [];
    const sentences = this.splitIntoSentences(text);

    for (const fallacy of this.fallacies) {
      if (!this.enabledFallacies.has(fallacy.id)) continue;

      const fallacyMatches = this.detectFallacyInText(fallacy, text, sentences);
      matches.push(...fallacyMatches);
    }

    // Remove overlapping matches, keeping highest confidence
    return this.resolveOverlappingMatches(matches);
  }

  private detectFallacyInText(fallacy: Fallacy, fullText: string, sentences: string[]): FallacyMatch[] {
    const matches: FallacyMatch[] = [];

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const sentenceStart = fullText.indexOf(sentence, i > 0 ? matches[matches.length - 1]?.endIndex || 0 : 0);

      for (const pattern of fallacy.patterns) {
        const patternMatches = this.findPatternMatches(
          sentence, 
          pattern, 
          fallacy,
          sentenceStart
        );
        matches.push(...patternMatches);
      }
    }

    // Filter by confidence threshold
    return matches.filter(match => match.confidence >= fallacy.confidence_threshold);
  }

  private findPatternMatches(
    sentence: string, 
    pattern: FallacyPattern, 
    fallacy: Fallacy,
    sentenceStart: number
  ): FallacyMatch[] {
    const matches: FallacyMatch[] = [];

    if (pattern.type === 'keyword') {
      for (const indicator of pattern.indicators) {
        const regex = new RegExp(`\\b${indicator.replace(/\*/g, '\\w*')}\\b`, 'gi');
        let match;

        while ((match = regex.exec(sentence)) !== null) {
          matches.push({
            fallacyId: fallacy.id,
            fallacyName: fallacy.name,
            description: fallacy.description,
            explanation: fallacy.explanation,
            confidence: pattern.weight,
            matchedText: match[0],
            startIndex: sentenceStart + match.index,
            endIndex: sentenceStart + match.index + match[0].length,
            patternType: pattern.type
          });
        }
      }
    } else if (pattern.type === 'structure') {
      for (const indicator of pattern.indicators) {
        const regex = new RegExp(indicator, 'gi');

        while (regex.exec(sentence) !== null) {
          // For structural patterns, match the entire sentence context
          matches.push({
            fallacyId: fallacy.id,
            fallacyName: fallacy.name,
            description: fallacy.description,
            explanation: fallacy.explanation,
            confidence: pattern.weight * 0.8, // Slightly lower confidence for structural patterns
            matchedText: sentence.trim(),
            startIndex: sentenceStart,
            endIndex: sentenceStart + sentence.length,
            patternType: pattern.type
          });
        }
      }
    }

    return matches;
  }

  private splitIntoSentences(text: string): string[] {
    // Simple sentence splitting - can be enhanced with more sophisticated NLP
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10); // Filter out very short fragments
  }

  private resolveOverlappingMatches(matches: FallacyMatch[]): FallacyMatch[] {
    if (matches.length === 0) return matches;

    // Sort by start index
    const sorted = matches.sort((a, b) => a.startIndex - b.startIndex);
    const resolved: FallacyMatch[] = [];

    for (const current of sorted) {
      const hasOverlap = resolved.some(existing => 
        this.rangesOverlap(
          existing.startIndex, existing.endIndex,
          current.startIndex, current.endIndex
        )
      );

      if (!hasOverlap) {
        resolved.push(current);
      } else {
        // Keep the match with higher confidence
        const overlappingIndex = resolved.findIndex(existing =>
          this.rangesOverlap(
            existing.startIndex, existing.endIndex,
            current.startIndex, current.endIndex
          )
        );

        if (overlappingIndex !== -1 && current.confidence > resolved[overlappingIndex].confidence) {
          resolved[overlappingIndex] = current;
        }
      }
    }

    return resolved;
  }

  private rangesOverlap(start1: number, end1: number, start2: number, end2: number): boolean {
    return Math.max(start1, start2) < Math.min(end1, end2);
  }

  public getFallacyById(id: string): Fallacy | undefined {
    return this.fallacies.find(f => f.id === id);
  }

  public getAllFallacies(): Fallacy[] {
    return [...this.fallacies];
  }

  public getEnabledFallacies(): string[] {
    return Array.from(this.enabledFallacies);
  }
}