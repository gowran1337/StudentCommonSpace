import { useState, useEffect } from 'react';
import './TaskBoard.css';
import CleaningOrder from '../components/CleaningOrder';
import {
  cleaningTasksApi,
  shoppingListApi,
  type CleaningTask,
  type ShoppingItem
} from '../services/api';

function TaskBoard() {
  const [cleaningTasks, setCleaningTasks] = useState<CleaningTask[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');

  const [newShoppingItem, setNewShoppingItem] = useState('');
  const [newShoppingQuantity, setNewShoppingQuantity] = useState('');
  const [newShoppingAddedBy, setNewShoppingAddedBy] = useState('');

  // Load data from API on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasks, shopping] = await Promise.all([
        cleaningTasksApi.getAll(),
        shoppingListApi.getAll(),
      ]);
      setCleaningTasks(tasks);
      setShoppingList(shopping);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cleaning Tasks Functions
  const addCleaningTask = async () => {
    if (newTaskText.trim()) {
      try {
        const newTask = await cleaningTasksApi.create({
          text: newTaskText,
          completed: false,
          assignee: newTaskAssignee,
        });
        setCleaningTasks([...cleaningTasks, newTask]);
        setNewTaskText('');
        setNewTaskAssignee('');
      } catch (error) {
        console.error('Error adding task:', error);
      }
    }
  };

  const toggleTaskComplete = async (id: number) => {
    const task = cleaningTasks.find((t) => t.id === id);
    if (task) {
      try {
        const updatedTask = { ...task, completed: !task.completed };
        await cleaningTasksApi.update(id, updatedTask);
        setCleaningTasks(
          cleaningTasks.map((t) => (t.id === id ? updatedTask : t))
        );
      } catch (error) {
        console.error('Error updating task:', error);
      }
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await cleaningTasksApi.delete(id);
      setCleaningTasks(cleaningTasks.filter((task) => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };



  // Shopping List Functions
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
    return (
      <div className="taskboard">
        <h1>Laddar...</h1>
      </div>
    );
  }

  return (
    <div className="taskboard">
      <h1>Studentens Anslagstavla</h1>

      <div className="taskboard-container">
        {/* Cleaning Order Section */}
        <CleaningOrder />
        {/* Cleaning Tasks Section */}
        <section className="taskboard-section">
          <h2>🧹 Städuppgifter</h2>
          <div className="add-item-form">
            <input
              type="text"
              placeholder="Ny städuppgift..."
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCleaningTask()}
            />
            <input
              type="text"
              placeholder="Ansvarig (valfritt)"
              value={newTaskAssignee}
              onChange={(e) => setNewTaskAssignee(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCleaningTask()}
            />
            <button onClick={addCleaningTask}>Lägg till</button>
          </div>
          <ul className="task-list">
            {cleaningTasks.map((task) => (
              <li key={task.id} className={task.completed ? 'completed' : ''}>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTaskComplete(task.id)}
                />
                <span className="task-text">{task.text}</span>
                {task.assignee && (
                  <span className="assignee">({task.assignee})</span>
                )}
                <button
                  className="delete-btn"
                  onClick={() => deleteTask(task.id)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Shopping List Section */}
        <section className="taskboard-section">
          <h2>🛒 Inköpslista</h2>
          <div className="add-item-form">
            <input
              type="text"
              placeholder="Vara..."
              value={newShoppingItem}
              onChange={(e) => setNewShoppingItem(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addShoppingItem()}
            />
            <input
              type="text"
              placeholder="Antal..."
              value={newShoppingQuantity}
              onChange={(e) => setNewShoppingQuantity(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addShoppingItem()}
            />
            <input
              type="text"
              placeholder="Tillagd av (valfritt)"
              value={newShoppingAddedBy}
              onChange={(e) => setNewShoppingAddedBy(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addShoppingItem()}
            />
            <button onClick={addShoppingItem}>Lägg till</button>
          </div>
          <ul className="shopping-list">
            {shoppingList.map((item) => (
              <li key={item.id} className={item.purchased ? 'purchased' : ''}>
                <input
                  type="checkbox"
                  checked={item.purchased}
                  onChange={() => toggleShoppingItemPurchased(item.id)}
                />
                <span className="item-name">{item.item}</span>
                <span className="item-quantity">{item.quantity}</span>
                {item.addedBy && (
                  <span className="added-by">({item.addedBy})</span>
                )}
                <button
                  className="delete-btn"
                  onClick={() => deleteShoppingItem(item.id)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default TaskBoard;
