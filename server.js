// Servidor Back-end (server.js)
const express = require('express');
const qrcode = require('qrcode');
const path = require('path');

const app = express();
const PORT = 3000;

// Configuração de Middleware
app.use(express.json()); // Permite que o Express leia o corpo das requisições JSON
app.use(express.static(path.join(__dirname, 'public'))); // Serve arquivos estáticos da pasta 'public'

// Endpoint PRIVADO para gerar o QR Code
app.post('/generate-qr', async (req, res) => {
    // 1. Recebe os parâmetros do Front-end
    const { content, color, bgColor, size, errorCorrection } = req.body;

    if (!content) {
        return res.status(400).json({ error: 'Content field is required.' });
    }

    // 2. Define as opções de geração
    const options = {
        color: {
            dark: color || '#000000',
            light: bgColor || '#ffffff'
        },
        errorCorrectionLevel: errorCorrection || 'M',
        // O width no back-end é usado para o DataURL, se o cliente especificar
        width: parseInt(size) || 256
    };

    try {
        // 3. Executa a lógica de geração do QR Code (PRIVADA)
        // Gera o QR code como Data URL (string base64)
        const url = await qrcode.toDataURL(content, options);
        
        // 4. Envia o Data URL da imagem pronta para o Front-end
        res.json({ imageUrl: url });
        
    } catch (err) {
        console.error('Error generating QR code on server:', err);
        res.status(500).json({ error: 'Failed to generate QR code on server.' });
    }
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`QR Code Generator running at http://localhost:${PORT}`);
});