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
    expect(screen.getAllByRole('combobox')[0]).toHaveValue('credited')
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
        await user.selectOptions(screen.getAllByRole('combobox')[0], 'credited')
        await user.type(screen.getByPlaceholderText('Description (optional)'), 'Bonus')
        await user.click(screen.getByRole('button', {name:/submit/i}))

        expect(createTransaction).toHaveBeenCalledWith({
            amount: 450,
            transaction_date: '2026-11-20',
            mode: 'credited',
            category_id: null,
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
        await user.selectOptions(screen.getAllByRole('combobox')[0], 'credited')
        const descriptionInput = screen.getByPlaceholderText('Description (optional)')
        await user.clear(descriptionInput)
        await user.type(descriptionInput, 'monthly salary')
        await user.click(screen.getByRole('button', {name:/submit/i}))
        expect(updateTransaction).toHaveBeenCalledWith(7, {
            amount: 275000,
            transaction_date: '2026-11-15',
            mode: 'credited',
            description: 'monthly salary',
            category_id: null
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
    it ('sends the selected category ID when creating a transaction', async () => {
        const user = userEvent.setup()
        createTransaction.mockResolvedValue({
            id: 22,
            amount: 125,
            transaction_date: "2026-11-18",
            mode: 'debited',
            category_id: 4,
            description: null
        })
        const { container } = render(
            <TransactionForm
            categories={[{ id: 4, name: 'food'}]}
            onAdd={vi.fn()}
            onUpdate={vi.fn()}
            onCancelEdit={vi.fn()}
            />
        )
        await user.type(screen.getByPlaceholderText('amount'), '125')
        fireEvent.change(container.querySelector('input[type="date"]'), {
            target: { value: '2026-11-18'}
        })
        await user.selectOptions(screen.getAllByRole('combobox')[1], '4')
        await user.click(screen.getByRole('button', { name: /submit/i }))
        expect(createTransaction).toHaveBeenCalledWith(
            expect.objectContaining({
                amount: 125,
                category_id: 4
            })
        )
    })
})