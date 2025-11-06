// Database Manager usando IndexedDB
class DatabaseManager {
    constructor() {
        this.dbName = 'PLI2050_Database';
        this.version = 1;
        this.db = null;
    }

    // Inicializar banco de dados
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                reject('Erro ao abrir banco de dados');
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Criar object store para respostas
                if (!db.objectStoreNames.contains('respostas')) {
                    const objectStore = db.createObjectStore('respostas', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    
                    // Criar índices
                    objectStore.createIndex('nomeEmpresa', 'nomeEmpresa', { unique: false });
                    objectStore.createIndex('dataEntrevista', 'dataEntrevista', { unique: false });
                    objectStore.createIndex('produtoPrincipal', 'produtoPrincipal', { unique: false });
                }
            };
        });
    }

    // Salvar resposta
    async saveResposta(data) {
        return new Promise((resolve, reject) => {
            // Adicionar timestamp
            data.dataEntrevista = new Date().toISOString();
            
            const transaction = this.db.transaction(['respostas'], 'readwrite');
            const objectStore = transaction.objectStore('respostas');
            const request = objectStore.add(data);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject('Erro ao salvar resposta');
            };
        });
    }

    // Obter todas as respostas
    async getAllRespostas() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['respostas'], 'readonly');
            const objectStore = transaction.objectStore('respostas');
            const request = objectStore.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject('Erro ao carregar respostas');
            };
        });
    }

    // Obter resposta por ID
    async getRespostaById(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['respostas'], 'readonly');
            const objectStore = transaction.objectStore('respostas');
            const request = objectStore.get(id);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject('Erro ao carregar resposta');
            };
        });
    }

    // Atualizar resposta
    async updateResposta(id, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['respostas'], 'readwrite');
            const objectStore = transaction.objectStore('respostas');
            
            // Manter o ID original
            data.id = id;
            data.dataAtualizacao = new Date().toISOString();
            
            const request = objectStore.put(data);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject('Erro ao atualizar resposta');
            };
        });
    }

    // Deletar resposta
    async deleteResposta(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['respostas'], 'readwrite');
            const objectStore = transaction.objectStore('respostas');
            const request = objectStore.delete(id);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject('Erro ao deletar resposta');
            };
        });
    }

    // Deletar todas as respostas
    async deleteAllRespostas() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['respostas'], 'readwrite');
            const objectStore = transaction.objectStore('respostas');
            const request = objectStore.clear();

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject('Erro ao limpar banco de dados');
            };
        });
    }

    // Contar total de respostas
    async countRespostas() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['respostas'], 'readonly');
            const objectStore = transaction.objectStore('respostas');
            const request = objectStore.count();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject('Erro ao contar respostas');
            };
        });
    }
}

// Instância global do gerenciador de banco de dados
const dbManager = new DatabaseManager();
