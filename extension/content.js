let lunaContainer = null;
let lunaIframe = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "translateText") {
    const textToTranslate = request.text;

    if (!lunaContainer) {
      createLunaOverlay();
    } else {
      lunaContainer.style.display = 'block';
    }

    // Wait a brief moment to ensure iframe is loaded if just created
    setTimeout(() => {
      lunaIframe.contentWindow.postMessage(
        {
          type: 'TRANSLATE_TEXT',
          text: textToTranslate,
          signLanguage: 'gisl'
        },
        '*' // In production, restrict this to the specific SAMAVESH URL
      );
    }, 500); // 500ms delay to give iframe time to initialize
  }
});

function createLunaOverlay() {
  // Create wrapper
  lunaContainer = document.createElement('div');
  lunaContainer.id = 'samavesh-luna-overlay';
  
  // Create Header with close button
  const header = document.createElement('div');
  header.className = 'samavesh-luna-header';
  
  const title = document.createElement('span');
  title.innerText = 'SAMAVESH Translator';
  
  const closeBtn = document.createElement('button');
  closeBtn.innerText = '✖';
  closeBtn.title = 'Close';
  closeBtn.onclick = () => {
    lunaContainer.style.display = 'none';
  };

  header.appendChild(title);
  header.appendChild(closeBtn);

  // Create iframe
  lunaIframe = document.createElement('iframe');
  lunaIframe.src = 'http://localhost:8000/extension.html';
  lunaIframe.className = 'samavesh-luna-iframe';
  lunaIframe.allow = "autoplay; fullscreen"; // Needed for avatar rendering
  
  // Assemble
  lunaContainer.appendChild(header);
  lunaContainer.appendChild(lunaIframe);
  
  document.body.appendChild(lunaContainer);
}
