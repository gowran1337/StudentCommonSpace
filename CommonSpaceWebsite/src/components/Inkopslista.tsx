import { useState, useEffect } from 'react';
import {
    shoppingListApi,
    type ShoppingItem
} from '../services/api';

const Inkopslista = () => {
    const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [newShoppingItem, setNewShoppingItem] = useState('');
    const [newShoppingQuantity, setNewShoppingQuantity] = useState('');
    const [newShoppingAddedBy, setNewShoppingAddedBy] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const shopping = await shoppingListApi.getAll();
            setShoppingList(shopping);
        } catch (error) {
            console.error('Error loading shopping list:', error);
        } finally {
            setLoading(false);
        }
    };

    const addShoppingItem = async () => {
        if (newShoppingItem.trim()) {
            try {
                const newItem = await shoppingListApi.create({
                    item: newShoppingItem,
                    quantity: newShoppingQuantity,
                    purchased: false,
                    addedBy: newShoppingAddedBy,
                });
                setShoppingList([...shoppingList, newItem]);
                setNewShoppingItem('');
                setNewShoppingQuantity('');
                setNewShoppingAddedBy('');
            } catch (error) {
                console.error('Error adding shopping item:', error);
            }
        }
    };

    const toggleShoppingItemPurchased = async (id: number) => {
        const item = shoppingList.find((i) => i.id === id);
        if (item) {
            try {
                const updatedItem = { ...item, purchased: !item.purchased };
                await shoppingListApi.update(id, updatedItem);
                setShoppingList(
                    shoppingList.map((i) => (i.id === id ? updatedItem : i))
                );
            } catch (error) {
                console.error('Error updating shopping item:', error);
            }
        }
    };

    const deleteShoppingItem = async (id: number) => {
        try {
            await shoppingListApi.delete(id);
            setShoppingList(shoppingList.filter((item) => item.id !== id));
        } catch (error) {
            console.error('Error deleting shopping item:', error);
        }
    };

    if (loading) {
        return <div>Laddar inköpslista...</div>;
    }

    return (
        <section className="bg-white rounded-xl p-6 shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg">
            <h2 className="mt-0 mb-5 text-[#2c3e50] text-2xl border-b-[3px] border-[#3498db] pb-2.5">🛒 Inköpslista</h2>
            <div className="flex flex-col gap-2.5 mb-5 max-md:gap-2">
                <input
                    type="text"
                    placeholder="Vara..."
                    value={newShoppingItem}
                    onChange={(e) => setNewShoppingItem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addShoppingItem()}
                    className="p-3 border-2 border-[#e0e0e0] rounded-lg text-base text-black transition-colors focus:outline-none focus:border-[#3498db]"
                />
                <input
                    type="text"
                    placeholder="Antal..."
                    value={newShoppingQuantity}
                    onChange={(e) => setNewShoppingQuantity(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addShoppingItem()}
                    className="p-3 border-2 border-[#e0e0e0] rounded-lg text-base text-black transition-colors focus:outline-none focus:border-[#3498db]"
                />
                <input
                    type="text"
                    placeholder="Tillagd av (valfritt)"
                    value={newShoppingAddedBy}
                    onChange={(e) => setNewShoppingAddedBy(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addShoppingItem()}
                    className="p-3 border-2 border-[#e0e0e0] rounded-lg text-base text-black transition-colors focus:outline-none focus:border-[#3498db]"
                />
                <button
                    onClick={addShoppingItem}
                    className="p-3 bg-[#3498db] text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all hover:bg-[#2980b9] active:scale-[0.98]"
                >
                    Lägg till
                </button>
            </div>
            <ul className="list-none p-0 m-0">
                {shoppingList.map((item) => (
                    <li
                        key={item.id}
                        className={`flex items-center gap-2.5 p-3 mb-2.5 rounded-lg border-l-4 border-l-[#3498db] transition-all hover:bg-[#e9ecef] hover:translate-x-1.5 ${item.purchased ? 'opacity-60 border-l-[#27ae60]' : 'bg-[#f8f9fa]'
                            }`}
                    >
                        <input
                            type="checkbox"
                            checked={item.purchased}
                            onChange={() => toggleShoppingItemPurchased(item.id)}
                            className="w-5 h-5 cursor-pointer accent-[#27ae60]"
                        />
                        <span className={`flex-1 text-base text-[#2c3e50] ${item.purchased ? 'line-through' : ''}`}>
                            {item.item}
                        </span>
                        <span className="text-[0.9rem] text-[#95a5a6] bg-[#ecf0f1] px-2 py-1 rounded">
                            {item.quantity}
                        </span>
                        {item.addedBy && (
                            <span className="text-[0.85rem] text-[#7f8c8d] italic">({item.addedBy})</span>
                        )}
                        <button
                            className="bg-none border-none text-[#e74c3c] text-2xl cursor-pointer p-0 w-8 h-8 flex items-center justify-center rounded-full transition-all hover:bg-[#e74c3c] hover:text-white"
                            onClick={() => deleteShoppingItem(item.id)}
                        >
                            ×
                        </button>
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default Inkopslista;
