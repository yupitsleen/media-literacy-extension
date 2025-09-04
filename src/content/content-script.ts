import { TextExtractionResult, TextStats, ExtensionMessage } from '../types/extension';
import { FallacyDetector, FallacyMatch } from '../utils/fallacy-detector';

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

// Initialize text extractor and fallacy detector
const textExtractor = new TextExtractor();
const fallacyDetector = new FallacyDetector();

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

    // Detect fallacies in extracted text
    const fallacies = fallacyDetector.detectFallacies(pageText);
    console.log(`Detected ${fallacies.length} potential fallacies`);

    // Send message to background script
    const message: ExtensionMessage = {
      type: 'TEXT_EXTRACTED',
      data: { text: pageText.substring(0, 500), stats, fallacies }
    };

    chrome.runtime.sendMessage(message).catch(() => {
      // Background script might not be ready, that's fine
    });

    // Highlight fallacies if detection is enabled
    if (fallacies.length > 0) {
      highlightFallacies(fallacies);
    }

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

// Fallacy highlighting functionality
function highlightFallacies(fallacies: FallacyMatch[]): void {
  // Remove existing highlights first
  removeExistingHighlights();

  for (const fallacy of fallacies) {
    try {
      highlightFallacyMatch(fallacy);
    } catch (error) {
      console.warn('Failed to highlight fallacy:', fallacy, error);
    }
  }
}

function highlightFallacyMatch(fallacy: FallacyMatch): void {
  // Find text nodes that contain the fallacy match
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null
  );

  const textNodes: Text[] = [];
  let node: Node | null;

  while ((node = walker.nextNode())) {
    const textNode = node as Text;
    if (textNode.textContent && textNode.textContent.toLowerCase().includes(
      fallacy.matchedText.toLowerCase().substring(0, 20)
    )) {
      textNodes.push(textNode);
    }
  }

  // Highlight in the first matching text node
  if (textNodes.length > 0) {
    highlightInTextNode(textNodes[0], fallacy);
  }
}

function highlightInTextNode(textNode: Text, fallacy: FallacyMatch): void {
  const text = textNode.textContent || '';
  const matchIndex = text.toLowerCase().indexOf(fallacy.matchedText.toLowerCase());

  if (matchIndex === -1) return;

  // Create highlight element
  const highlight = document.createElement('span');
  highlight.className = `mle-fallacy-highlight mle-${fallacy.fallacyId}`;
  highlight.style.cssText = `
    background-color: rgba(255, 193, 7, 0.3);
    border-bottom: 2px solid #ffc107;
    cursor: help;
    position: relative;
  `;
  highlight.dataset.fallacyId = fallacy.fallacyId;
  highlight.dataset.confidence = fallacy.confidence.toString();
  highlight.title = `${fallacy.fallacyName}: ${fallacy.description}`;

  // Split the text and insert highlight
  const beforeText = text.substring(0, matchIndex);
  const matchText = text.substring(matchIndex, matchIndex + fallacy.matchedText.length);
  const afterText = text.substring(matchIndex + fallacy.matchedText.length);

  if (textNode.parentNode) {
    // Create text nodes
    if (beforeText) {
      textNode.parentNode.insertBefore(document.createTextNode(beforeText), textNode);
    }

    highlight.textContent = matchText;
    textNode.parentNode.insertBefore(highlight, textNode);

    if (afterText) {
      textNode.parentNode.insertBefore(document.createTextNode(afterText), textNode);
    }

    // Remove original text node
    textNode.parentNode.removeChild(textNode);

    // Add click listener for tooltip
    highlight.addEventListener('click', () => showFallacyTooltip(highlight, fallacy));
  }
}

function removeExistingHighlights(): void {
  const highlights = document.querySelectorAll('.mle-fallacy-highlight');
  highlights.forEach(highlight => {
    const parent = highlight.parentNode;
    if (parent) {
      parent.replaceChild(document.createTextNode(highlight.textContent || ''), highlight);
      parent.normalize(); // Merge adjacent text nodes
    }
  });

  // Remove any existing tooltips
  const tooltips = document.querySelectorAll('.mle-fallacy-tooltip');
  tooltips.forEach(tooltip => tooltip.remove());
}

