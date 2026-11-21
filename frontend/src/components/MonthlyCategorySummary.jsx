import { useEffect, useState } from "react";
import { getMonthlyCategorySpending } from "../api/transactions";

export function MonthlyCategorySummary({ selectedMonth, onMonthChange, onSummaryLoaded}) {
    const [summary, setSummary] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!selectedMonth) return
        let ignoreResult = false
        const [year, month] = selectedMonth.split('-').map(Number)

        async function loadSummary() {
            setIsLoading(true)
            setError('')
            onSummaryLoaded?.([])

            try {
                const data = await getMonthlyCategorySpending(year, month)
                if (!ignoreResult) {
                    setSummary(data)
                    onSummaryLoaded?.(data)
                }
            } catch (err) {
                if (!ignoreResult) {
                    setError(err instanceof Error ? err.message: 'Could not load the report')
                }
            } finally {
                if (!ignoreResult) {
                    setIsLoading(false)
                }
            }
        }
        loadSummary()

        return () => {
            ignoreResult = true
        }
    }, [selectedMonth])

    return (
        <section>
            <h2>Monthly expenses by category</h2>
            <label htmlFor="report-month">Choose a month:</label>
            <input
            id="report-month"
            type="month"
            value={selectedMonth}
            onChange={e => onMonthChange(e.target.value)}
            />
            {isLoading && <p>Loading report...</p>}
            {error && <p role="alert">{error}</p>}
            {!isLoading && !error && summary.length === 0 && (
                <p>No expenses for this month.</p>
            )}
            {!isLoading && !error && summary.length > 0 && (
                <ul>
                    {summary.map(row => (
                        <li key={row.category_id ?? 'uncategorized'}>
                            {row.category_name}: {Number(row.total).toFixed(2)}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}