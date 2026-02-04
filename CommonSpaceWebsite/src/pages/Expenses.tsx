import { useState, useEffect } from 'react';
import { expensesApi, settlementsApi, type Expense, type Settlement } from '../services/api';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Balance {
  [user: string]: number;
}

interface FlatMember {
  id: string;
  email: string;
  profile_picture: string;
}

const Expenses = () => {
  const { user, flatCode } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [flatMembers, setFlatMembers] = useState<FlatMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSettlement, setShowSettlement] = useState(false);
  
  // Form states
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitBetween, setSplitBetween] = useState<string[]>([]);
  const [settlementFrom, setSettlementFrom] = useState('');
  const [settlementTo, setSettlementTo] = useState('');
  const [settlementAmount, setSettlementAmount] = useState('');

  useEffect(() => {
    if (user && flatCode) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user, flatCode]);

  const loadData = async () => {
    if (!flatCode) return;
    
    try {
      // Load flat members
      const { data: members } = await supabase
        .from('profiles')
        .select('id, email, profile_picture')
        .eq('flat_code', flatCode);
      
      if (members) {
        setFlatMembers(members);
      }

      const [expensesData, settlementsData] = await Promise.all([
        expensesApi.getAll(),
        settlementsApi.getAll(),
      ]);
      setExpenses(expensesData);
      setSettlements(settlementsData);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateBalances = (): Balance => {
    const balances: Balance = {};
    flatMembers.forEach(m => balances[m.email] = 0);

    // Process expenses
    expenses.forEach(expense => {
      const share = expense.amount / expense.split_between.length;
      expense.split_between.forEach(person => {
        if (person !== expense.paid_by) {
          balances[person] -= share;
          balances[expense.paid_by] += share;
        }
      });
    });

    // Process settlements
    settlements.forEach(settlement => {
      balances[settlement.from_user] += settlement.amount;
      balances[settlement.to_user] -= settlement.amount;
    });

    return balances;
  };

  const getDebts = (): { from: string; to: string; amount: number }[] => {
    const balances = calculateBalances();
    const debts: { from: string; to: string; amount: number }[] = [];
    
    const creditors = Object.entries(balances).filter(([, amount]) => amount > 0.01).sort((a, b) => b[1] - a[1]);
    const debtors = Object.entries(balances).filter(([, amount]) => amount < -0.01).sort((a, b) => a[1] - b[1]);

    let i = 0, j = 0;
    while (i < creditors.length && j < debtors.length) {
      const [creditor, creditAmount] = creditors[i];
      const [debtor, debtAmount] = debtors[j];
      
      const amount = Math.min(creditAmount, Math.abs(debtAmount));
      debts.push({ from: debtor, to: creditor, amount });
      
      creditors[i][1] -= amount;
      debtors[j][1] += amount;
      
      if (creditors[i][1] < 0.01) i++;
      if (Math.abs(debtors[j][1]) < 0.01) j++;
    }

    return debts;
  };

  const handleAddExpense = async () => {
    if (!description || !amount || !paidBy || splitBetween.length === 0) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const newExpense = {
        description,
        amount: parseFloat(amount),
        paid_by: paidBy,
        split_between: splitBetween,
        date: new Date().toISOString(),
      };
      
      const created = await expensesApi.create(newExpense);
      setExpenses([created, ...expenses]);
      
      // Reset form
      setDescription('');
      setAmount('');
      setPaidBy('');
      setSplitBetween([]);
      setShowAddExpense(false);
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense');
    }
  };

  const handleSettlement = async () => {
    if (!settlementFrom || !settlementTo || !settlementAmount) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const newSettlement = {
        from_user: settlementFrom,
        to_user: settlementTo,
        amount: parseFloat(settlementAmount),
        date: new Date().toISOString(),
      };
      
      const created = await settlementsApi.create(newSettlement);
      setSettlements([created, ...settlements]);
      
      // Reset form
      setSettlementFrom('');
      setSettlementTo('');
      setSettlementAmount('');
      setShowSettlement(false);
    } catch (error) {
      console.error('Error recording settlement:', error);
      alert('Failed to record settlement');
    }
  };

  const handleDeleteExpense = async (id: number) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      await expensesApi.delete(id);
      setExpenses(expenses.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const toggleSplitPerson = (person: string) => {
    if (splitBetween.includes(person)) {
      setSplitBetween(splitBetween.filter(p => p !== person));
    } else {
      setSplitBetween([...splitBetween, person]);
    }
  };

  const balances = calculateBalances();
  const debts = getDebts();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 p-6 flex items-center justify-center">
        <h1 className="text-4xl font-bold text-white">Loading...</h1>
      </div>
    );
  }

  if (!flatCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 p-6 flex items-center justify-center">
        <div className="bg-yellow-900/30 border-2 border-yellow-500 rounded-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">Lägenhetskod saknas</h2>
          <p className="text-slate-300 mb-6">
            Du måste ange en lägenhetskod i din profil för att dela utgifter med dina rumskamrater.
          </p>
          <a
            href="/profile"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold transition-colors"
          >
            Gå till Profil
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-6">💰 Shared Expenses</h1>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setShowAddExpense(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            + Add Expense
          </button>
          <button
            onClick={() => setShowSettlement(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            💵 Settle Up
          </button>
        </div>

        {/* Balances Summary */}
        <div className="bg-slate-700 rounded-lg p-6 mb-6 shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-4">Who Owes Whom</h2>
          {debts.length === 0 ? (
            <p className="text-slate-300">All settled up! 🎉</p>
          ) : (
            <div className="space-y-3">
              {debts.map((debt, index) => (
                <div key={index} className="bg-slate-800 rounded-lg p-4 flex justify-between items-center">
                  <span className="text-slate-200">
                    <span className="font-semibold text-red-400">{debt.from}</span> owes{' '}
                    <span className="font-semibold text-green-400">{debt.to}</span>
                  </span>
                  <span className="text-2xl font-bold text-yellow-400">${debt.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Individual Balances */}
        <div className="bg-slate-700 rounded-lg p-6 mb-6 shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-4">Individual Balances</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {flatMembers.map(m => (
              <div key={m.id} className="bg-slate-800 rounded-lg p-4 text-center">
                <p className="text-slate-300 mb-2">{m.email.split('@')[0]}</p>
                <p className={`text-2xl font-bold ${
                  balances[m.email] > 0.01 ? 'text-green-400' : 
                  balances[m.email] < -0.01 ? 'text-red-400' : 
                  'text-slate-400'
                }`}>
                  {balances[m.email] > 0 ? '+' : ''}{balances[m.email].toFixed(2)} kr
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses List */}
        <div className="bg-slate-700 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-4">Recent Expenses</h2>
          <div className="space-y-3">
            {expenses.length === 0 ? (
              <p className="text-slate-300">No expenses yet. Add one to get started!</p>
            ) : (
              expenses.map(expense => (
                <div key={expense.id} className="bg-slate-800 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">{expense.description}</h3>
                      <p className="text-slate-400 text-sm mt-1">
                        Paid by <span className="font-semibold text-green-400">{expense.paid_by}</span>
                        {' • '}
                        Split between: {expense.split_between.join(', ')}
                      </p>
                      <p className="text-slate-500 text-xs mt-1">
                        {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-yellow-400">{expense.amount.toFixed(2)} kr</span>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-red-400 hover:text-red-300 transition"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add Expense Modal */}
        {showAddExpense && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-6 shadow-xl w-full max-w-md">
              <h3 className="text-2xl font-bold mb-4 text-white">Add New Expense</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 mb-2">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-600 rounded bg-slate-700 text-white"
                    placeholder="e.g., Groceries, Internet bill..."
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-2">Amount (kr)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-600 rounded bg-slate-700 text-white"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-2">Paid by</label>
                  <select
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-600 rounded bg-slate-700 text-white"
                  >
                    <option value="">Select person</option>
                    {flatMembers.map(m => (
                      <option key={m.id} value={m.email}>{m.email.split('@')[0]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-2">Split between</label>
                  <div className="grid grid-cols-2 gap-2">
                    {flatMembers.map(m => (
                      <button
                        key={m.id}
                        onClick={() => toggleSplitPerson(m.email)}
                        className={`px-4 py-2 rounded transition ${
                          splitBetween.includes(m.email)
                            ? 'bg-green-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {m.email.split('@')[0]}
                      </button>
                    ))}
                  </div>
                  {splitBetween.length > 0 && (
                    <p className="text-slate-400 text-sm mt-2">
                      {(parseFloat(amount) / splitBetween.length).toFixed(2)} kr per person
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleAddExpense}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Add Expense
                </button>
                <button
                  onClick={() => {
                    setShowAddExpense(false);
                    setDescription('');
                    setAmount('');
                    setPaidBy('');
                    setSplitBetween([]);
                  }}
                  className="flex-1 bg-slate-600 text-white px-4 py-2 rounded hover:bg-slate-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settlement Modal */}
        {showSettlement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-6 shadow-xl w-full max-w-md">
              <h3 className="text-2xl font-bold mb-4 text-white">Record Settlement</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 mb-2">From</label>
                  <select
                    value={settlementFrom}
                    onChange={(e) => setSettlementFrom(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-600 rounded bg-slate-700 text-white"
                  >
                    <option value="">Select person</option>
                    {flatMembers.map(m => (
                      <option key={m.id} value={m.email}>{m.email.split('@')[0]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-2">To</label>
                  <select
                    value={settlementTo}
                    onChange={(e) => setSettlementTo(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-600 rounded bg-slate-700 text-white"
                  >
                    <option value="">Select person</option>
                    {flatMembers.map(m => (
                      <option key={m.id} value={m.email}>{m.email.split('@')[0]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-2">Amount (kr)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settlementAmount}
                    onChange={(e) => setSettlementAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-600 rounded bg-slate-700 text-white"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleSettlement}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Record Settlement
                </button>
                <button
                  onClick={() => {
                    setShowSettlement(false);
                    setSettlementFrom('');
                    setSettlementTo('');
                    setSettlementAmount('');
                  }}
                  className="flex-1 bg-slate-600 text-white px-4 py-2 rounded hover:bg-slate-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Expenses;
