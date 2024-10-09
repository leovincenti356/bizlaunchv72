import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, deleteDoc, addDoc, collection } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { BusinessModule } from '../types';
import { useParams, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

const ModuleDetail: React.FC = () => {
  const [module, setModule] = useState<BusinessModule | null>(null);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const initializeModule = async () => {
      setLoading(true);
      setError(null);
      try {
        if (id === 'new') {
          if (!auth.currentUser) {
            throw new Error('User not authenticated');
          }
          setModule({
            id: '',
            userId: auth.currentUser.uid,
            name: 'New Module',
            description: '',
            type: 'idea',
            income: { daily: 0, weekly: 0, monthly: 0, yearly: 0 },
            tasks: [],
          });
        } else if (id) {
          await fetchModule(id);
        } else {
          throw new Error('Invalid module ID');
        }
      } catch (err: any) {
        console.error('Error initializing module:', err);
        setError(`Failed to load module: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    initializeModule();
  }, [id]);

  const fetchModule = async (moduleId: string) => {
    try {
      const moduleDoc = await getDoc(doc(db, 'modules', moduleId));
      if (moduleDoc.exists()) {
        setModule({ id: moduleDoc.id, ...moduleDoc.data() } as BusinessModule);
      } else {
        throw new Error('Module not found');
      }
    } catch (error: any) {
      console.error('Error fetching module:', error);
      throw new Error(`Failed to fetch module: ${error.message || 'Unknown error'}`);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!module) return;

    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }
      
      if (id === 'new') {
        const newModuleRef = await addDoc(collection(db, 'modules'), {
          ...module,
          userId: auth.currentUser.uid,
        });
        navigate(`/module/${newModuleRef.id}`);
      } else {
        await updateDoc(doc(db, 'modules', module.id), module);
      }
      navigate('/');
    } catch (error: any) {
      console.error('Error saving module:', error);
      setError(`Failed to save module: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDelete = async () => {
    try {
      if (module && module.id) {
        await deleteDoc(doc(db, 'modules', module.id));
        navigate('/');
      }
    } catch (error: any) {
      console.error('Error deleting module:', error);
      setError(`Failed to delete module: ${error.message || 'Unknown error'}`);
    }
  };

  const handleAddTask = () => {
    if (newTask.trim() && module) {
      const updatedTasks = [...module.tasks, { id: Date.now().toString(), description: newTask, completed: false }];
      setModule({ ...module, tasks: updatedTasks });
      setNewTask('');
    }
  };

  const handleToggleTask = (taskId: string) => {
    if (module) {
      const updatedTasks = module.tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      setModule({ ...module, tasks: updatedTasks });
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (module) {
      const updatedTasks = module.tasks.filter(task => task.id !== taskId);
      setModule({ ...module, tasks: updatedTasks });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (module) {
      if (name.startsWith('income.')) {
        const incomePeriod = name.split('.')[1] as keyof typeof module.income;
        setModule({
          ...module,
          income: { ...module.income, [incomePeriod]: parseFloat(value) || 0 },
        });
      } else {
        setModule({ ...module, [name]: value });
      }
    }
  };

  if (loading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  if (!module) {
    return <div className="text-center mt-8">No module found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <form onSubmit={handleSave} className="bg-gray-800 p-6 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-4">{id === 'new' ? 'Create New Module' : 'Edit Module'}</h2>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={module.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-700 rounded text-white"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
          <textarea
            id="description"
            name="description"
            value={module.description}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-700 rounded text-white"
            rows={3}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="type" className="block text-sm font-medium mb-1">Type</label>
          <select
            id="type"
            name="type"
            value={module.type}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-700 rounded text-white"
          >
            <option value="running">Running Business</option>
            <option value="idea">Business Idea</option>
          </select>
        </div>
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Income</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(module.income).map(([period, amount]) => (
              <div key={period}>
                <label htmlFor={`income.${period}`} className="block text-sm font-medium mb-1 capitalize">{period}</label>
                <input
                  type="number"
                  id={`income.${period}`}
                  name={`income.${period}`}
                  value={amount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 rounded text-white"
                  min="0"
                  step="0.01"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Tasks</h3>
          <ul>
            {module.tasks.map(task => (
              <li key={task.id} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggleTask(task.id)}
                  className="mr-2"
                />
                <span className={task.completed ? 'line-through' : ''}>{task.description}</span>
                <button type="button" onClick={() => handleDeleteTask(task.id)} className="ml-2 text-red-500">
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex mt-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="flex-grow mr-2 px-2 py-1 bg-gray-700 rounded"
              placeholder="New task"
            />
            <button type="button" onClick={handleAddTask} className="bg-blue-500 text-white px-4 py-1 rounded">
              Add
            </button>
          </div>
        </div>
        <div className="flex justify-between">
          <button type="button" onClick={() => navigate('/')} className="bg-gray-600 text-white px-4 py-2 rounded">
            Back to Dashboard
          </button>
          <div>
            {id !== 'new' && (
              <button type="button" onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded mr-2">
                Delete Module
              </button>
            )}
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
              Save Module
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ModuleDetail;