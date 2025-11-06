// Wrapper para iniciar o servidor e gravar o PID do processo Node em um arquivo
const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const pidFile = path.join(repoRoot, 'scripts', 'backend.node.pid');

try {
  fs.writeFileSync(pidFile, String(process.pid), { encoding: 'utf8' });
  console.log(`PID do Node gravado em: ${pidFile} -> ${process.pid}`);
} catch (err) {
  console.error('Falha ao gravar arquivo PID:', err.message || err);
}

// Executar o servidor principal (server.js) no mesmo processo
try {
  require('./server.js');
} catch (err) {
  console.error('Erro ao iniciar server.js via wrapper:', err.stack || err);
  process.exit(1);
}
