import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { getMonthlyCategorySpending } from '../api/transactions'
import { MonthlyCategorySummary } from './MonthlyCategorySummary'

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
        render(<MonthlyCategorySummary 
        selectedMonth="2026-11"
        onMonthChange={vi.fn()}/>)

        expect(await screen.findByText(/food: 6000\.00/)).toBeInTheDocument()
    })

    it('notifies the parent and loads a report when the selected month changes', async () => {
        getMonthlyCategorySpending.mockResolvedValue([])
        const onMonthChange = vi.fn()

        const {rerender} = render(
            <MonthlyCategorySummary
            selectedMonth="2026-11"
            onMonthChange={onMonthChange}
            />
        )

        fireEvent.change(screen.getByLabelText(/choose a month/i), {
            target: {value: '2026-10'}
        })

        expect(onMonthChange).toHaveBeenCalledWith('2026-10')

        rerender(
            <MonthlyCategorySummary
            selectedMonth="2026-10"
            onMonthChange={onMonthChange}
            />
        )

        await waitFor(() => {
            expect(getMonthlyCategorySpending).toHaveBeenCalledWith(2026, 10)
        })
    })

    it('shows an error if loading the report fails', async () => {
        getMonthlyCategorySpending.mockRejectedValue(
            new Error('Report unavailable')
        )

        render(<MonthlyCategorySummary
        selectedMonth="2026-11"
        onMonthChange={vi.fn()}/>)
        
        expect(await screen.findByRole('alert')).toHaveTextContent('Report unavailable')
    })
})