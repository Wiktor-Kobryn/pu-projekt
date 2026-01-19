import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Globe, FileText, Database, Trash2 } from 'lucide-react';
import { useApp } from '../AppContext';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const API_URL = "http://127.0.0.1:8000";

const AddTextPage = () => {
  const { activeTextId, setActiveTextId, refreshTrigger, triggerRefresh } = useApp();
  
  const [inputType, setInputType] = useState('file'); 
  const [teksty, setTeksty] = useState([]);
  
  const [nazwa, setNazwa] = useState("");
  const [tresc, setTresc] = useState("");
  const [fileName, setFileName] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [readingFile, setReadingFile] = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}/teksty`)
      .then(res => {
        setTeksty(res.data);
        if (!activeTextId && res.data.length > 0) {
            setActiveTextId(res.data[0].id);
        }
      })
      .catch(err => console.error(err));
  }, [refreshTrigger, activeTextId, setActiveTextId]);

  const readPdf = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    
    let fullText = "";
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(" ");
      fullText += pageText + "\n\n";
    }
    
    return fullText;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setNazwa(file.name.split('.')[0]); 
    setReadingFile(true);

    try {
      let extractedText = "";

      if (file.type === "application/pdf") {
        extractedText = await readPdf(file);
      } else {
        extractedText = await file.text();
      }

      setTresc(extractedText);
    } catch (error) {
      console.error("Błąd odczytu pliku:", error);
      alert("Nie udało się odczytać tego pliku. Upewnij się, że nie jest uszkodzony.");
    } finally {
      setReadingFile(false);
    }
  };

  const handleSubmit = async () => {
    if (!nazwa || !tresc) return alert("Musisz podać nazwę i treść!");

    setLoading(true);
    try {
      await axios.post(`${API_URL}/teksty`, {
        nazwa: nazwa,
        tresc: tresc
      });
      
      alert("Dodano tekst do bazy!");
      setNazwa("");
      setTresc("");
      setFileName("");
      triggerRefresh(); 
    } catch (error) {
      console.error(error);
      alert("Błąd połączenia z backendem.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!activeTextId) return;
    if (!window.confirm("Czy na pewno usunąć wybrany tekst?")) return;

    try {
      await axios.delete(`${API_URL}/teksty/${activeTextId}`);
      setActiveTextId(null);
      triggerRefresh();
    } catch (error) {
      alert("Błąd podczas usuwania.");
    }
  };

  return (
    <div className="container">
      <h2 className="section-title">Dodaj nowy plik</h2>
      
      <div className="type-selector">
        <div 
          className={`type-option ${inputType === 'url' ? 'selected' : ''}`}
          onClick={() => setInputType('url')}
        >
          <Globe size={64} />
          <div className="radio-circle">
            {inputType === 'url' && <div className="radio-dot" />}
          </div>
        </div>

        <div 
          className={`type-option ${inputType === 'file' ? 'selected' : ''}`}
          onClick={() => setInputType('file')}
        >
          <FileText size={64} />
          <div className="radio-circle">
             {inputType === 'file' && <div className="radio-dot" />}
          </div>
          <span style={{fontWeight: 'bold'}}>PDF/TXT</span>
        </div>
      </div>

      <div className="form-group">
        {inputType === 'file' ? (
           <div className="input-row">
             <input type="text" readOnly value={fileName || ""} placeholder="wybierz plik..." />
             <label className="btn-file-label">
                {readingFile ? "PRZETWARZANIE..." : "wybierz plik"}
                <input 
                  type="file" 
                  hidden 
                  accept=".txt,.md,.json,.py,.pdf" 
                  onChange={handleFileChange} 
                  disabled={readingFile}
                />
             </label>
           </div>
        ) : (
            <input type="text" placeholder="Wklej adres URL..." disabled />
        )}

        <div className="input-row">
            <span className="label-text">nazwa:</span>
            <input 
                type="text" 
                value={nazwa} 
                onChange={e => setNazwa(e.target.value)} 
            />
        </div>

        <textarea 
          value={tresc} 
          readOnly 
          placeholder="Tutaj pojawi się podgląd wczytanego tekstu..." 
          style={{width: '100%', height: '100px', marginTop: '10px', fontSize: '0.8rem', color: '#000'}}
        />

        <button className="btn-submit" onClick={handleSubmit} disabled={loading || readingFile || !tresc}>
            {loading ? "WYSYŁANIE..." : "dodaj do bazy >"}
        </button>
      </div>

      <div className="select-section">
        <h2 className="section-title">Wybierz plik</h2>
        <div className="select-wrapper">
            <Database size={64} />
            <select 
                value={activeTextId || ""} 
                onChange={(e) => setActiveTextId(Number(e.target.value))}
            >
                <option value="" disabled>-- wybierz tekst do nauki --</option>
                {teksty.map(t => (
                    <option key={t.id} value={t.id}>{t.nazwa}</option>
                ))}
            </select>
            <button className="btn-icon" onClick={handleDelete} title="Usuń wybrany tekst">
                <Trash2 size={24} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default AddTextPage;