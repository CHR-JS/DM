import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Apple, Facebook, Mail } from 'lucide-react';
import Logo from '../Logo';
import toast from 'react-hot-toast';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithProvider } = useAuthStore();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Connexion réussie !');
    } catch (error) {
      toast.error('Email ou mot de passe incorrect');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    try {
      await loginWithProvider(provider);
      toast.success(`Connexion avec ${provider} réussie !`);
    } catch (error) {
      toast.error(`Erreur de connexion avec ${provider}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-pink-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>
        
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading}
            className="w-full p-3 border rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors relative"
          >
            <img 
              src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png"
              alt="Google"
              className="w-5 h-5"
            />
            Continuer avec Google
          </button>
          
          <button
            onClick={() => handleSocialLogin('apple')}
            disabled={isLoading}
            className="w-full p-3 border rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <Apple className="w-5 h-5" />
            Continuer avec Apple
          </button>
          
          <button
            onClick={() => handleSocialLogin('facebook')}
            disabled={isLoading}
            className="w-full p-3 border rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <Facebook className="w-5 h-5 text-[#1877F2]" />
            Continuer avec Facebook
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">ou</span>
          </div>
        </div>
        
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
              required
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
              required
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Mail className="w-5 h-5" />
                Se connecter avec Email
              </>
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center space-y-2">
          <button className="text-sm text-purple-600 hover:text-purple-700">
            Mot de passe oublié ?
          </button>
          <p className="text-sm text-gray-600">
            Pas encore de compte ?{' '}
            <button className="text-purple-600 hover:text-purple-700 font-medium">
              S'inscrire
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;