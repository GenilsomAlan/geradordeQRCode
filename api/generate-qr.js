// Serverless Function para Vercel (api/generate-qr.js)
const qrcode = require('qrcode');

/**
 * Endpoint para gerar o QR Code no servidor e retornar o Data URL.
 * O código de geração (aqui) é privado e não é baixado pelo navegador do cliente.
 */
module.exports = async (req, res) => {
    // Define o cabeçalho para permitir qualquer origem (CORS), útil para testes locais ou subdomínios
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    }

    const { content, color, bgColor, size, errorCorrection } = req.body;

    if (!content) {
        return res.status(400).json({ error: 'Content field is required.' });
    }

    const options = {
        color: {
            dark: color || '#000000',
            light: bgColor || '#ffffff'
        },
        errorCorrectionLevel: errorCorrection || 'M',
        width: parseInt(size) || 256
    };

    try {
        // 🔒 Executa a lógica de geração do QR Code
        // Gera o QR code como Data URL (PNG)
        const url = await qrcode.toDataURL(content, options);
        
        // Retorna a imagem pronta (Data URL) para o Front-end
        res.status(200).json({ imageUrl: url });
        
    } catch (err) {
        console.error('Error generating QR code in Vercel function:', err);
        res.status(500).json({ error: 'Failed to generate QR code on the serverless function.' });
    }
};