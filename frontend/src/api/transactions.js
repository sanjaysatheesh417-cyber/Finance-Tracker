const API_BASE_URL = 'http://localhost:8007';

export async function getTransactions() {
    const response = await fetch(`${API_BASE_URL}/FinanceTracker/transactions`);

    if (!response.ok) {
        throw new Error('Could not load transactions');
    }
    return response.json();
}