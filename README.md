# Xiaohongshu Video Parser Extension (Chrome)

A lightweight, open-source Chrome extension that helps users send Xiaohongshu video page URLs to GrabClip for link analysis, parsed result viewing, and optional watermark-free video download.
[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Available-4285F4?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/xiaohongshu-video-parser/gjmfhcacjdcdohchonnhhigohehioikg)

This project is designed with a minimal architecture and a clear separation between the browser extension and the web-based processing workflow.

## Introduction

This Chrome extension helps users work more efficiently with Xiaohongshu video pages by extracting the current page URL and sending it to GrabClip.

On GrabClip, users can analyze the video link, view the parsed result, and choose whether to download the watermark-free video.

The extension itself does not download or process media files locally.
It serves as a lightweight bridge between Xiaohongshu video pages and the GrabClip web-based parsing workflow.

The goal of this project is to provide a clean, permission-minimized browser extension architecture for Xiaohongshu video link analysis and download workflows.

## Features

- Parse Xiaohongshu video page URLs
- Send the current Xiaohongshu video page URL to GrabClip
- Open a new tab to the GrabClip parsing page
- Support user-triggered actions from both:
  - the browser toolbar icon
  - the contextual button injected into supported Xiaohongshu pages
- Let users analyze video links on GrabClip
- Let users view parsed results on GrabClip
- Let users choose to download watermark-free videos on GrabClip
- Minimal permissions and lightweight implementation
- Clear separation between extension logic and web processing
- No local storage of user data or browsing history

## Installation

### Manual Installation (Developer Mode)

This extension can be installed locally for development or evaluation purposes:

1. Download this repository (Click **Code** → **Download ZIP**) and unzip it.
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked**
5. Select the unzipped project folder
6. The extension will appear in your browser toolbar

## Usage

1. Open any supported Xiaohongshu video page in your browser.

2. Start the parsing process in either of the following ways:

   - Click the extension icon in the browser toolbar, or
   - Click the parse button added by the extension directly on the Xiaohongshu page

3. The extension will automatically open a new tab to the GrabClip Xiaohongshu parsing page.

4. On that page, GrabClip will analyze the video link, display the parsed result, and allow the user to choose whether to download the watermark-free video.

The extension serves as a convenient entry point from Xiaohongshu, while link analysis, result display, and download options are provided on GrabClip.

## Notes

- The extension only activates on supported Xiaohongshu pages
- No media files are downloaded or processed directly by the extension
- Video link analysis, parsed result display, and optional watermark-free video download are handled on GrabClip
- The extension does not track or store personal data
- If Xiaohongshu changes its page structure, selectors may need to be updated

## Project Structure

```text
xiaohongshu-video-parser-extension/
├── analyzers/              # Parsing logic modules
├── background.js           # Background service worker
├── content.js              # Injects parse button into Xiaohongshu pages
├── icons/                  # Extension icons
├── _locales/               # Internationalization messages
├── manifest.json           # Chrome extension configuration
└── README.md               # Project documentation
```
## Privacy Policy

This project respects user privacy.

- No personal data is collected or stored
- No browsing history is tracked
- The extension operates only on supported video pages
- Processing is triggered only by explicit user interaction

For more details, please review the Privacy Policy:

`https://www.grabclip.com/privacy_policy`

## Contributing

Contributions are welcome and appreciated.

If you’d like to contribute to this project, please follow these steps:

1. Fork the repository

2. Create a new branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes

4. Commit your changes with a clear message

5. Push your branch to your fork

6. Open a Pull Request

Suggested contribution areas include:

- Code improvements and refactoring
- Bug fixes
- Documentation updates
- Localization and translations

## License

This project is licensed under the MIT License.  
See the `LICENSE` file for details.

## Disclaimer

This project is not affiliated with, endorsed by, or sponsored by Xiaohongshu.

It is intended for educational and technical demonstration purposes only. Users are responsible for ensuring compliance with applicable laws and platform terms of service.

## About

A lightweight Chrome extension that sends Xiaohongshu video page URLs to GrabClip for link analysis, parsed result viewing, and optional watermark-free video download.