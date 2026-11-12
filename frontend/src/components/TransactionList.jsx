export function TransactionsList({transactions}) {
    const listTrans = transactions.map(trans =>
        <li key={trans.id} style={{color: trans.mode === "debited" ? 'red': 'green'}}
        >
            {trans.date} - {trans.mode} - {trans.amount}
        </li>
    ); 
 
    return (
        <ul>{listTrans}</ul>
    );
}