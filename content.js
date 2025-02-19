chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'BLOCK_SITE') {
      blockSite();
    }
  });
  
  function blockSite() {
    document.body.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #f3f4f6;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: Arial, sans-serif;
      ">
        <div style="
          text-align: center;
          padding: 2rem;
          background: white;
          border-radius: 1rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          max-width: 600px;
        ">
          <h1 style="color: #ef4444; font-size: 2rem;">Time Limit Reached</h1>
          <p style="color: #4b5563; font-size: 1.25rem;">
            You've reached your time limit for this website.
          </p>
          <p style="color: #6b7280;">Take a break and come back later!</p>
        </div>
      </div>
    `;
  }
  
  const domain = window.location.hostname;
  chrome.storage.local.get(['siteTimes', 'siteLimits'], (data) => {
    const siteTimes = data.siteTimes || {};
    const siteLimits = data.siteLimits || {};
    if (siteLimits[domain] && siteTimes[domain] >= siteLimits[domain]) {
      blockSite();
    }
  });
