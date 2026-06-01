import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { authService } from "../services/authService";

const SignInPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(formData.email, formData.password);

      
      // Logs para debugging
      console.log('Backend response:', response);
      
      // Validación más estricta: SOLO éxito si tiene success=true Y token Y usuario
      if (response.success && response.token && response.user) {
        console.log('✅ Login exitoso - guardando sesión');
        authService.saveSession(response.token, response.user);
        alert('¡Inicio de sesión exitoso!');
        navigate('/');
      } else {
        // Cualquier otra cosa es error
        console.log('❌ Login falló - falta success, token o user');
        console.log('- success:', response.success);
        console.log('- token:', !!response.token);
        console.log('- user:', !!response.user);
        setError(response.message || 'Credenciales incorrectas');

      }
    } catch (error: any) {
      setError(error.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row font-system">
      {/* Left Side - Login Form */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 flex flex-col justify-center w-full max-w-2xl lg:max-w-none mx-auto lg:mx-0">
        {/* Header with back arrow */}
        <div 
          onClick={() => navigate('/')}
          className="absolute top-6 sm:top-8 left-4 sm:left-6 lg:left-8 flex items-center cursor-pointer text-gray-600 hover:text-gray-800"
        >
          <span className="text-xl sm:text-2xl mr-2">←</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 lg:mb-6 text-center">
          Iniciar Sesión
        </h1>

        <p className="text-center text-gray-500 text-sm sm:text-base mb-6 sm:mb-8 lg:mb-10">
          Ingresa a tu cuenta de SoloClick
        </p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 sm:mb-6 text-sm sm:text-base text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-6">
          <div>
            <label className="block mb-2 sm:mb-3 text-gray-800 font-medium text-sm sm:text-base">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-lg text-sm sm:text-base outline-none transition-colors duration-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              onFocus={(e) => e.currentTarget.classList.add('border-indigo-600')}
              onBlur={(e) => e.currentTarget.classList.remove('border-indigo-600')}
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block mb-2 sm:mb-3 text-gray-800 font-medium text-sm sm:text-base">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-lg text-sm sm:text-base outline-none transition-colors duration-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              onFocus={(e) => e.currentTarget.classList.add('border-indigo-600')}
              onBlur={(e) => e.currentTarget.classList.remove('border-indigo-600')}
              placeholder="Tu contraseña"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold text-white transition-colors duration-200 text-sm sm:text-base ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
            }`}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        {/* Register Link */}
        <div className="text-center mt-6 sm:mt-8 text-gray-500 text-sm sm:text-base">
          ¿No tienes cuenta?{' '}
          <button
            onClick={() => navigate('/login')}
            className="bg-transparent border-0 text-indigo-600 cursor-pointer underline hover:text-indigo-700 transition-colors text-sm sm:text-base"
          >
            Regístrate aquí
          </button>
        </div>
      </div>

      {/* Right Side - Image (hidden on mobile and tablet) */}
      <div className="hidden lg:flex lg:flex-1 relative bg-cover bg-center"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80")'
        }}>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20" />
      </div>
    </div>
  );
};

export default SignInPage;