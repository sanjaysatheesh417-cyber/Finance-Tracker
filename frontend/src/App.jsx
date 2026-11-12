import './App.css'
import { useState } from 'react';
import {TransactionsList} from './components/TransactionList';
import { TransactionForm } from './components/TransactionForm';

export default function App() {
    const [transactions, setTransaction] = useState([])
    const [filterType, setFilterType] = useState("all")
    const income = transactions.filter((transaction)=>transaction.mode === 'credited').reduce((total, transaction)=>total+transaction.amount, 0)
    const expenses = transactions.filter((transaction)=>transaction.mode === 'debited').reduce((total, transaction)=>total+transaction.amount, 0)
    const balance = income - expenses
    const visibleTransactions = transactions.filter(
        (transaction) => filterType === 'all' || transaction.mode === filterType
    )
    function handleAdd(newTransaction) {
        setTransaction((current) => [...current, newTransaction])
    }

    return (
        <>
        <TransactionForm onAdd={handleAdd}/>
        <section>
            <p>Income: {income}</p>
            <p>Expenses: {expenses}</p>
            <p>Balance: {balance}</p>
        </section>
        <select value={filterType} onChange={(e)=>setFilterType(e.target.value)}>
            <option value="all">All</option>
            <option value="debited">Expense</option>
            <option value="credited">Income</option>
        </select>

        <TransactionsList transactions={visibleTransactions}/>
        </>
    )
}
