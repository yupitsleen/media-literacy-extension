import { ExtensionSettings, ExtensionMessage } from '../types/extension';

// Initialize extension when installed
chrome.runtime.onInstalled.addListener((): void => {
  console.log('Media Literacy Extension installed');
  
  // Set default settings
  const defaultSettings: ExtensionSettings = {
    extensionEnabled: true,
    fallacyDetectionEnabled: true,
    hypocrisyDetectionEnabled: false,
    campaignFinanceEnabled: false,
    analysisLevel: 'basic'
  };
  
  chrome.storage.sync.set(defaultSettings);
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, sender: chrome.runtime.MessageSender, _sendResponse: (response?: unknown) => void): boolean => {
    console.log('Background received message:', message.type, sender.tab?.url);
    
    switch (message.type) {
      case 'TEXT_EXTRACTED':
        handleTextExtraction(message.data, sender);
        break;
      case 'SETTINGS_UPDATED':
        handleSettingsUpdate(message.data as Partial<ExtensionSettings>);
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
    
    return false; // Don't keep the message channel open
  }
);

function handleTextExtraction(data: unknown, sender: chrome.runtime.MessageSender): void {
  if (sender.tab?.id) {
    console.log(`Text extracted from ${sender.tab.url}:`, data);
    
    // Store tab-specific data
    chrome.storage.local.set({
      [`tab_${sender.tab.id}_text`]: data
    });
  }
}

function handleSettingsUpdate(settings: Partial<ExtensionSettings>): void {
  chrome.storage.sync.set(settings);
  console.log('Settings updated:', settings);
}