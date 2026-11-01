import './App.css'

const transactions = [
    { id: 1, amount: 8000, date: "10-12-2026", mode: "debited"},
    { id: 2, amount: 5000, date: "11-12-2026", mode: "credited"},
    { id: 3, amount: 2000, date: "12-12-2026", mode: "credited"}
];

export default function TransactionsList() {
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