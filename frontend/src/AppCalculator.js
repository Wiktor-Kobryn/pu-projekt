import { useState, useEffect, useRef } from "react";
import AppActionButton from "./AppActionButton";
import AppCalculationHistory from "./AppCalculationHistory";

export default function AppCalculator() {
    const [valueA, setValueA] = useState(0);
    const [valueB, setValueB] = useState(0);
    const [wynik, setWynik] = useState(null);
    const [porownanie, setPorownanie] = useState("");

    const historiaRef = useRef(null);

    useEffect(() => {
        let komunikat = "liczba A jest ";
        if (valueA > valueB) setPorownanie(komunikat + "większa od liczby B  (A>B)");
        else if (valueA < valueB) setPorownanie(komunikat + "mniejsza od liczby B (A<B)");
        else setPorownanie(komunikat + "równa liczbie B (A==B)");
    }, [valueA, valueB]);

    function aktualizujWynik(wynik, dzialanie) {
        setWynik(wynik);

        if (historiaRef.current) {
            historiaRef.current.dodajWpis({ valueA, valueB, dzialanie, wynik });
        }
    }

    function przywrocStan(index, entry) {
        setValueA(entry.valueA);
        setValueB(entry.valueB);
        setWynik(entry.wynik);

        if (historiaRef.current) {
            historiaRef.current.cofnijHistorie(index + 1);
        }
    }

    return (
        <>
            <h3>Calculator</h3>
            <div className="kontener">
                <div>
                    <label>A: </label>
                    <input type="number" value={valueA} onChange={(e) => setValueA(Number(e.target.value))}/>
                </div>
                <div>
                    <label>B: </label>
                    <input type="number" value={valueB} onChange={(e) => setValueB(Number(e.target.value))}/>
                </div>
                <div>
                    <AppActionButton dzialanie="+" valueA={valueA} valueB={valueB} onResult={aktualizujWynik} />
                    <AppActionButton dzialanie="-" valueA={valueA} valueB={valueB} onResult={aktualizujWynik} />
                    <AppActionButton dzialanie="*" valueA={valueA} valueB={valueB} onResult={aktualizujWynik} />
                    <AppActionButton dzialanie="/" valueA={valueA} valueB={valueB} onResult={aktualizujWynik} />
                </div>
                <div>
                    <label>Porównanie: </label>
                    <input type="text" value={porownanie} className="uneditable" readOnly/>
                </div>
                <div>
                    <label>Wynik: </label>
                    <input type="text" value={wynik} className="uneditable" readOnly/>
                </div>
            </div>
            <div>
                <AppCalculationHistory ref={historiaRef} onRestore={przywrocStan}/>
            </div>
        </>
    );
}
