import { useState } from "react";
import { FaA } from "react-icons/fa6";

export default function AppHeader() {
    const [fontSize, setFontSize] = useState("medium");

    function zmienCzcionke(size) {
        setFontSize(size);
    }

    return (
        <>
            <h3>Header</h3>
            <div className="kontener">
                <div>
                    <label style={{ fontSize: fontSize }}>Wiktor Kobryń</label>
                </div>
                <div>
                    <FaA onClick={() => zmienCzcionke("small")} style={{ cursor: "pointer", fontSize: "small", border: "solid" }} />
                    <FaA onClick={() => zmienCzcionke("medium")} style={{ cursor: "pointer", fontSize: "medium", border: "solid" }} />
                    <FaA onClick={() => zmienCzcionke("large")} style={{ cursor: "pointer", fontSize: "large", border: "solid" }} />
                </div>
            </div>
        </>
    );
}
