import { useState } from "react"

export function TransactionForm({onAdd}) {
    const [amount, setAmount] = useState('')
    const [date, setDate] = useState('')
    const [type, setType] = useState('debited')
    const [error, setError] = useState(null)

    function handleSubmit(e) {
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

        const newTransaction = {
            id: crypto.randomUUID(),
            amount: parsedAmount,
            date,
            mode: type,
        }

        onAdd(newTransaction)
        setAmount('')
        setDate('')
        
    }
    return (
        <>
        <form onSubmit={handleSubmit}>
            <input type='number' placeholder='amount' value={amount} onChange={e => setAmount(e.target.value)}/>
            <input type='date' placeholder='date' value={date} onChange={e => setDate(e.target.value)}/>
            <select value={type} onChange={e => setType(e.target.value)}>
                <option value="debited">Expense</option>
                <option value="credited">Income</option>
            </select>
            <button type="submit">submit</button>
            {error && <p className='Error' role='alert'>{error}</p>}
        </form>
        </>
    );
}