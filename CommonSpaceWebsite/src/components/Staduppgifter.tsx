import { useState, useEffect } from 'react';
import {
    cleaningTasksApi,
    type CleaningTask
} from '../services/api';

const Staduppgifter = () => {
    const [cleaningTasks, setCleaningTasks] = useState<CleaningTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [newTaskText, setNewTaskText] = useState('');
    const [newTaskAssignee, setNewTaskAssignee] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const tasks = await cleaningTasksApi.getAll();
            setCleaningTasks(tasks);
        } catch (error) {
            console.error('Error loading cleaning tasks:', error);
        } finally {
            setLoading(false);
        }
    };

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

    if (loading) {
        return <div>Laddar städuppgifter...</div>;
    }

    return (
        <section className="bg-white rounded-xl p-6 shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg">
            <h2 className="mt-0 mb-5 text-[#2c3e50] text-2xl border-b-[3px] border-[#3498db] pb-2.5">🧹 Städuppgifter</h2>
            <div className="flex flex-col gap-2.5 mb-5 max-md:gap-2">
                <input
                    type="text"
                    placeholder="Ny städuppgift..."
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCleaningTask()}
                    className="p-3 border-2 border-[#e0e0e0] rounded-lg text-base text-black transition-colors focus:outline-none focus:border-[#3498db]"
                />
                <input
                    type="text"
                    placeholder="Ansvarig (valfritt)"
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCleaningTask()}
                    className="p-3 border-2 border-[#e0e0e0] rounded-lg text-base text-black transition-colors focus:outline-none focus:border-[#3498db]"
                />
                <button
                    onClick={addCleaningTask}
                    className="p-3 bg-[#3498db] text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all hover:bg-[#2980b9] active:scale-[0.98]"
                >
                    Lägg till
                </button>
            </div>
            <ul className="list-none p-0 m-0">
                {cleaningTasks.map((task) => (
                    <li
                        key={task.id}
                        className={`flex items-center gap-2.5 p-3 mb-2.5 rounded-lg border-l-4 border-l-[#3498db] transition-all hover:bg-[#e9ecef] hover:translate-x-1.5 ${task.completed ? 'opacity-60 border-l-[#27ae60]' : 'bg-[#f8f9fa]'
                            }`}
                    >
                        <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTaskComplete(task.id)}
                            className="w-5 h-5 cursor-pointer accent-[#27ae60]"
                        />
                        <span className={`flex-1 text-base text-[#2c3e50] ${task.completed ? 'line-through' : ''}`}>
                            {task.text}
                        </span>
                        {task.assignee && (
                            <span className="text-[0.85rem] text-[#7f8c8d] italic">({task.assignee})</span>
                        )}
                        <button
                            className="bg-none border-none text-[#e74c3c] text-2xl cursor-pointer p-0 w-8 h-8 flex items-center justify-center rounded-full transition-all hover:bg-[#e74c3c] hover:text-white"
                            onClick={() => deleteTask(task.id)}
                        >
                            ×
                        </button>
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default Staduppgifter;
