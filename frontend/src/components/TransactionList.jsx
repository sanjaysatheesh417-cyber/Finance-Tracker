export function TransactionsList({transactions}) {
    if (transactions.length === 0) {
        return <p>No transactions yet.</p>
    }
    return (
        <ul>
            {transactions.map((trans)=> (
                <li key={trans.id} style={{color: trans.mode === 'debited' ? 'red': 'green'}}>
                    {trans.transaction_date} - {trans.mode} - {trans.amount}
                    {trans.description && `-- ${trans.description}`}             
                </li>
            ))}
        </ul>
    )
}