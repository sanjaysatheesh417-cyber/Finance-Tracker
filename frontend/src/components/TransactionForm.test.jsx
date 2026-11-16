import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from '@testing-library/react'
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