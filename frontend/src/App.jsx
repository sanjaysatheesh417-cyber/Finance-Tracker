import './App.css'
import { useState } from 'react';
import { useEffect } from 'react';
import { getTransactions, deleteTransaction, updateTransaction, getCategories, deleteCategory } from './api/transactions';
import {TransactionsList} from './components/TransactionList';
import { TransactionForm } from './components/TransactionForm';
import { CategoryForm } from './components/CategoryForm';
import { MonthlyCategorySummary } from './components/MonthlyCategorySummary';

export default function App() {
    const [transactions, setTransaction] = useState([])
    const [filterType, setFilterType] = useState("all")
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [transactionsLoading, setTransactionsLoading] = useState(true)
    const [transactionsError, setTransactionsError] = useState("")
    const [categoriesLoading, setCategoriesLoading] = useState(true)
    const [categoriesError, setCategoriesError] = useState("")
    const [deletingId, setDeletingId] = useState(null)
    const [deleteError, setDeleteError] = useState('')
    const [deletingCategoryId, setDeletingCategoryId] = useState(null)
    const [categoryDeleteError, setCategoryDeleteError] = useState('')
    const [editingId, setEditingId] = useState(null)
    const [categories, setCategories] = useState([])

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
                    setTransactionsError(
                    error instanceof Error ? error.message: "could not load transactions"
                )
                }
            } finally {
                if (!ignoreResult) {
                    setTransactionsLoading(false)
                }
            }
        }
        loadTransactions()

        return ()=>{
            ignoreResult = true
        }
    }, [])

    useEffect(()=>{
        let ignoreResult = false
        async function loadCategories() {
            try {
                const data = await getCategories()
                if (!ignoreResult) {
                    setCategories(data)
                } 
            } catch (error) {
                if (!ignoreResult) {
                    setCategoriesError( error instanceof Error ? error.message: 'could not load categories ')
                }
            } finally {
                if (!ignoreResult) {
                    setCategoriesLoading(false)
                }
            }
        }
        loadCategories()
        return () => {
            ignoreResult = true
        }
    }, [])
    
    const transactionToEdit = transactions.find(transaction => transaction.id === editingId) ?? null
    const income = transactions.filter((transaction)=>transaction.mode === 'credited').reduce((total, transaction)=>total+transaction.amount, 0)
    const expenses = transactions.filter((transaction)=>transaction.mode === 'debited').reduce((total, transaction)=>total+transaction.amount, 0)
    const balance = income - expenses
    const visibleTransactions = transactions.filter(
        (transaction) => {
            const matchesType = filterType === 'all' || transaction.mode === filterType
            const matchesCategory = categoryFilter === 'all' || String(transaction.category_id) === categoryFilter
            return matchesType && matchesCategory
        }
    )
    async function handleAdd(newTransaction) {
        setTransaction((current) => [...current, newTransaction])
    }

    async function handleUpdate(updatedTransaction) {
        setTransaction(current => current.map(
            transaction => transaction.id === updatedTransaction.id ? updatedTransaction : transaction
        ))
        setEditingId(null)
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

    async function handleCategoryCreated(newCategory) {
        setCategories(current => [...current, newCategory])
    }

    async function handleDeleteCategory(id) {
        if (!window.confirm('Delete this category?')) return
        setCategoryDeleteError('')
        setDeletingCategoryId(id)

        try{
            await deleteCategory(id)
            setCategories(current => current.filter(category => category.id !== id))
        } catch (error) {
            setCategoryDeleteError(
                error instanceof Error ? error.message : 'Could not delete category'
            )
        } finally {
            setDeletingCategoryId(null)
        }
    }

    return (
        <>
        <CategoryForm onCreated={handleCategoryCreated}/>
        <section>
            <h2>Categories</h2>
            {categories.map(category => (
                <p key={category.id}>
                    {category.name}{' '}
                    <button type='button' onClick={() => handleDeleteCategory(category.id)}
                    disabled={deletingCategoryId === category.id}>
                        {deletingCategoryId === category.id ? 'Deleting...' : 'Delete' }
                    </button>
                </p>
            ))}
            {categoryDeleteError && (<p role='alert'>{categoryDeleteError}</p>)}
        </section>
        <TransactionForm  
            key={editingId ?? 'new'}
            transaction={transactionToEdit}
            categories={categories}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onCancelEdit={()=>setEditingId(null)}
        />
        
        <section>
            <p>Income: {income}</p>
            <p>Expenses: {expenses}</p>
            <p>Balance: {balance}</p>
        </section>
        <MonthlyCategorySummary/>
        <select value={filterType} onChange={(e)=>setFilterType(e.target.value)}>
            <option value="all">All</option>
            <option value="debited">Expense</option>
            <option value="credited">Income</option>
        </select>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="all">All categories</option>
            {categories.map(category => (
                <option key={category.id} value={category.id}>
                    {category.name}
                </option>
            ))}
        </select>
        {transactionsError && <p role='alert'>{transactionsError}</p>}
        {categoriesError && <p role='alert'>{categoriesError}</p>}
        {deleteError && <p role='alert'>{deleteError}</p>}
        {transactionsLoading ? (
            <p>Loading transactions.....</p>
        ): (<TransactionsList transactions={visibleTransactions} categories={categories} onDelete={handleDelete} deletingId={deletingId} onEdit={setEditingId}/>)}
        </>
    )
}