import { useState } from 'react'
import { createCategory } from '../api/transactions'

export function CategoryForm({ onCreated }) {
    const [name, setName] = useState('')
    const [error, setError] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setIsSaving(true)

        try {
            const savedCategory = await createCategory({ name: name.trim() })
            onCreated(savedCategory)
            setName('')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not create category')
        } finally {
            setIsSaving(false)
        }
    }
    return (
        <form onSubmit={handleSubmit}>
            <input value={name} onChange={e => setName(e.target.value)} placeholder='New category name' required/>
            <button type='submit' disabled={isSaving}>
                {isSaving ? 'Saving...':'Add category'}
            </button>
            {error && <p role='alert'>{error}</p>}
        </form>
    )
}