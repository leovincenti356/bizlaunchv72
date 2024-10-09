import React, { useEffect, useRef } from 'react';
import { auth } from '../firebase';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import { X } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const uiRef = useRef<firebaseui.auth.AuthUI | null>(null);

  useEffect(() => {
    const uiConfig: firebaseui.auth.Config = {
      signInOptions: [
        {
          provider: firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID,
        },
        {
          provider: firebaseui.auth.EmailAuthProvider.PROVIDER_ID,
          requireDisplayName: false,
        },
      ],
      signInFlow: 'popup',
      callbacks: {
        signInSuccessWithAuthResult: () => {
          onClose();
          return false;
        },
      },
    };

    if (uiRef.current) {
      uiRef.current.reset();
    } else {
      uiRef.current = new firebaseui.auth.AuthUI(auth);
    }

    uiRef.current.start('#firebaseui-auth-container', uiConfig);

    return () => {
      uiRef.current?.delete();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-dark-700 p-8 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-100">Sign In / Register</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            <X size={24} />
          </button>
        </div>
        <div id="firebaseui-auth-container"></div>
      </div>
    </div>
  );
};

export default AuthModal;