function showFallacyTooltip(element: HTMLElement, fallacy: FallacyMatch): void {
  // Remove existing tooltips
  document.querySelectorAll('.mle-fallacy-tooltip').forEach(t => t.remove());

  const tooltip = document.createElement('div');
  tooltip.className = 'mle-fallacy-tooltip';
  tooltip.style.cssText = `
    position: absolute;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    max-width: 300px;
    z-index: 10000;
    font-size: 14px;
    line-height: 1.4;
  `;

  tooltip.innerHTML = `
    <div style="font-weight: bold; color: #d63384; margin-bottom: 8px;">
      ${fallacy.fallacyName}
    </div>
    <div style="margin-bottom: 8px; color: #333;">
      ${fallacy.description}
    </div>
    <div style="font-size: 12px; color: #666;">
      Confidence: ${Math.round(fallacy.confidence * 100)}%
    </div>
    <div style="margin-top: 8px; font-size: 12px; color: #007bff; cursor: pointer;" class="mle-learn-more">
      Click to learn more
    </div>
  `;

  document.body.appendChild(tooltip);

  // Position tooltip
  const rect = element.getBoundingClientRect();
  tooltip.style.left = Math.max(10, rect.left) + 'px';
  tooltip.style.top = (rect.bottom + window.scrollY + 5) + 'px';

  // Add learn more functionality
  const learnMore = tooltip.querySelector('.mle-learn-more');
  if (learnMore) {
    learnMore.addEventListener('click', () => {
      showFallacyExplanation(fallacy);
    });
  }

  // Auto-remove tooltip after 5 seconds
  setTimeout(() => tooltip.remove(), 5000);

  // Remove on click outside
  const removeTooltip = (e: Event) => {
    if (!tooltip.contains(e.target as Node) && e.target !== element) {
      tooltip.remove();
      document.removeEventListener('click', removeTooltip);
    }
  };
  setTimeout(() => document.addEventListener('click', removeTooltip), 100);
}

function showFallacyExplanation(fallacy: FallacyMatch): void {
  const modal = document.createElement('div');
  modal.className = 'mle-fallacy-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10001;
  `;

  const content = document.createElement('div');
  content.style.cssText = `
    background: white;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;
    padding: 20px;
    border-radius: 8px;
    margin: 20px;
  `;

  content.innerHTML = `
    <h3 style="margin-top: 0; color: #d63384;">${fallacy.fallacyName}</h3>
    <p><strong>Description:</strong> ${fallacy.description}</p>
    <p><strong>Explanation:</strong> ${fallacy.explanation}</p>
    <p><strong>Detected text:</strong> "${fallacy.matchedText}"</p>
    <p><strong>Confidence:</strong> ${Math.round(fallacy.confidence * 100)}%</p>
    <button style="
      background: #007bff;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 10px;
    ">Close</button>
  `;

  modal.appendChild(content);
  document.body.appendChild(modal);

  // Close modal on button click or outside click
  const closeBtn = content.querySelector('button');
  const closeModal = () => modal.remove();
  
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((
  message: ExtensionMessage,
  _sender: chrome.runtime.MessageSender,
  _sendResponse: (response?: unknown) => void
): boolean => {
  switch (message.type) {
    case 'REMOVE_HIGHLIGHTS':
      removeExistingHighlights();
      break;
    case 'HIGHLIGHT_FALLACY':
      // Update fallacy detector configuration if provided
      if (message.data && typeof message.data === 'object' && message.data !== null) {
        const data = message.data as { enabledFallacies?: string[] };
        if (data.enabledFallacies) {
          fallacyDetector.updateEnabledFallacies(data.enabledFallacies);
        }
      }
      // Re-run fallacy detection and highlighting
      extractAndStorePageText();
      break;
  }
  return false;
});