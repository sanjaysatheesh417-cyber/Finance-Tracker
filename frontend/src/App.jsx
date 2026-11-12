import './App.css'
import { useState } from 'react';

let nextId = 3;
function TransactionsList({transactions}) {
    const listTrans = transactions.map(trans =>
        <li key={trans.id} style={{color: trans.mode === "debited" ? 'red': 'green'}}
        >
            {trans.date} - {trans.mode} - {trans.amount}
        </li>
    ); 
 
    return (
        <ul>{listTrans}</ul>
    );
}


export default function AddTrans() {
    const [transactions, setTransactions] = useState([])
    const [amount, setAmount] = useState('')
    const [date, setDate] = useState('')
    const [type, setType] = useState('debited')
    const [error, setError] = useState(null)
    const [filterType, setFilterType] = useState('all')
    const income = transactions.filter((transaction)=>transaction.mode === 'credited').reduce((total, transaction)=>total+transaction.amount, 0)
    const expenses = transactions.filter((transaction)=>transaction.mode === 'debited').reduce((total, transaction)=>total+transaction.amount, 0)
    const balance = income - expenses
    const visibleTransactions = transactions.filter((transaction)=>filterType === "all" || transaction.mode === filterType)

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
            id: nextId++,
            amount: Number(amount),
            date,
            mode: type,
        }

        setTransactions((currentTransactions) => [
            ...currentTransactions, newTransaction,
        ])

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
        <div>
            <p>Income: {income}</p>
            <p>Expenses: {expenses}</p>
            <p>Balance: {balance}</p>
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="all">All</option>
            <option value="debited">Expense</option>
            <option value="credited">Income</option>
        </select>
        <TransactionsList transactions={visibleTransactions}/>
        </>
    );
}