export function TransactionsList({transactions, onDelete, onEdit, deletingId}) {
    if (transactions.length === 0) {
        return <p>No transactions yet.</p>
    }
    return (
        <ul>
            {transactions.map((trans)=> (
                <li key={trans.id} style={{color: trans.mode === 'debited' ? 'red': 'green'}}>
                    {trans.transaction_date} - {trans.mode} - {trans.amount}
                    {trans.description && `-- ${trans.description}`}
                    <button type="button" onClick={()=>onEdit(trans.id)}>
                        Edit
                    </button>
                    <button type="button" onClick={()=> onDelete(trans.id)} disabled={deletingId == trans.id}>
                        {deletingId === trans.id ? 'Deleting' : 'Delete'}
                    </button>         
                </li>  
            ))}
        </ul>
    )
}