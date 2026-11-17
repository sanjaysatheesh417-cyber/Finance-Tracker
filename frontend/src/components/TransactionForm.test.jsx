import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from "@testing-library/user-event";
import { createTransaction, updateTransaction } from "../api/transactions";
import { TransactionForm } from './TransactionForm'

it('prefills the form with the selected transaction', () => {
    const transaction = {
        id: 7,
        amount: 270000,
        transaction_date: '2026-11-15',
        mode: 'credited',
        description: 'salary'
    }
    render(
        <TransactionForm
            transaction={transaction}
            onAdd={vi.fn()}
            onUpdate={vi.fn()}
            onCancelEdit={vi.fn()}
        />
    )
    expect(screen.getByDisplayValue('270000')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2026-11-15')).toBeInTheDocument()
    expect(screen.getByDisplayValue('salary')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toHaveValue('credited')
});

vi.mock('../api/transactions', ()=> ({
    createTransaction: vi.fn(),
    updateTransaction: vi.fn(),
}))

beforeEach(() => {
    vi.clearAllMocks()
})

describe('TransactionForm submission', () => {
    it('creates a transaction and calls onAdd with the saved response', async () => {
        const user = userEvent.setup()
        const onAdd = vi.fn()
        const savedTransaction = {
            id: 42,
            amount: 450,
            transaction_date: '2026-11-20',
            mode: 'credited',
            description: 'Bonus'
        }
        vi.mocked(createTransaction).mockResolvedValue(savedTransaction)
        render(
            <TransactionForm
            transaction={null}
            onAdd={onAdd}
            onUpdate={vi.fn()}
            onCancelEdit={vi.fn()}
            />
        )
        await user.type(screen.getByPlaceholderText('amount'), '450')
        fireEvent.change(document.querySelector('input[type="date"]'), {
            target: {value: '2026-11-20'}
        })
        await user.selectOptions(screen.getByRole('combobox'), 'credited')
        await user.type(screen.getByPlaceholderText('Description (optional)'), 'Bonus')
        await user.click(screen.getByRole('button', {name:/submit/i}))

        expect(createTransaction).toHaveBeenCalled({
            amount: 450,
            transaction_date: '2026-11-20',
            mode: 'credited',
            description: 'Bonus',
        })
        expect(onAdd).toHaveBeenCalledWith(savedTransaction)
    })

    it('updates a transaction and calls onUpdate with the saved response', async () => {
        const user = userEvent.setup()
        const onUpdate = vi.fn()
        const existingTransaction = {
            id: 7,
            amount: 270000,
            transaction_date: '2026-11-15',
            mode: 'credited',
            description: 'salary'
        }
        const updatedTransaction = {
            ...existingTransaction,
            amount: 275000,
            description: 'monthly salary'
        }

        vi.mocked(updateTransaction).mockResolvedValue(updatedTransaction)
        render(
            <TransactionForm
            transaction={existingTransaction}
            onAdd={vi.fn()}
            onUpdate={onUpdate}
            onCancelEdit={vi.fn()}
            />
        )

        const amountInput = screen.getByPlaceholderText('amount')
        await user.clear(amountInput)
        await user.type(amountInput, '275000')

        fireEvent.change(document.querySelector('input[type="date"]'), {
            target: { value: '2026-11-15'}
        })
        await user.selectOptions(screen.getByRole('combobox'), 'credited')
        const descriptionInput = screen.getByPlaceholderText('Description (optional)')
        await user.clear(descriptionInput)
        await user.type(descriptionInput, 'monthly salary')
        await user.click(screen.getByRole('button', {name:/submit/i}))
        expect(updateTransaction).toHaveBeenCalledWith(7, {
            amount: 275000,
            transaction_date: '2026-11-15',
            mode: 'credited',
            description: 'monthly salary'
        })
        expect(onUpdate).toHaveBeenCalledWith(updatedTransaction)
    })

    it ('shows an error and does not add when the API request fails', async () => {
        const user = userEvent.setup()
        const onAdd = vi.fn()
        vi.mocked(createTransaction).mockRejectedValue(
            new Error('Server unavailable')
        )
        render(
            <TransactionForm
            transaction={null}
            onAdd={onAdd}
            onUpdate={vi.fn()}
            onCancelEdit={vi.fn()}
            />
        )
        await user.type(screen.getByPlaceholderText('amount'), '450')
        fireEvent.change(document.querySelector('input[type="date"]'), {
            target: {value: '2026-11-20'}
        })

        await user.type(
            screen.getByPlaceholderText('Description (optional)'), 'Bonus'
        )
        await user.click(screen.getByRole('button', { name: /submit/i }))
        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Server unavailable'
        )
        expect(onAdd).not.toHaveBeenCalled()
    })
})