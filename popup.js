document.addEventListener('DOMContentLoaded', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const domain = new URL(tab.url).hostname;
    document.getElementById('currentSite').textContent = `Current site: ${domain}`;
  
    chrome.storage.local.get(['siteLimits', 'siteTimes'], (data) => {
      const { siteLimits = {}, siteTimes = {} } = data;
      const timeSpent = siteTimes[domain] || 0;
      const timeLimit = siteLimits[domain] || 0;
  
      if (timeLimit > 0) {
        const hours = Math.floor(timeLimit / (60 * 60 * 1000));
        const minutes = Math.floor((timeLimit % (60 * 60 * 1000)) / (60 * 1000));
        document.getElementById('hours').value = hours;
        document.getElementById('minutes').value = minutes;
      }
  
      updateTimerDisplay(timeLimit, timeSpent);
      setInterval(() => {
        chrome.storage.local.get(['siteTimes'], (data) => {
          const updatedTimeSpent = data.siteTimes[domain] || 0;
          updateTimerDisplay(timeLimit, updatedTimeSpent);
        });
      }, 1000);
    });
  
    document.getElementById('saveLimit').addEventListener('click', () => {
      const hours = parseInt(document.getElementById('hours').value) || 0;
      const minutes = parseInt(document.getElementById('minutes').value) || 0;
      const timeLimit = (hours * 60 * 60 * 1000) + (minutes * 60 * 1000);
  
      if (timeLimit > 0) {
        chrome.storage.local.get(['siteLimits'], (data) => {
          const siteLimits = data.siteLimits || {};
          siteLimits[domain] = timeLimit;
          chrome.storage.local.set({ siteLimits }, () => {
            alert('Time limit saved successfully!');
          });
        });
      } else {
        alert('Please enter a valid time limit');
      }
    });
  });
  
  function updateTimerDisplay(limit, spent) {
    const remaining = Math.max(0, limit - spent);
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
  
    document.getElementById('timer').textContent = 
      `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
