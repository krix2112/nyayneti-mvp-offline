const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

/**
 * NyayNeti API Client
 */
export const apiClient = {
    /**
     * Check system health and and model status
     */
    async getStatus() {
        const res = await fetch(`${API_BASE_URL}/status`);
        return res.json();
    },

    /**
     * Upload a PDF document
     */
    async uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData,
        });
        return res.json();
    },

    /**
     * Answer a legal question using RAG
     */
    async query(question) {
        const res = await fetch(`${API_BASE_URL}/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question }),
        });
        return res.json();
    },

    /**
     * List all indexed documents
     */
    async listDocuments() {
        const res = await fetch(`${API_BASE_URL}/documents`);
        return res.json();
    },

    /**
     * Summarize a document
     */
    async summarize(docId) {
        const res = await fetch(`${API_BASE_URL}/summary`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ doc_id: docId }),
        });
        return res.json();
    }
};
