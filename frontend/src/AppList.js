import AppItem from "./AppItem"
import { items } from "./items"
import { useState } from "react"

export function AppList() {
    const [localItems, setlocalItems] = useState(items);
    const [newItem, setNewItem] = useState("");

    function onDelete(id) {
        setlocalItems(localItems.filter(li => li.id !== id));
    }

    function onAdd(event) {
        event.preventDefault();
        const newLocalItems = [...localItems];
        newLocalItems.push({ 
            label: newItem, 
            id: (localItems.length > 0 ? Math.max(...localItems.map(li => li.id)) + 1 : 1) 
        })
        setlocalItems(newLocalItems);
    }

    function onUpdateItem(id, newLabel) {        
        const newLocalItems = localItems.map((li) => {
            if(li.id === id) {
                return {...li, label: newLabel};
            }
            return li;
        })
        setlocalItems(newLocalItems);
    }

    return (<>
        <form onSubmit={onAdd}>
            <label>Nowy:</label>
            <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)}/>
            <input type="submit" value="Dodaj"/>
        </form>
        <ul>
            {localItems.map(item => (
                <li key={item.id}>
                    <AppItem 
                        label={item.label} 
                        onDelete={() => onDelete(item.id)}
                        onItemUpdate={(newLabel) => onUpdateItem(item.id, newLabel)}
                    />
                </li>
            ))}
        </ul>
    </>)
}