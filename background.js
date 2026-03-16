const PLATFORMS = {
  weibo: {
    name: 'xiaohongshu',
    displayName: 'Xiaohongshu',
    domains: ['xiaohongshu.com'],
    needCookie: false
  }
};


chrome.runtime.onInstalled.addListener(async (details) => {
  console.info('[Background] Extension installed or updated:', details.reason);

  if (details.reason === 'install') {
    console.info('[Background] Extension installed, version:', chrome.runtime.getManifest().version);
  }
  else if (details.reason === 'update') {
    console.info('[Background] Extension updated to version:', chrome.runtime.getManifest().version);
  }
});


function getPlatformFromUrl(url) {
  if (!url || !url.startsWith('http')) {
    console.warn('[Background] Invalid URL provided:', url);
    return null;
  }
  try {
    const hostname = new URL(url).hostname;
    for (const platform of Object.values(PLATFORMS)) {
      if (platform.domains.some(domain => 
        hostname === domain || hostname.endsWith(`.${domain}`)
      )) {
        console.debug(`[Background] Platform detected for URL ${url}: ${platform.name}`);
        return platform;
      }
    }
    console.debug('[Background] No supported platform found for URL:', url);
    return null;
  } catch (error) {
    console.error(`[Background] Error parsing URL ${url}:`, error);
    return null;
  }
}


function getLangCode() {
  const supportLangCodes = ["zh", "en", "bn", "cs", "de", "es", "ru", "it", "ms", "nl", "fr", "tl", "id", "vi", "pt", "pl", "tr", "uk", "fa", "hi", "lo", "my", "th", "ja", "ko", "zh-HK"];
  let uiLanguage = chrome.i18n.getUILanguage();

  uiLanguage = uiLanguage.replace("_", "-")

  const lowerCaseLang = uiLanguage.toLowerCase();
  if (lowerCaseLang.startsWith("zh-")) {
    if (lowerCaseLang.endsWith("cn")) {
      return "zh"
    }
    else {
      return uiLanguage
    }
  }
  
  uiLanguage = uiLanguage.substring(0, 2);
  if (supportLangCodes.includes(uiLanguage)) {
    return uiLanguage;
  } else {
    return "en";
  }
}


async function handleVideoPageAnalysis(tab, platform) {
  console.debug(`[Background] Starting video page analysis for ${platform.name}, tab ID: ${tab.id}`);
  
  try {
    const response = await chrome.tabs.sendMessage(tab.id, {
      platformName: platform.name,
      action: "extractVideoPageInfo",
    });

    console.debug(`[Background] Received response from content script for ${platform.name}:`, response);
    
    let videoPageInfo = null;
    if (response && response.success && response.data && response.data.url) {
      videoPageInfo = response.data;
      console.debug(`[Background] Video page info extracted for ${platform.name}:`, videoPageInfo);

      const langCode = getLangCode();

      let targetUrl = `https://grabclip.com/${platform.name}/${langCode}/?url=${encodeURIComponent(videoPageInfo.url)}`;

      chrome.tabs.create({
        url: targetUrl,
        active: true,
      }, (newTab) => {
        console.info(`[Background] Opened GrabClip in new tab ${newTab.id} for ${platform.name}`);
      });
      return { success: true };
    } else {
      console.warn(`[Background] Failed to get video page info for ${platform.name}:`, response?.error || "Unknown error");
      return { success: false, error: response?.error || "Unknown error" };
    }
  } catch (error) {
    console.error(`[Background] Error handling video analysis for ${platform.name}:`, error);
    return { success: false, error: error.message };
  }
}


chrome.action.onClicked.addListener(async (tab) => {
  console.info(`[Background] Extension icon clicked on tab ${tab.id}, URL: ${tab.url}`);

  let platform = getPlatformFromUrl(tab.url);
  if (!platform) {
    console.warn('[Background] Unsupported platform or invalid URL:', tab.url);
    return;
  }

  const analysisResult = await handleVideoPageAnalysis(tab, platform);
  console.debug(`[Background] Video analysis completed for ${platform.name}:`, analysisResult);
});


chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.debug('[Background] Message received:', message);
  const { action, platformName, tabUrl } = message;
  
  if (action === 'buttonClicked' && platformName && sender.tab) {
    console.info(`[Background] Page button clicked for platform: ${platformName}`);
    
    const platform = Object.values(PLATFORMS).find(p => p.name === platformName);
    if (!platform) {
      console.warn('[Background] Unsupported platform:', platformName);
      sendResponse({ success: false, error: 'Unsupported platform' });
      return true;
    }
    
    const analysisResult = await handleVideoPageAnalysis(sender.tab, platform);
    sendResponse(analysisResult);
    return true;
  }
  
  return false;
});

console.info('[Background] Background script loaded and initialized');
