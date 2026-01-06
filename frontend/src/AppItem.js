import { useState } from 'react'

export default function AppItem({ label, onDelete, onItemUpdate }) {
    const [edit, setEdit] = useState(false);
    const [newLabel, setNewLabel] = useState(label);

    function onUpdate(e) {
        e.preventDefault();
        onItemUpdate(newLabel);
        setEdit(false);
    }

    function onChange(e) {
        setNewLabel(e)
    }

    function onCancel() {
        setNewLabel(label)
        setEdit(false)
    }
    
    return (<>
        {!edit ? (
            <div>
                <span>{label}</span> 
                <button onClick={onDelete}>Usuń</button>
                <button onClick={() => setEdit(true)}>Edytuj</button>
            </div>
            ) : (            
                <div>
                    <form onSubmit={onUpdate}>
                        <input type="text" value={newLabel} onChange={(e) => onChange(e.target.value)} />
                        <input type="button" value="Anuluj" onClick={() => onCancel()}/>
                        <input type="submit" value="Zapisz" />
                    </form>
                </div>
            )}
        </>
    )
}