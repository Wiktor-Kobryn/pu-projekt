import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Languages, RefreshCw } from 'lucide-react';
import { useApp } from '../AppContext';

const API_URL = "http://127.0.0.1:8000";

const AnalysisPage = () => {
  const { activeTextId } = useApp();

  const [fullText, setFullText] = useState("");
  const [tekstNazwa, setTekstNazwa] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [resultText, setResultText] = useState("");
  
  const [mode, setMode] = useState('translate');
  const [language, setLanguage] = useState('polski');
  const [loading, setLoading] = useState(false);

  const textAreaRef = useRef(null);

  useEffect(() => {
    if (activeTextId) {
      axios.get(`${API_URL}/teksty/${activeTextId}`)
        .then(res => {
          setFullText(res.data.tresc);
          setTekstNazwa(res.data.nazwa);
          setResultText("");
          setSelectedText(""); 
        })
        .catch(err => console.error("Błąd pobierania tekstu", err));
    }
  }, [activeTextId]);


  const handleTextSelect = () => {
    const textArea = textAreaRef.current;
    if (!textArea) return;

    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const substring = textArea.value.substring(start, end);

    if (substring.length > 0) {
      setSelectedText(substring);
    } else {
      setSelectedText("");
    }
  };

  const selectAll = () => {
    if (textAreaRef.current) {
        textAreaRef.current.select();
        setSelectedText(fullText);
    }
  };

  const handleAnalyze = async () => {
    const textToAnalyze = selectedText || fullText;

    if (!textToAnalyze) return alert("Brak tekstu do analizy!");

    setLoading(true);
    let polecenie = "";

    switch (mode) {
        case 'translate':
            polecenie = `Przetłumacz poniższy tekst na język: ${language}.`;
            break;
        case 'summarize':
            polecenie = `Zrób zwięzłe streszczenie tego tekstu w języku: ${language}.`;
            break;
        case 'explain':
            polecenie = `Wytłumacz ten fragment prostym językiem (jak dla laika), w języku: ${language}.`;
            break;
        default:
            polecenie = "Przeanalizuj tekst.";
    }

    try {
        const response = await axios.post(`${API_URL}/ai-stateless`, {
            polecenie: polecenie,
            tekst: textToAnalyze
        });
        setResultText(response.data.tekst);
    } catch (error) {
        console.error(error);
        alert("Błąd podczas łączenia z AI.");
    } finally {
        setLoading(false);
    }
  };

  if (!activeTextId) {
    return (
        <div className="container" style={{marginTop: '5rem'}}>
            <h2>Nie wybrano tekstu!</h2>
            <p>Wróć do zakładki "Dodaj tekst" i wybierz plik z listy na dole.</p>
        </div>
    );
  }

  return (
    <div className="analysis-container" style={{ padding: '2rem' }}>
      
      <div className="panel">
        <div className="panel-title">
            <span>'{tekstNazwa}'</span>
        </div>
        
        <textarea
            ref={textAreaRef}
            className="text-area"
            value={fullText}
            readOnly
            onMouseUp={handleTextSelect}
            placeholder="Tutaj pojawi się treść wybranego pliku..."
        />
        
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn-small" onClick={selectAll}>
                zaznacz wszystko
            </button>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">
            <span>ANALIZA AI</span>
            <Languages size={24} />
        </div>


        <div className="controls-group">
            <div className="radio-option" onClick={() => setMode('translate')}>
                <div className="radio-circle-small">
                    {mode === 'translate' && <div className="radio-dot-small" />}
                </div>
                <span>przetłumacz</span>
            </div>

            <div className="radio-option" onClick={() => setMode('summarize')}>
                <div className="radio-circle-small">
                    {mode === 'summarize' && <div className="radio-dot-small" />}
                </div>
                <span>streść</span>
            </div>

            <div className="radio-option" onClick={() => setMode('explain')}>
                <div className="radio-circle-small">
                    {mode === 'explain' && <div className="radio-dot-small" />}
                </div>
                <span>wytłumacz prościej</span>
            </div>

            <select 
                className="lang-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
            >
                <option value="polski">polski</option>
                <option value="angielski">angielski</option>
                <option value="niemiecki">niemiecki</option>
                <option value="włoski">włoski</option>
                <option value="hiszpański">hiszpański</option>
            </select>
        </div>

        <button className="btn-analyze" onClick={handleAnalyze} disabled={loading}>
            {loading ? "Analizowanie..." : (selectedText ? "analizuj fragment >" : "analizuj całość >")}
        </button>

        <textarea
            className="text-area"
            value={resultText}
            readOnly
            placeholder="Tutaj pojawi się odpowiedź modelu AI..."
            style={{ backgroundColor: 'white' }}
        />
      </div>

    </div>
  );
};

export default AnalysisPage;