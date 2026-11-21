import { attachClipboardStubToView } from "@testing-library/user-event/dist/cjs/utils/index.js";

const API_BASE_URL = 'http://localhost:8007';

const TRANSACTION_URL = `${API_BASE_URL}/FinanceTracker/transactions`;
const CATEGORIES_URL = `${API_BASE_URL}/categories`;
const MONTHLY_CATEGORY_SPENDING_URL = `${API_BASE_URL}/reports/monthly/category-spending`
const BUDGETS_URL = `${API_BASE_URL}/budgets`

function normalizeTransaction(transaction) {
    return {
        ...transaction,
        amount: Number(transaction.amount)
    };
}

async function readResponse(response) {
    if (!response.ok) {
        let message = `Request failed (${response.status})`
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
    const response = await fetch(TRANSACTION_URL)
    const data = await readResponse(response)
    
    return data.map(normalizeTransaction)
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
    return normalizeTransaction(savedTransaction)
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

export async function createCategory(category) {
    const response = await fetch (CATEGORIES_URL, {
        method: 'POST',
        headers: { 'Content-Type' : 'application/json'},
        body: JSON.stringify(category)
    }
    )
    return await readResponse(response)
}

export async function getCategories() {
    const response = await fetch (CATEGORIES_URL)
    return await readResponse(response)
}

export async function deleteCategory(categoryId) {
    const response = await fetch(`${CATEGORIES_URL}/${categoryId}`, {
        method: 'DELETE'
    })
    return await readResponse(response)
}

export async function getMonthlyCategorySpending(year, month) {
    const params = new URLSearchParams({
        year: String(year),
        month: String(month)
    })
    const response = await fetch(
        `${MONTHLY_CATEGORY_SPENDING_URL}?${params.toString()}`
    )
    return await readResponse(response)
}

export async function getBudgets(year, month) {
    const params = new URLSearchParams({
        year: String(year),
        month: String(month)
    })
    const response = await fetch(`${BUDGETS_URL}?${params.toString()}`)
    return await readResponse(response)
}

export async function createBudget(budget) {
    const response = await fetch(BUDGETS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budget)
    })

    return await readResponse(response)
}

export async function updateBudget(budgetId, budget) {
    const response = await fetch(`${BUDGETS_URL}/${budgetId}`,{
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budget)
    })
    return await readResponse(response)
}