const fs = require('fs');
const path = require('path');
const endpoint = process.env.API_URL || 'http://localhost:3000/api/submit-form';

async function main() {
  try {
    const payloadPath = path.join(__dirname, 'payload_full_front.json');
    const raw = fs.readFileSync(payloadPath, 'utf8');
    const payload = JSON.parse(raw);

    console.log('Enviando payload completo para', endpoint);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    try {
      console.log('HTTP', res.status, res.statusText);
      console.log('Resposta:', JSON.parse(text));
    } catch (e) {
      console.log('Resposta (não-JSON):', text);
    }
  } catch (err) {
    console.error('Erro:', err.message || err);
  }
}

main();
