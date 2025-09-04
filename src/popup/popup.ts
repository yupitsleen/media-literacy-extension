import { ExtensionSettings, TextStats, ExtensionMessage } from '../types/extension';
import { FallacyDetector, Fallacy } from '../utils/fallacy-detector';

document.addEventListener('DOMContentLoaded', (): void => {
  initializePopup();
});

async function initializePopup(): Promise<void> {
  const extensionToggle = document.getElementById('enableExtension') as HTMLInputElement;
  const fallacyToggle = document.getElementById('enableFallacyDetection') as HTMLInputElement;
  
  if (!extensionToggle || !fallacyToggle) {
    console.error('Required toggles not found');
    return;
  }

  try {
    // Load current settings
    const settings = await chrome.storage.sync.get([
      'extensionEnabled', 
      'fallacyDetectionEnabled', 
      'enabledFallacies'
    ]) as Partial<ExtensionSettings & { enabledFallacies: string[] }>;
    
    extensionToggle.checked = settings.extensionEnabled !== false;
    fallacyToggle.checked = settings.fallacyDetectionEnabled !== false;

    // Set up toggle event listeners
    extensionToggle.addEventListener('change', async (): Promise<void> => {
      const updatedSettings: Partial<ExtensionSettings> = {
        extensionEnabled: extensionToggle.checked
      };
      
      await chrome.storage.sync.set(updatedSettings);
      console.log('Extension toggled:', extensionToggle.checked);
      
      // Send message to content script
      sendMessageToActiveTab({
        type: extensionToggle.checked ? 'HIGHLIGHT_FALLACY' : 'REMOVE_HIGHLIGHTS'
      });
    });

    fallacyToggle.addEventListener('change', async (): Promise<void> => {
      const updatedSettings: Partial<ExtensionSettings> = {
        fallacyDetectionEnabled: fallacyToggle.checked
      };
      
      await chrome.storage.sync.set(updatedSettings);
      console.log('Fallacy detection toggled:', fallacyToggle.checked);
      
      // Send message to content script
      sendMessageToActiveTab({
        type: fallacyToggle.checked ? 'HIGHLIGHT_FALLACY' : 'REMOVE_HIGHLIGHTS'
      });
    });

    // Initialize fallacy configuration
    await initializeFallacyToggles(settings.enabledFallacies);

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

async function initializeFallacyToggles(enabledFallacies?: string[]): Promise<void> {
  const fallacyDetector = new FallacyDetector();
  const fallacies = fallacyDetector.getAllFallacies();
  const togglesContainer = document.getElementById('fallacyToggles');
  
  if (!togglesContainer) return;
  
  // Get current enabled fallacies from storage or use defaults
  const currentEnabled = enabledFallacies || fallacyDetector.getEnabledFallacies();
  
  togglesContainer.innerHTML = '';
  
  fallacies.forEach((fallacy: Fallacy) => {
    const isEnabled = currentEnabled.includes(fallacy.id);
    
    const toggleDiv = document.createElement('div');
    toggleDiv.className = 'form-check form-switch mb-2';
    toggleDiv.innerHTML = `
      <input class="form-check-input" type="checkbox" id="fallacy_${fallacy.id}" 
             ${isEnabled ? 'checked' : ''} data-fallacy-id="${fallacy.id}">
      <label class="form-check-label" for="fallacy_${fallacy.id}" style="font-size: 12px;">
        ${fallacy.name}
      </label>
    `;
    
    const checkbox = toggleDiv.querySelector('input') as HTMLInputElement;
    checkbox.addEventListener('change', () => handleFallacyToggle(fallacy.id, checkbox.checked));
    
    togglesContainer.appendChild(toggleDiv);
  });
}

async function handleFallacyToggle(fallacyId: string, enabled: boolean): Promise<void> {
  try {
    // Get current enabled fallacies
    const result = await chrome.storage.sync.get(['enabledFallacies']);
    const fallacyDetector = new FallacyDetector();
    let enabledFallacies = result.enabledFallacies || fallacyDetector.getEnabledFallacies();
    
    if (enabled) {
      if (!enabledFallacies.includes(fallacyId)) {
        enabledFallacies.push(fallacyId);
      }
    } else {
      enabledFallacies = enabledFallacies.filter((id: string) => id !== fallacyId);
    }
    
    // Save updated settings
    await chrome.storage.sync.set({ enabledFallacies });
    console.log(`Fallacy ${fallacyId} ${enabled ? 'enabled' : 'disabled'}`);
    
    // Send update to content script
    sendMessageToActiveTab({
      type: 'HIGHLIGHT_FALLACY',
      data: { enabledFallacies }
    });
    
  } catch (error) {
    console.error('Failed to update fallacy settings:', error);
  }
}

async function sendMessageToActiveTab(message: ExtensionMessage): Promise<void> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.id) {
      await chrome.tabs.sendMessage(tab.id, message);
    }
  } catch (error) {
    // Content script might not be ready, that's fine
    console.log('Could not send message to content script:', error);
  }
}