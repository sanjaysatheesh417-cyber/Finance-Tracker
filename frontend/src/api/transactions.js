const API_BASE_URL = 'http://localhost:8007';

const TRANSACTION_URL = `${API_BASE_URL}/FinanceTracker/transactions`;

function normalizeTransaction(transaction) {
    return {
        ...transaction,
        amount: Number(transaction.amount)
    };
}

async function readResponse(response) {
    if (!response.ok) {
        let message = `Request failed (${response.status})`;
        try{
            const body = await response.json();
            if (typeof body.detail === 'string') {
                message = body.detail;
            }
        } catch {}
        throw new Error(message);
    }
    return response.json();
}
export async function getTransactions() {
    const response = await fetch(TRANSACTION_URL);
    const data = await readResponse(response);
    
    return data.map(normalizeTransaction);
}

export async function createTransaction(transaction) {
    const response = await fetch(TRANSACTION_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction),
    });
    const savedTransaction = await readResponse(response);
    return normalizeTransaction(savedTransaction);
}

export async function deleteTransaction(id) {
    const response = await fetch(`${TRANSACTION_URL}/${id}`, {
        method: 'DELETE'
    })
    if (!response.ok) {
        throw new Error(`Could not delete transaction (${response.status})`)
    }
    return response.json()
}

export async function updateTransaction(id, transaction) {
    const response = await fetch(`${TRANSACTION_URL}/${id}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(transaction)
    })
    if (!response.ok) {
        throw new Error(`Could not update transaction (${response.status})`)
    }
    const savedTransaction = await response.json()
    return normalizeTransaction(savedTransaction)
}