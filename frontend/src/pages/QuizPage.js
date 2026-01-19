import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Lightbulb, CheckCircle, RotateCcw } from 'lucide-react';
import { useApp } from '../AppContext';

const API_URL = "http://127.0.0.1:8000";

const QuizPage = () => {
  const { activeTextId } = useApp();
  const [stage, setStage] = useState('setup'); 
  
  const [questionCount, setQuestionCount] = useState(10);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [tekstNazwa, setTekstNazwa] = useState("");

  useEffect(() => {
    if (activeTextId) {
      axios.get(`${API_URL}/teksty/${activeTextId}`)
        .then(res => setTekstNazwa(res.data.nazwa))
        .catch(console.error);
    }
  }, [activeTextId]);

  const handleGenerate = async () => {
    setStage('loading');
    setQuestions([]);
    setUserAnswers({});

    try {
      const response = await axios.post(`${API_URL}/ai-quiz/${activeTextId}`, {
        ilosc_pytan: Number(questionCount)
      });
      
      setQuestions(response.data.pytania);
      setStage('quiz');
    } catch (error) {
      console.error(error);
      alert("Błąd generowania quizu. Spróbuj zmniejszyć liczbę pytań lub spróbuj ponownie.");
      setStage('setup');
    }
  };

  const handleSelectOption = (qIndex, optIndex) => {
    if (stage !== 'quiz') return;

    setUserAnswers(prev => ({
      ...prev,
      [qIndex]: optIndex
    }));
  };

  const handleFinish = () => {
    let newScore = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.indeks_poprawnej) {
        newScore++;
      }
    });
    setScore(newScore);
    setStage('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setStage('setup');
    setQuestions([]);
    setUserAnswers({});
    setScore(0);
  };

  const getOptionClass = (qIndex, optIndex, correctIndex) => {
    const isSelected = userAnswers[qIndex] === optIndex;
    
    if (stage === 'quiz') {
      return isSelected ? "answer-option selected" : "answer-option";
    }

    if (stage === 'results') {
      if (optIndex === correctIndex) return "answer-option result-correct";
      if (isSelected && optIndex !== correctIndex) return "answer-option result-wrong";
      return "answer-option result-dimmed";
    }
  };

  if (!activeTextId) {
    return (
        <div className="container" style={{marginTop: '5rem'}}>
            <h2>Nie wybrano tekstu!</h2>
            <p>Wróć do zakładki "Dodaj tekst" i wybierz plik do nauki.</p>
        </div>
    );
  }

  if (stage === 'setup' || stage === 'loading') {
    return (
      <div className="quiz-container">
        <h2 className="section-title" style={{marginTop: '2rem'}}>QUIZ</h2>
        <div style={{textAlign: 'center', marginBottom: '2rem', fontStyle: 'italic'}}>
            '{tekstNazwa}'
        </div>

        <div className="quiz-setup">
            <Lightbulb size={80} className="quiz-icon-large" />
            
            {stage === 'loading' ? (
                <h3>Generowanie pytań przez AI...</h3>
            ) : (
                <>
                    <div className="quiz-controls">
                        <label>ilość pytań:</label>
                        <input 
                            type="number" 
                            className="input-number"
                            value={questionCount}
                            min={5} max={30}
                            onChange={(e) => setQuestionCount(e.target.value)}
                        />
                    </div>
                    <button className="btn-submit" onClick={handleGenerate}>
                        generuj i rozwiąż &gt;
                    </button>
                </>
            )}
        </div>
      </div>
    );
  }

  const allAnswered = questions.length > 0 && Object.keys(userAnswers).length === questions.length;
  const letters = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="quiz-container">
      
      <div className="quiz-header">
        <button className="btn-icon" onClick={handleReset} title="Wróć do ustawień">
            <RotateCcw size={24} />
        </button>
        
        <div style={{textAlign: 'center'}}>
            <div style={{fontWeight:'bold', textTransform:'uppercase'}}>QUIZ</div>
            <div style={{fontSize:'0.9rem', opacity: 0.8}}>{tekstNazwa}</div>
        </div>

        {stage === 'results' ? (
             <div className="score-badge">
                zdobyte punkty: {score}/{questions.length}
             </div>
        ) : (
            <div style={{width: '100px'}}></div>
        )}
      </div>

      {questions.map((q, qIdx) => (
        <div key={qIdx} className="question-card">
            <div className="question-title">
                <span className="question-label">Pytanie {qIdx + 1}:</span>
                <span>{q.tresc}</span>
            </div>

            <div className="answers-grid">
                {q.odpowiedzi.map((opt, optIdx) => (
                    <div 
                        key={optIdx} 
                        className={getOptionClass(qIdx, optIdx, q.indeks_poprawnej)}
                        onClick={() => handleSelectOption(qIdx, optIdx)}
                    >
                        <div className="radio-circle">
                             {(stage === 'quiz' && userAnswers[qIdx] === optIdx) && <div className="radio-dot" />}
                             {(stage === 'results' && optIdx === q.indeks_poprawnej) && <CheckCircle size={16} color="white" />}
                        </div>
                        
                        <span className="option-letter">{letters[optIdx]}.</span>
                        <span>{opt.odp}</span>
                    </div>
                ))}
            </div>
        </div>
      ))}

      {stage === 'quiz' && (
          <div className="quiz-footer">
              <button 
                className="btn-submit" 
                onClick={handleFinish}
                disabled={!allAnswered}
                style={{ opacity: allAnswered ? 1 : 0.5, cursor: allAnswered ? 'pointer' : 'not-allowed' }}
              >
                  {allAnswered ? "sprawdź odpowiedzi >" : `zaznacz wszystkie (${Object.keys(userAnswers).length}/${questions.length})`}
              </button>
          </div>
      )}
    </div>
  );
};

export default QuizPage;