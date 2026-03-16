
function getPlatformByUrl(url) {
  if (!url || !url.startsWith('http')) {
    console.error(`[Content] Invalid URL: ${url}`);
    return null;
  }

  try {
    const hostname = new URL(url).hostname.toLowerCase();
    for (const platform of Object.values(window.PLATFORMS)) {
      if (platform.domains.some(domain => 
        hostname === domain || hostname.endsWith(`.${domain}`)
      )) {
        console.debug(`[Content] Platform found for URL ${url}: ${platform.name}`);
        return platform;
      }
    }
    console.warn(`[Content] No platform found for URL: ${url}`);
    return null;
  } catch (error) {
    console.error(`[Content] Error parsing URL ${url}:`, error);
    return null;
  }
}


function getAnalyzerForPlatformAnalyzer(platformName) {
  if (!platformName) {
    console.error("[Content] Platform name is required");
    return null;
  }

  const platform = window.PLATFORMS[platformName];
  if (!platform || !platform.analyzer) {
    console.error(`[Content] No analyzer found for platform: ${platformName}`);
    return null;
  }
  console.debug(`[Content] Analyzer found for platform: ${platformName}`);
  return new platform.analyzer();
}


function initializeExtension() {
  console.info('[Content] Starting extension initialization');
  
  const platform = getPlatformByUrl(window.location.href);
  if (!platform) {
    console.debug("[Content] Unsupported platform or URL, initialization skipped");
    return;
  }
  if (!platform.analyzer) {
    console.error(`[Content] No analyzer found for platform: ${platform.name}`);
    return null;
  }
  
  const analyzer = new platform.analyzer();
  console.info(`[Content] Extension initialized for platform: ${platform.name}`);

  if (document.readyState === "loading") {
    console.debug('[Content] Document still loading, waiting for DOMContentLoaded');
    document.addEventListener("DOMContentLoaded", () => {
      console.debug(`[Content] DOMContentLoaded fired, inserting download button for ${platform.name}`);
      analyzer.insertDownloadButton();
    });
  } else {
    console.debug(`[Content] Document already loaded, inserting download button immediately for ${platform.name}`);
    analyzer.insertDownloadButton();
  }
}

initializeExtension();


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.debug('[Content] Message received from background:', message);
  const { platformName, action } = message;

  switch (action) {
    case "extractVideoPageInfo":
      console.debug(`[Content] Handling extractVideoPageInfo request for ${platformName}`);
      extractVideoPageInfo(platformName, sendResponse);
      break;

    default:
      console.warn("[Content] Unknown message type received:", action);
      sendResponse({ success: false, error: "Unknown message type" });
  }

  return true;
});


function extractVideoPageInfo(platformName, sendResponse) {
  console.debug(`[Content] Extracting video page info for platform: ${platformName}`);
  
  try {
    const analyzer = getAnalyzerForPlatformAnalyzer(platformName);
    if (!analyzer) {
      console.error(`[Content] Cannot extract video info: no analyzer for ${platformName}`);
      sendResponse({
        success: false,
        error: `Unsupported platform: ${platformName}`,
      });
      return;
    }

    const videoPageInfo = analyzer.extractVideoPageInfo();
    console.debug(`[Content] Video page info extracted for ${platformName}:`, videoPageInfo);
    
    if (videoPageInfo !== null) {
      sendResponse({
        success: true,
        data: videoPageInfo,
      });
      console.info(`[Content] Successfully sent video page info for ${platformName}`);
    } else {
      console.warn(`[Content] No video info found for ${platformName}`);
      sendResponse({
        success: false,
        error: "No video info found",
      });
    }
  } catch (error) {
    console.error(`[Content] Error extracting video page info for ${platformName}:`, error.message);
    sendResponse({
      success: false,
      error: error.message,
    });
  }
}

console.info('[Content] Content script loaded and initialized');
