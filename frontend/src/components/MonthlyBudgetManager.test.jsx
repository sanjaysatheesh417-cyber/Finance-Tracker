import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from "@testing-library/user-event"
import { getBudgets, createBudget, updateBudget } from "../api/transactions";
import { MonthlyBudgetManager } from "./MonthlyBudgetManager";
import { wait } from "@testing-library/user-event/dist/cjs/utils/index.js";

vi.mock("../api/transactions", () => ({
    getBudgets: vi.fn(),
    createBudget: vi.fn(),
    updateBudget: vi.fn()
}))

const categories = [
    {id: 1, name: 'food'}
]
const selectedMonth = '2026-11'

beforeEach(() => {
    vi.clearAllMocks()
})

describe('MonthlyBudgetManager', () => {
    it('loads and displays budgets for the selected month', async () => {
        getBudgets.mockResolvedValue([
            {
                id: 10,
                category_id: 1,
                year: 2026,
                month: 11,
                amount: '75000.00'
            }
        ])
        render (
            <MonthlyBudgetManager
            categories={categories}
            selectedMonth={selectedMonth}
            />
        )
        expect(await screen.findByText(/food: spent/i)).toBeInTheDocument()
        expect(screen.getByText(/75000\.00/)).toBeInTheDocument()
        expect(getBudgets).toHaveBeenCalledWith(2026,11)
    })

    it('creates a budget when saving a new category budget', async () => {
        const user = userEvent.setup()
        getBudgets.mockResolvedValue([])
        createBudget.mockResolvedValue({
            id: 10,
            category_id: 1,
            year: 2026,
            month: 11,
            amount: '75000.00'
        })

        render(
            <MonthlyBudgetManager
            categories={categories}
            selectedMonth={selectedMonth}
            />
        )
        await user.selectOptions(
            await screen.findByRole('combobox'),'1'
        )
        await user.type(screen.getByPlaceholderText(/monthly limit/i), '75000')
        await user.click(screen.getByRole('button', { name: /save budget/i }))

        await waitFor(() => {
            expect(createBudget).toHaveBeenCalledWith({
                category_id: 1,
                year: 2026,
                month: 11,
                amount: 75000
            })
        })
    })
    it('updates the existing budget for that category', async () => {
        const user = userEvent.setup()

        getBudgets.mockResolvedValue([
            {
                id: 10,
                category_id: 1,
                year: 2026,
                month: 11,
                amount: '75000.00'
            }
        ])
        updateBudget.mockResolvedValue({
            id: 10,
            category_id: 1,
            year: 2026,
            month: 11,
            amount: '80000.00',
        })

        render(
            <MonthlyBudgetManager
            categories={categories}
            selectedMonth={selectedMonth}
            />
        )

        await user.selectOptions(
            await screen.findByRole('combobox'),'1'
        )
        await user.type(screen.getByPlaceholderText(/monthly limit/i), '80000')
        await user.click(screen.getByRole('button', { name: /save budget/i }))

        await waitFor(() => {
            expect(updateBudget).toHaveBeenCalledWith(10, { amount: 80000 })
        })
    })

    it('shows a validation error when no category is selected', async () => {
        const user = userEvent.setup()
        getBudgets.mockResolvedValue([])

        render(
            <MonthlyBudgetManager
            categories={categories}
            selectedMonth={selectedMonth}
            />
        )

        await user.type(screen.getByPlaceholderText(/monthly limit/i), '75000')
        await user.click(screen.getByRole('button', { name: /save budget/i }))

        expect(await screen.findByRole('alert')).toHaveTextContent(
            /choose a category/i
        )
        expect(createBudget).not.toHaveBeenCalled()
    })

    it('shows an error when saving the budget fails', async () => {
        const user = userEvent.setup()
        getBudgets.mockResolvedValue([])
        createBudget.mockRejectedValue(new Error('server unavailable'))
        render(
            <MonthlyBudgetManager
            categories={categories}
            selectedMonth={selectedMonth}
            />
        )
        await user.selectOptions(await screen.findByRole('combobox'),'1')
        await user.type(screen.getByPlaceholderText(/monthly limit/i),'75000')
        await user.click(screen.getByRole('button', { name: /save budget/i }))
        expect(await screen.findByRole('alert')).toHaveTextContent('server unavailable')
    })

    it('shows how much the category is over budget', async () => {
        getBudgets.mockResolvedValue([
            {
                id: 10,
                category_id: 1,
                year: 2026,
                month: 11,
                amount: '75000.00'
            }
        ])
        render(
            <MonthlyBudgetManager
            categories={categories}
            selectedMonth={selectedMonth}
            spendingByCategory={[
                {
                    category_id: 1,
                    total: '80000.00'
                }
            ]}
            />
        )

        expect(await screen.findByText(/5000\.00 over budget/i)).toBeInTheDocument()
    })

    it('shows the full budget remaining when the category has no spending', async () => {
        getBudgets.mockResolvedValue([
            {
                id: 10,
                category_id: 1,
                year: 2026,
                month: 11,
                amount: '75000.00'
            }
        ])

        render(
            <MonthlyBudgetManager
            categories={categories}
            selectedMonth={selectedMonth}
            spendingByCategory={[]}
            />
        )

        expect(await screen.findByText(/75000\.00 remaining/i)).toBeInTheDocument()
    })
})