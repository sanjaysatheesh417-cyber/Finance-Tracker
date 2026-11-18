import { useState } from "react"
import { createTransaction ,updateTransaction} from "../api/transactions"

export function TransactionForm({transaction, categories=[], onAdd, onUpdate, onCancelEdit}) {
    const [amount, setAmount] = useState(transaction ? String(transaction.amount) : '')
    const [date, setDate] = useState(transaction?.transaction_date?.slice(0,10) ?? '')
    const [type, setType] = useState(transaction?.mode ?? 'debited')
    const [description, setDescription] = useState(transaction?.description ?? '')
    const [error, setError] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [categoryId, setCategoryId] = useState(String(transaction?.category_id ?? ''))

    async function handleSubmit(e) {
        e.preventDefault()
        setError(null)

        const parsedAmount = Number(amount)
        if (!amount.trim() || !Number.isFinite(parsedAmount) || parsedAmount<=0) {
            setError('enter an amount greater than zero.')
            return
        }
        if (!date) {
            setError('choose a date')
            return
        }

        const transactionData = {
            amount: parsedAmount,
            transaction_date: date,
            mode: type,
            category_id: categoryId ? Number(categoryId) : null,
            description: description.trim() || null
        }

        setIsSubmitting(true)

        try{
            if (transaction){
                const updated = await updateTransaction(transaction.id, transactionData)
                onUpdate(updated)
            } else {
                const created = await createTransaction(transactionData)
                onAdd(created)
                setAmount('')
                setDate('')
                setType('debited')
                setDescription('')
            }
        } catch (error) {
            setError(
                error instanceof Error ? error.message: 'could not save the transaction.'
            )
        } finally {
            setIsSubmitting(false)
        }
    }
    return (
        <>
        <form onSubmit={handleSubmit}>
            <input type='number' min="0.01" step="0.01" placeholder='amount' value={amount} onChange={e => setAmount(e.target.value)} required/>
            <input type='date' value={date} onChange={e => setDate(e.target.value)} required/>
            <select value={type} onChange={e => setType(e.target.value)}>
                <option value="debited">Expense</option>
                <option value="credited">Income</option>
            </select>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} disabled={isSubmitting}>
                <option value="">No category</option>
                {categories.map(category => (
                    <option key={category.id} value={category.id}>
                        {category.name}
                    </option>
                ))}
            </select>
            <textarea value={description} onChange={e=> setDescription(e.target.value)} placeholder="Description (optional)"/>
            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving....' : 'Submit'}    
            </button>
            {transaction && (<button type="button" onClick={onCancelEdit}>Cancel</button>)}
            {error && <p className='Error' role='alert'>{error}</p>}
        </form>
        </>
    );
}