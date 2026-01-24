const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Enhanced error handler for API calls
 */
function handleAPIError(error, context = 'API call') {
    console.error(`${context} failed:`, error);

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend server. Please ensure it is running on port 8000.');
    }

    throw error;
}

/**
 * Wrapper for fetch with timeout and error handling
 */
async function fetchWithTimeout(url, options = {}, timeout = 30000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(id);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
    } catch (error) {
        clearTimeout(id);
        if (error.name === 'AbortError') {
            throw new Error('Request timed out. The server may be processing a large document.');
        }
        throw error;
    }
}

/**
 * NyayNeti API Client - Production Grade
 */
export const apiClient = {
    /**
     * Check if backend is reachable
     */
    async checkHealth() {
        try {
            const res = await fetchWithTimeout(`${API_BASE_URL}/api/health`, {}, 5000);
            return await res.json();
        } catch {
            return { status: 'offline', error: 'Backend not reachable' };
        }
    },

    /**
     * Check system health and model status
     */
    async getStatus() {
        try {
            const res = await fetchWithTimeout(`${API_BASE_URL}/api/status`);
            const data = await res.json();
            return {
                ...data,
                ollama_available: data.model?.ollama_available ?? false,
                indexed_docs_count: data.model?.indexed_docs_count ?? 0,
            };
        } catch (error) {
            handleAPIError(error, 'Status check');
        }
    },

    /**
     * Upload a PDF document
     */
    async uploadFile(file) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetchWithTimeout(`${API_BASE_URL}/api/upload`, {
                method: 'POST',
                body: formData,
            }, 60000); // 60s timeout for large files

            return await res.json();
        } catch (error) {
            handleAPIError(error, 'File upload');
        }
    },

    /**
     * Answer a legal question using RAG
     */
    async query(question) {
        try {
            const res = await fetchWithTimeout(`${API_BASE_URL}/api/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question }),
            }, 120000); // 2min timeout for LLM responses

            return await res.json();
        } catch (error) {
            handleAPIError(error, 'Query');
        }
    },

    /**
     * List all indexed documents
     */
    async listDocuments() {
        try {
            const res = await fetchWithTimeout(`${API_BASE_URL}/api/documents`);
            return await res.json();
        } catch (error) {
            handleAPIError(error, 'List documents');
        }
    },

    /**
     * Summarize a document
     */
    async summarize(docId) {
        try {
            const res = await fetchWithTimeout(`${API_BASE_URL}/api/summary`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ doc_id: docId }),
            }, 60000);

            return await res.json();
        } catch (error) {
            handleAPIError(error, 'Summarize');
        }
    }
};
