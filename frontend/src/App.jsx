import './App.css'
import { useState } from 'react';
import { useEffect } from 'react';
import { getTransactions, deleteTransaction } from './api/transactions';
import {TransactionsList} from './components/TransactionList';
import { TransactionForm } from './components/TransactionForm';

export default function App() {
    const [transactions, setTransaction] = useState([])
    const [filterType, setFilterType] = useState("all")
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("")
    const [deletingId, setDeletingId] = useState(null)
    const [deleteError, setDeleteError] = useState('')

    useEffect(() => {
        let ignoreResult = false

        async function loadTransactions() {
            try {
                const data = await getTransactions()
                
                if (!ignoreResult) {
                    setTransaction(data)
                }
            } catch (error) {
                if (!ignoreResult) {
                    setLoadError(
                    error instanceof Error ? error.message: "could not load transactions"
                )
                }
            } finally {
                if (!ignoreResult) {
                    setLoading(false)
                }
            }
        }
        loadTransactions()

        return ()=>{
            ignoreResult = true;
        }
    }, [])

    const income = transactions.filter((transaction)=>transaction.mode === 'credited').reduce((total, transaction)=>total+transaction.amount, 0)
    const expenses = transactions.filter((transaction)=>transaction.mode === 'debited').reduce((total, transaction)=>total+transaction.amount, 0)
    const balance = income - expenses
    const visibleTransactions = transactions.filter(
        (transaction) => filterType === 'all' || transaction.mode === filterType
    )
    async function handleAdd(newTransaction) {
        setTransaction((current) => [...current, newTransaction])
    }

    async function handleDelete(id) {
        if (!window.confirm('Delete this transaction?')) return

        setDeleteError('')
        setDeletingId(id)
        try {
            await deleteTransaction(id)
            setTransaction(current=>current.filter(transaction => transaction.id !== id))
        } catch (error) {
            setDeleteError(
                error instanceof Error ? error.message : 'Could not delete Transaction'
            )
        } finally {
            setDeletingId(null)
        }
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
        {loadError && <p role='alert'>{loadError}</p>}
        {deleteError && <p role='alert'>{deleteError}</p>}
        {loading ? (
            <p>Loading transactions.....</p>
        ): (<TransactionsList transactions={visibleTransactions} onDelete={handleDelete} deletingId={deletingId}/>)}
        </>
    )
}

