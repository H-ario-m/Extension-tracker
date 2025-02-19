let activeTab = null;
let startTime = null;

function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function updateTimeTracking() {
  if (activeTab && startTime) {
    const now = Date.now();
    const elapsed = now - startTime;
    const domain = getDomain(activeTab.url);

    if (domain) {
      chrome.storage.local.get(['siteTimes', 'siteLimits'], (data) => {
        const siteTimes = data.siteTimes || {};
        siteTimes[domain] = (siteTimes[domain] || 0) + elapsed;
        chrome.storage.local.set({ siteTimes });

        checkTimeLimit(domain, siteTimes[domain], data.siteLimits[domain]);
      });
    }
    startTime = now;
  }
}

function checkTimeLimit(domain, timeSpent, timeLimit) {
  if (timeLimit && timeSpent >= timeLimit) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'BLOCK_SITE'
      });
    });
  }
}

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  updateTimeTracking();
  const tab = await chrome.tabs.get(tabId);
  activeTab = tab;
  startTime = Date.now();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    updateTimeTracking();
    activeTab = tab;
    startTime = Date.now();
  }
});
setInterval(updateTimeTracking, 1000);
