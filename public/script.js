// Front-end Script (public/script.js)

document.addEventListener('DOMContentLoaded', function() {
    // 1. Load saved settings if available
    const savedSettings = localStorage.getItem('qrGeneratorSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        document.getElementById('qr-content').value = settings.content || 'https://vercel.com';
        document.getElementById('qr-color').value = settings.color || '#000000';
        document.getElementById('bg-color').value = settings.bgColor || '#ffffff';
        document.getElementById('qr-size').value = settings.size || '256';
        document.getElementById('qr-error-correction').value = settings.errorCorrection || 'M';
    }
    
    // Gerar QR code no carregamento inicial
    if (document.getElementById('qr-content').value) {
        generateQRCode();
    }

    // 2. Event Listeners
    document.getElementById('generate-btn').addEventListener('click', generateQRCode);
    document.getElementById('clear-btn').addEventListener('click', clearContent);
    document.getElementById('download-png').addEventListener('click', downloadPNG);
    document.getElementById('save-settings').addEventListener('click', saveSettings);

    // 3. Funções de Comunicação com o Servidor
    async function generateQRCode() {
        const content = document.getElementById('qr-content').value.trim();
        
        if (!content) {
            alert('Please enter some content to generate a QR code');
            return;
        }

        const qrCodeElement = document.getElementById('qr-code');
        qrCodeElement.innerHTML = '<p class="text-gray-400 text-center">Generating...</p>'; // Estado de carregamento

        const settingsToSend = {
            content: content,
            color: document.getElementById('qr-color').value,
            bgColor: document.getElementById('bg-color').value,
            size: document.getElementById('qr-size').value,
            errorCorrection: document.getElementById('qr-error-correction').value
        };

        try {
            // Chama a Serverless Function através do endpoint /api/generate-qr
            const response = await fetch('/api/generate-qr', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settingsToSend)
            });

            const data = await response.json();

            if (!response.ok || data.error) {
                 const errorMessage = data.error || `HTTP Error: ${response.status} ${response.statusText}`;
                 qrCodeElement.innerHTML = `<p class="text-red-500 text-center">Error: ${errorMessage}</p>`;
                 return;
            }
            
            if (data.imageUrl) {
                // Recebe a imagem pronta (Data URL) e a exibe
                qrCodeElement.innerHTML = `<img src="${data.imageUrl}" alt="QR Code">`;
            } else {
                qrCodeElement.innerHTML = '<p class="text-red-500 text-center">Server returned an unexpected response.</p>';
            }

        } catch (error) {
            console.error('Fetch error:', error);
            qrCodeElement.innerHTML = '<p class="text-red-500 text-center">Connection error. Could not reach Vercel function.</p>';
        }
    }

    // 4. Funções Auxiliares
    function downloadPNG() {
        const qrImg = document.querySelector('#qr-code img');
        if (qrImg && qrImg.src.startsWith('data:image/png')) {
            const link = document.createElement('a');
            link.href = qrImg.src;
            link.download = 'qr-code.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert('Please generate a QR code first.');
        }
    }

    function clearContent() {
        document.getElementById('qr-content').value = '';
        document.getElementById('qr-code').innerHTML = '<p class="text-gray-400 text-center">Your QR code will appear here</p>';
    }

    function saveSettings() {
        const settings = {
            content: document.getElementById('qr-content').value,
            color: document.getElementById('qr-color').value,
            bgColor: document.getElementById('bg-color').value,
            size: document.getElementById('qr-size').value,
            errorCorrection: document.getElementById('qr-error-correction').value
        };
        localStorage.setItem('qrGeneratorSettings', JSON.stringify(settings));
        
        // Show confirmation
        const btn = document.getElementById('save-settings');
        btn.innerHTML = '<i class="fas fa-check mr-1"></i> Settings saved!';
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-save mr-1"></i> Save current settings';
        }, 2000);
    }
});