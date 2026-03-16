class BaseAnalyzer {
  constructor(platformName) {
    if (new.target === BaseAnalyzer) {
      throw new Error("Cannot instantiate abstract class BaseAnalyzer");
    }
    this.platformName = platformName;
    this.observer = null;
    this.observerConfig = {
      selectors: [],
      checkElementAdded: null
    };
  }

  
  /**
   * Extract video info from page
   */
  extractVideoPageInfo(button=null)  {
    throw new Error("Subclass must implement extractVideoPageInfo method");
  }

  addGrabClipButton() {
    throw new Error("Subclass must implement addGrabClipButton method");
  }


  getLangCode() {
    const supportLangCodes = ["zh", "en", "bn", "cs", "de", "es", "ru", "it", "ms", "nl", "fr", "tl", "id", "vi", "pt", "pl", "tr", "uk", "fa", "hi", "lo", "my", "th", "ja", "ko", "zh-HK"];
    let uiLanguage = navigator.language || "en";

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

  
  /**
   * Handle click event for GrabClip button
   */
  async handleGrabClipButtonClick(platform, button=null) {
    try {
      console.info(`[${this.platformName}] GrabClip button clicked`);
      
      const videoPageInfo = this.extractVideoPageInfo(button);
      if (videoPageInfo && videoPageInfo.url) {
        console.debug(`[${this.platformName}] Video page info extracted:`, videoPageInfo);

        const langCode = this.getLangCode();

        let targetUrl = `https://grabclip.com/${platform.name}/${langCode}/?url=${encodeURIComponent(videoPageInfo.url)}`;

        if (platform.needCookie) {
          const urlParams = [];
          const cookieDataKey = `cookieData_${platform.name}`;
          const cookieData = await chrome.storage.local.get([cookieDataKey]);
          const storageCookieDict = cookieData[cookieDataKey]?.cookies || {};

          if (storageCookieDict && Object.keys(storageCookieDict).length > 0) {
            platform.cookieKeys.forEach((element) => {
              if (storageCookieDict[element.name]) {
                urlParams.push(
                  `${element.paramName}=${encodeURIComponent(
                    storageCookieDict[element.name]
                  )}`
                );
              }
            });
          }
          
          if (urlParams.length > 0) {
            targetUrl += `&${urlParams.join("&")}`;
            console.debug(`[${this.platformName}] Added ${urlParams.length} cookie parameters to URL`);
          }
        }
        
        console.info(`[${this.platformName}] Opening GrabClip in new tab: ${targetUrl}`);
        window.open(targetUrl, "_blank");
      } else {
        console.warn(`[${this.platformName}] Failed to extract video page info`);
      }
    } catch (error) {
      console.error(`[${this.platformName}] Error handling GrabClip button click:`, error);
    }
  }

  /**
   * Configure DOM observer options
   * @param {Object} config - Observer configuration
   * @param {Array<string>} config.selectors - List of CSS selectors to observe
   * @param {Function} config.checkElementAdded - Custom check function to determine if button should be added
   */
  configureObserver(config) {
    if (config.selectors) {
      this.observerConfig.selectors = config.selectors;
      console.debug(`[${this.platformName}] Configured observer with ${config.selectors.length} selectors`);
    }
    if (config.checkElementAdded) {
      this.observerConfig.checkElementAdded = config.checkElementAdded;
    }
  }

  /**
   * Initialize MutationObserver to listen for DOM changes
   */
  initMutationObserver() {
    if (this.observer) {
      this.observer.disconnect();
      console.debug(`[${this.platformName}] Disconnected existing mutation observer`);
    }

    const observerOptions = {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false
    };

    this.observer = new MutationObserver((mutationsList) => {
      for (let mutation of mutationsList) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          let shouldAddButtons = false;
          
          for (let node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const selectorMatch = this.observerConfig.selectors.some(selector => {
                return node.matches(selector) || node.querySelector(selector);
              });
              
              const customCheckMatch = this.observerConfig.checkElementAdded 
                ? this.observerConfig.checkElementAdded(node) 
                : false;
              
              if (selectorMatch || customCheckMatch) {
                shouldAddButtons = true;
                break;
              }
            }
          }
          
          if (shouldAddButtons) {
            console.debug(`[${this.platformName}] DOM mutation detected, re-adding buttons`);
            this.addGrabClipButton();
          }
        }
      }
    });

    this.observer.observe(document.body, observerOptions);
    console.debug(`[${this.platformName}] Mutation observer started watching document body`);
  }

  /**
   * Create the GrabClip button element
   * @returns {HTMLButtonElement} The created button element
   */
  createGrabClipButton(platform, param = {}) {
    param = param || {};
    param.size = param.size || "36px";
    param.svgSize = param.svgSize || "24px";

    param.margin = param.margin || {};
    param.margin.top = param.margin.top || "0px";
    param.margin.right = param.margin.right || "0px";
    param.margin.bottom = param.margin.bottom || "0px";
    param.margin.left = param.margin.left || "0px";

    const BUTTON_ATTRIBUTE = "data-grabclip-button";
    const BUTTON_COLORS = {
      DEFAULT: "#1296db",
      HOVER: "#70c1e6",
    };

    const button = document.createElement("button");
    button.type = "button";
    button.ariaLabel = "Grabclip";
    button.setAttribute(BUTTON_ATTRIBUTE, "true");
    button.style.cssText = `
      background-color: ${BUTTON_COLORS.DEFAULT};
      border: none;
      border-radius: 50%;
      margin: ${param.margin.top} ${param.margin.right} ${param.margin.bottom} ${param.margin.left};
      width: ${param.size};
      height: ${param.size};
      padding: 0;
      cursor: pointer;

      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    `;
    // display: flex;
    
    const span = document.createElement("span");
    span.style.cssText =
      "color: white; display: flex; align-items: center; justify-content: center;";

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("height", param.svgSize);
    svg.setAttribute("width", param.svgSize);
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("fill", "white");
    svg.setAttribute("version", "1.1");
    svg.setAttribute("viewBox", "0 0 1024 1024");
    svg.setAttribute("class", "icon");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      "M822.08 864h-576a64 64 0 1 0 0 128h576a64 64 0 0 0 0-128zM480 753.28a103.36 103.36 0 0 0 106.24 0 953.6 953.6 0 0 0 294.08-294.08A103.36 103.36 0 1 0 704 352a704 704 0 0 1-49.6 67.84l-23.36-298.24a96 96 0 0 0-193.92 0l-23.36 300.16A564.8 564.8 0 0 1 364.16 352a103.36 103.36 0 1 0-177.28 106.56A953.92 953.92 0 0 0 480 753.28z"
    );

    svg.appendChild(path);
    span.appendChild(svg);
    button.appendChild(span);

    button.addEventListener("mouseenter", () => {
      button.style.backgroundColor = BUTTON_COLORS.HOVER;
    });

    button.addEventListener("mouseleave", () => {
      button.style.backgroundColor = BUTTON_COLORS.DEFAULT;
    });

    button.addEventListener("click", () =>
      this.handleGrabClipButtonClick(platform, button)
    );
    
    return button;
  }
}

window.BaseAnalyzer = BaseAnalyzer;
console.info(`[Base] BaseAnalyzer class loaded and registered`);
