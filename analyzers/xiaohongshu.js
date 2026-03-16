const PLATFORM_NAME = "xiaohongshu";
const BUTTON_ATTRIBUTE = "data-grabclip-button";

const PLATFORM_INFO = {
  name: PLATFORM_NAME,
  displayName: "Xiaohongshu",
  domains: ["xiaohongshu.com"],
  needCookie: false,
  analyzer: null,
};

// Button configuration constants
const PARAMS = {
  NORMAL: {
    size: "36px",
    svgSize: "24px",
    margin: {
      top: "0px",
      right: "0px",
      bottom: "0px",
      left: "0px",
    },
  },
  MINI: {
    size: "20px",
    svgSize: "12px",
    margin: {
      top: "5px",
      right: "5px",
      bottom: "5px",
      left: "5px",
    },
  },
};



class XiaohongshuAnalyzer extends window.BaseAnalyzer {
  constructor() {
    super(PLATFORM_NAME);
    this.observer = null;
  }


  extractVideoPageInfo(button=null) {
    let curPageUrl = window.location.href;

    if (this.isVideoPageUrl(curPageUrl)) {
      console.debug(`[${PLATFORM_NAME}] Current page is video page, URL: ${curPageUrl}`);
      return {
        platform: PLATFORM_NAME,
        url: curPageUrl
      };
    }

    if (!button) {
      console.warn(`[${PLATFORM_NAME}] Button not provided, cannot extract URL from feed list page`);
      return null;
    }
    
    return {
      platform: PLATFORM_NAME,
      url: curPageUrl
    };
  }


  isVideoPageUrl(url) {
    try {
      const selectors = [
        '#noteContainer video',
      ];

      for (const selector of selectors) {
        const videoElement = document.querySelector(selector);
        if (videoElement) {
          // Found a video element, consider it a video page
          console.debug(`[${PLATFORM_NAME}] Video element found on detail page, URL: ${url}`);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error(`[${PLATFORM_NAME}] Error checking video detail page:`, error);
      return false;
    }
  }

 
  addGrabClipButtonToContainer() {
    console.debug(`[${PLATFORM_NAME}] Adding button to container`);
    
    const buttonContainer = document.querySelector('#noteContainer div[class*="buttons"]');
    if (!buttonContainer) {
      console.debug(`[${PLATFORM_NAME}] Button container element not found on video page`);
      return false;
    } 

    if (buttonContainer.querySelector(`button[${BUTTON_ATTRIBUTE}]`)) {
      console.debug(`[${PLATFORM_NAME}] GrabClip button already exists on video page`);
      return true;
    }

    const button = this.createGrabClipButton(PLATFORM_INFO, PARAMS.MINI);
    buttonContainer.insertBefore(button, buttonContainer.firstChild);
    console.info(`[${PLATFORM_NAME}] Successfully added GrabClip button to video page`);
    return true;
  }

  
  addGrabClipButton() {
    console.debug(`[${PLATFORM_NAME}] Starting addGrabClipButton`);

    try {
      const url = window.location.href;
      console.debug(`[${PLATFORM_NAME}] Current URL: ${url}`);
      
      if (this.isVideoPageUrl(url)) {
        console.debug(`[${PLATFORM_NAME}] Detected video page`);
        return this.addGrabClipButtonToContainer();
      }
      else {
        console.debug(`[${PLATFORM_NAME}] Not a supported ${PLATFORM_NAME} video page, skipping button addition`);
      }  
    } catch (error) {
      console.error(`[${PLATFORM_NAME}] Error adding GrabClip button:`, error);
    }

    return false;
  }

  insertDownloadButton() {
    console.info(`[${PLATFORM_NAME}] Initializing insertDownloadButton`);

    this.addGrabClipButton();

    this.configureObserver({
      selectors: [
        'div[class*="buttons"]',
        'video',
      ],
    });

    this.initMutationObserver();
    console.info(`[${PLATFORM_NAME}] Mutation observer initialized`);
  }
}

PLATFORM_INFO.analyzer = XiaohongshuAnalyzer;
window.PLATFORMS = {
  ...window.PLATFORMS,
  [PLATFORM_NAME]: PLATFORM_INFO,
};
console.info(`[${PLATFORM_NAME}] Analyzer module loaded and registered`);
