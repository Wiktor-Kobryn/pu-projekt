export default function AppActionButton({ dzialanie, valueA, valueB, onResult }) {
    function onAction() {
        let wynik = 0;

        switch (dzialanie) {
            case "+":
                wynik = valueA + valueB;
                break;
            case "-":
                wynik = valueA - valueB;
                break;
            case "*":
                wynik = valueA * valueB;
                break;
            case "/":
                wynik = valueB !== 0 ? valueA / valueB : "Błąd!";
                break;
            default:
                console.error("Nieznane działanie:", dzialanie);
                break;
        }

        onResult(wynik, dzialanie);
    }

    return (
        <button onClick={onAction}>
            {dzialanie}
        </button>
    );
}
