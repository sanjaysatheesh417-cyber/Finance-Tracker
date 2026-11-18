export function TransactionsList({transactions, categories=[], onDelete, onEdit, deletingId}) {
    if (transactions.length === 0) {
        return <p>No transactions yet.</p>
    }
    return (
        <ul>
            {transactions.map((trans)=> {
                const categoryName = categories.find(category => category.id === trans.category_id)?.name ?? 'Uncategorized'
                return (
                <li key={trans.id} style={{color: trans.mode === 'debited' ? 'red': 'green'}}>
                    {trans.transaction_date} - {trans.mode} - {trans.amount}
                    {' - '}{categoryName}
                    {trans.description && `-- ${trans.description}`}
                    <button type="button" onClick={()=>onEdit(trans.id)}>
                        Edit
                    </button>
                    <button type="button" onClick={()=> onDelete(trans.id)} disabled={deletingId == trans.id}>
                        {deletingId === trans.id ? 'Deleting' : 'Delete'}
                    </button>         
                </li>
                )
            })}
        </ul>
    )
}