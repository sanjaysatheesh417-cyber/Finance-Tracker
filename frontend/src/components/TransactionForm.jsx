import { useState } from "react"
import { createTransaction } from "../api/transactions"

export function TransactionForm({onAdd}) {
    const [amount, setAmount] = useState('')
    const [date, setDate] = useState('')
    const [type, setType] = useState('debited')
    const [description, setDescription] = useState("")
    const [error, setError] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

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
            description: description.trim() || null
        }

        setIsSubmitting(true);

        try{
            const savedTransaction = await createTransaction(transactionData);
            onAdd(savedTransaction)
            setAmount('')
            setDate('')
            setType('debited')
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
            <textarea value={description} onChange={e=> setDescription(e.target.value)} placeholder="Description (optional)"/>
            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving....' : 'Submit'}    
            </button>
            {error && <p className='Error' role='alert'>{error}</p>}
        </form>
        </>
    );
}