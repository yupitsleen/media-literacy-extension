import { TextExtractionResult, TextStats, ExtensionMessage } from '../types/extension';

console.log('Media Literacy Extension content script loaded');

// Text extraction functionality
class TextExtractor {
  private excludeSelectors: string[] = [
    'script', 'style', 'nav', 'header', 'footer', 
    '.ad', '.advertisement', '.sidebar', '.menu',
    '[role="navigation"]', '[role="complementary"]'
  ];

  extractPageText(): string {
    // Get main content areas first
    const contentSelectors: string[] = [
      'main', 'article', '[role="main"]', 
      '.content', '.post', '.article',
      'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
    ];

    let extractedText = '';
    const processedElements = new Set<Element>();

    // Try content-specific selectors first
    for (const selector of contentSelectors.slice(0, 3)) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        if (!processedElements.has(element)) {
          const text = this.extractTextFromElement(element);
          if (text.trim()) {
            extractedText += text + '\n';
            processedElements.add(element);
          }
        }
      }
    }

    // If no main content found, extract from paragraphs and headings
    if (extractedText.length < 100) {
      for (const selector of contentSelectors.slice(3)) {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          if (!processedElements.has(element) && !this.isInExcludedSection(element)) {
            const text = this.extractTextFromElement(element);
            if (text.trim().length > 20) { // Only meaningful text
              extractedText += text + '\n';
              processedElements.add(element);
            }
          }
        }
      }
    }

    return extractedText.trim();
  }

  private extractTextFromElement(element: Element): string {
    // Create a clone to avoid modifying the original
    const clone = element.cloneNode(true) as Element;
    
    // Remove excluded elements
    this.excludeSelectors.forEach(selector => {
      const excludedElements = clone.querySelectorAll(selector);
      excludedElements.forEach(el => el.remove());
    });

    return clone.textContent || '';
  }

  private isInExcludedSection(element: Element): boolean {
    return this.excludeSelectors.some(selector => {
      return element.closest(selector) !== null;
    });
  }

  getTextStats(text: string): TextStats {
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);

    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
      characterCount: text.length
    };
  }
}

// Initialize text extractor
const textExtractor = new TextExtractor();

// Extract text when page loads
function extractAndStorePageText(): void {
  try {
    const pageText = textExtractor.extractPageText();
    const stats = textExtractor.getTextStats(pageText);
    
    console.log('Text extraction complete:', stats);
    
    // Store extracted text and stats
    const extractionResult: TextExtractionResult = {
      url: window.location.href,
      text: pageText,
      stats: stats,
      timestamp: Date.now()
    };

    chrome.storage.local.set({
      [`pageText_${window.location.hostname}`]: extractionResult
    });

    // Send message to background script
    const message: ExtensionMessage = {
      type: 'TEXT_EXTRACTED',
      data: { text: pageText.substring(0, 500), stats }
    };

    chrome.runtime.sendMessage(message).catch(() => {
      // Background script might not be ready, that's fine
    });

  } catch (error) {
    console.error('Text extraction failed:', error);
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', extractAndStorePageText);
} else {
  // DOM is already ready
  setTimeout(extractAndStorePageText, 100);
}

// Re-extract if page content changes significantly
let lastExtractTime = 0;
const observer = new MutationObserver((): void => {
  const now = Date.now();
  if (now - lastExtractTime > 2000) { // Throttle to every 2 seconds
    lastExtractTime = now;
    setTimeout(extractAndStorePageText, 500); // Debounce
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});