import './App.css'
import { useState } from 'react';

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
    const income = transactions.filter((transaction)=>transaction.mode === 'credited').reduce((total, transactions)=>total+transactions.amount, 0)
    const expenses = transactions.filter((transaction)=>transaction.mode === 'debited').reduce((total, transaction)=>total+transaction.amount, 0)
    const balance = income - expenses
    function handleSubmit(e) {
        e.preventDefault()
        const newTransaction = {
            id: crypto.randomUUID(),
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
        </form>
        <section>
            <p>Income: {income}</p>
            <p>Expenses: {expenses}</p>
            <p>Balance: {balance}</p>
        </section>
        <TransactionsList transactions={transactions} />
        </>
    );
}