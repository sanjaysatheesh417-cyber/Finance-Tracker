import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { getMonthlyCategorySpending } from '../api/transactions'
import { MonthlyCategorySummary } from './MonthlyCategorySummary'
import { CategoryForm } from './CategoryForm'

vi.mock('../api/transactions', () => ({
    getMonthlyCategorySpending: vi.fn()
}))

beforeEach(() => {vi.clearAllMocks()})

describe('MonthlyCategorySummary', () => {
    it('displays the returned category totals', async () => {
        getMonthlyCategorySpending.mockResolvedValue([
            {
                category_id: 1,
                category_name: 'food',
                total: '6000.00'
            }
        ])
        render(<MonthlyCategorySummary />)

        expect(await screen.findByText(/food: 6000\.00/)).toBeInTheDocument()
    })

    it('loads a report when the selected month changes', async () => {
        getMonthlyCategorySpending.mockResolvedValue([])
        render(<MonthlyCategorySummary/>)
        const monthInput = screen.getByLabelText(/choose a month/i)
        fireEvent.change(monthInput, { target: {value: '2026-10'}})

        await waitFor(() => {
            expect(getMonthlyCategorySpending).toHaveBeenCalledWith(2026, 10)
        })
    })

    it('shows an error if loading the report fails', async () => {
        getMonthlyCategorySpending.mockRejectedValue(
            new Error('Report unavailable')
        )

        render(<MonthlyCategorySummary/>)
        expect(await screen.findByRole('alert')).toHaveTextContent('Report unavailable')
    })
})