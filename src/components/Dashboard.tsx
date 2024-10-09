import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { BusinessModule } from '../types';
import { DollarSign, PlusCircle, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ModuleForm from './ModuleForm';

const Dashboard: React.FC<{ user: User }> = ({ user }) => {
  const [modules, setModules] = useState<BusinessModule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchModules = async () => {
      const modulesQuery = query(collection(db, 'modules'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(modulesQuery);
      const fetchedModules = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BusinessModule));
      setModules(fetchedModules);
    };

    fetchModules();
  }, [user.uid]);

  const handleCreateModule = async (newModule: Omit<BusinessModule, 'id' | 'userId'>) => {
    try {
      const moduleData = {
        ...newModule,
        userId: user.uid,
        createdAt: new Date(),
      };
      
      const docRef = await addDoc(collection(db, 'modules'), moduleData);
      
      setModules([...modules, { id: docRef.id, ...moduleData } as BusinessModule]);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating new module:', error);
    }
  };

  const handleLogout = () => {
    auth.signOut();
    navigate('/login');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Business Module Dashboard</h1>
        <button onClick={handleLogout} className="flex items-center bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
          <LogOut size={18} className="mr-2" />
          Logout
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Link key={module.id} to={`/module/${module.id}`} className="bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">{module.name}</h2>
            <p className="text-gray-400 mb-4">{module.description}</p>
            <div className="flex items-center text-green-500">
              <DollarSign size={18} className="mr-2" />
              <span>${module.income.monthly.toFixed(2)}/month</span>
            </div>
          </Link>
        ))}
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col items-center justify-center text-blue-500 hover:text-blue-400"
        >
          <PlusCircle size={48} className="mb-2" />
          <span className="text-lg font-semibold">Create New Module</span>
        </button>
      </div>
      {isModalOpen && (
        <ModuleForm onSave={handleCreateModule} onCancel={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

export default Dashboard;