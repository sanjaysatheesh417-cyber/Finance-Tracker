import { describe, expect, it, vi } from "vitest"
import { render, screen } from '@testing-library/react'
import userEvent from "@testing-library/user-event"
import { TransactionsList } from "./TransactionList"

describe('TransactionList', () => {
    it('shows a transaction and calls onDelete with its ID', async ()=>{
        const user = userEvent.setup()
        const onDelete = vi.fn()
        render (
            <TransactionsList
            transactions={[
                {
                    id: 7,
                    transaction_date: '2026-11-15',
                    mode: 'debited',
                    amount:300,
                    description: 'groceries'
                }
            ]}
            onDelete={onDelete}
            onEdit={()=>{}}
            deletingId={null}
            />
        )
        expect(screen.getByText(/groceries/)).toBeInTheDocument()
        await user.click(screen.getByRole('button', {name: 'Delete'}))
        expect(onDelete).toHaveBeenCalledWith(7)
    })
    it('shows the transaction category name', () => {
        const transaction = {
            id: 1,
            amount: 125,
            transaction_date: '2026-11-18',
            mode: 'debited',
            description: 'Lunch',
            category_id: 4
        }

        render(
            <TransactionsList
            transactions={[transaction]}
            categories={[{ id: 4, name: 'food'}]}
            onDelete={vi.fn()}
            onEdit={vi.fn()}
            deletingId={null}
            />
        )
        expect(screen.getByText(/food/i)).toBeInTheDocument()
    })
})