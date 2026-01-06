import { useState, forwardRef, useImperativeHandle } from "react";

const AppCalculationHistory = forwardRef((props, ref) => {
    const [historia, setHistory] = useState([]);

    const dodajWpis = (entry) => {
        setHistory(prev => [...prev, entry]);
    };

    const cofnijHistorie = (length) => {
        setHistory(prev => prev.slice(0, length));
    };

    useImperativeHandle(ref, () => ({
        dodajWpis: dodajWpis,
        cofnijHistorie: cofnijHistorie
    }));

    return (
        <div>
            <h3>Calculation History</h3>
            <ul>
                {historia.map((item, index) => (
                    <li key={index}>
                        {item.valueA} {item.dzialanie} {item.valueB} = {item.wynik}{" "}
                        <button onClick={() => props.onRestore(index, item)}>Przywróć</button>
                    </li>
                ))}
            </ul>
        </div>
    );
});

export default AppCalculationHistory;
