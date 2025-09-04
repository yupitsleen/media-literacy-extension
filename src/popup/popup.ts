import { ExtensionSettings, TextStats } from '../types/extension';

document.addEventListener('DOMContentLoaded', (): void => {
  initializePopup();
});

async function initializePopup(): Promise<void> {
  const toggle = document.getElementById('enableExtension') as HTMLInputElement;
  
  if (!toggle) {
    console.error('Extension toggle not found');
    return;
  }

  try {
    // Load current settings
    const settings = await chrome.storage.sync.get(['extensionEnabled']) as Partial<ExtensionSettings>;
    toggle.checked = settings.extensionEnabled !== false;

    // Set up toggle event listener
    toggle.addEventListener('change', (): void => {
      const updatedSettings: Partial<ExtensionSettings> = {
        extensionEnabled: toggle.checked
      };
      
      chrome.storage.sync.set(updatedSettings);
      console.log('Extension toggled:', toggle.checked);
    });

    // Display current page stats if available
    await displayPageStats();

  } catch (error) {
    console.error('Failed to initialize popup:', error);
  }
}

async function displayPageStats(): Promise<void> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab?.url) return;

    const hostname = new URL(tab.url).hostname;
    const storageKey = `pageText_${hostname}`;
    
    const result = await chrome.storage.local.get([storageKey]);
    const pageData = result[storageKey];
    
    if (pageData && pageData.stats) {
      updateStatsDisplay(pageData.stats);
    }
  } catch (error) {
    console.error('Failed to load page stats:', error);
  }
}

function updateStatsDisplay(stats: TextStats): void {
  // Add stats display to the popup (we'll update the HTML too)
  const statusElement = document.querySelector('#status');
  
  if (statusElement) {
    statusElement.innerHTML = `
      <small>
        <strong>Page Analysis:</strong><br>
        ${stats.wordCount} words, ${stats.sentenceCount} sentences<br>
        ${stats.paragraphCount} paragraphs
      </small>
    `;
  }
}