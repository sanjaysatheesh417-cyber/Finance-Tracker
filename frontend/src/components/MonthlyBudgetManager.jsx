import { useEffect, useState } from "react";
import { getBudgets, createBudget, updateBudget } from "../api/transactions";

export function MonthlyBudgetManager({categories, selectedMonth, spendingByCategory = []}) {
    const [budgets, setBudgets] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [amount, setAmount] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [saveError, setSaveError] = useState('')

    useEffect(() => {
        if (!selectedMonth) return

        let ignoreResult = false
        const [year, month] = selectedMonth.split('-').map(Number)

        async function loadBudgets() {
            setIsLoading(true)
            setError('')
            try {
                const data = await getBudgets(year, month)
                if (!ignoreResult) setBudgets(data)
            } catch (err) {
                if (!ignoreResult) {
                    setError(err instanceof Error ? err.message : 'Could not load budgets')
                }
            } finally {
                if (!ignoreResult) setIsLoading(false)
            }
        }

        loadBudgets()

        return () => {
            ignoreResult = true
        }
    }, [selectedMonth])

    async function handleSubmit(e) {
        e.preventDefault()
        setSaveError('')
        
        const parsedAmount = Number(amount)
        if (!categoryId || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            setSaveError('Choose a category and enter an amount greater than zero.')
            return
        }

        const [year, month] = selectedMonth.split('-').map(Number)
        const selectedCategoryId = Number(categoryId)
        const existing = budgets.find(budget => budget.category_id === selectedCategoryId)

        setIsSaving(true)

        try {
            const savedBudget = existing
            ? await updateBudget(existing.id, {amount: parsedAmount})
            : await createBudget({
                category_id: selectedCategoryId,
                year,
                month,
                amount: parsedAmount
            })
            setBudgets(current => existing ? current.map(budget => 
                budget.id === savedBudget.id ? savedBudget:budget
            ): [...current, savedBudget])
            setAmount('')
        } catch (err) {
            setSaveError(err instanceof Error ? err.message: 'Could not save the budget')
        } finally {
            setIsSaving(false)
        }
    }

    return(
        <section>
            <h2>Budgets</h2>
            <form onSubmit={handleSubmit}>
                <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                required
                >
                    <option value="">Choose a category</option>
                    {categories.map(category => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
                <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Monthly limit"
                required
                />
                <button type="submit" disabled={isSaving}>
                    {isSaving ? 'saving..' : 'save budget'}
                </button>
                {saveError && <p role="alert">{saveError}</p>}
            </form>
            {isLoading && <p>Loading budgets....</p>}
            {!isLoading && !error && budgets.length === 0 && (
                <p>No budgets for this month yet.</p>
            )}
            {!isLoading && !error && budgets.length > 0 && (
                <ul>
                    {budgets.map(budget => {
                        const categoryName = categories.find(category => category.id === budget.category_id)?.name?? 'Unknown category'
                        const spent = Number(spendingByCategory.find(
                            row => row.category_id === budget.category_id
                        )?.total ?? 0)
                        const limit = Number(budget.amount)
                        const remaining = limit - spent

                        return(
                            <li key={budget.id}>
                                {categoryName}: spent {spent.toFixed(2)} / {limit.toFixed(2)}
                                {'-'}
                                {remaining >= 0
                                ? `${remaining.toFixed(2)} remaining`: `${Math.abs(remaining).toFixed(2)} over budget`}
                            </li>
                        )
                    })}
                </ul>
            )}
        </section>
    )
}