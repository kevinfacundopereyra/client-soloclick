import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen flex-col lg:flex-row font-system">
      {/* Left Side - Login Options */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 flex flex-col justify-center w-full max-w-2xl lg:max-w-none mx-auto lg:mx-0">
        {/* Header with back arrow */}
        <div 
          onClick={() => navigate('/')}
          className="absolute top-6 sm:top-8 left-4 sm:left-6 lg:left-8 flex items-center cursor-pointer text-gray-500 hover:text-gray-700"
        >
          <span className="text-xl sm:text-2xl mr-2">←</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-8 sm:mb-10 lg:mb-12 text-center">
          Regístrate/inicia sesión
        </h1>

        {/* Login Options */}
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Client Option */}
          <div 
            onClick={() => navigate('/register/user')}
            className="border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-indigo-400 bg-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 sm:mb-2">
                  Soloclick para clientes
                </h3>
                <p className="text-gray-500 text-sm sm:text-base">
                  Reserva en centros de belleza y spas cerca de ti
                </p>
              </div>
              <span className="text-xl sm:text-2xl text-indigo-600 flex-shrink-0">
                →
              </span>
            </div>
          </div>

          {/* Professional Option */}
          <div 
            onClick={() => navigate('/register/professional')}
            className="border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-indigo-400 bg-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 sm:mb-2">
                  Soloclick para profesionales
                </h3>
                <p className="text-gray-500 text-sm sm:text-base">
                  Gestiona tu negocio y hazlo crecer
                </p>
              </div>
              <span className="text-xl sm:text-2xl text-indigo-600 flex-shrink-0">
                →
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="hidden lg:flex absolute bottom-6 sm:bottom-8 left-4 sm:left-6 lg:left-8 flex-col gap-3 sm:gap-4 text-xs sm:text-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-indigo-600">
            <span>🌐 español (ES)</span>
            <span className="hidden sm:inline">❓ Ayuda y servicio al cliente</span>
          </div>
          <div className="text-gray-400 text-xs">
            <a href="#" className="text-indigo-600 no-underline hover:underline">
              https://partner.fresha.com/es/signup?app=seller&src=55&utm_source=fresha
            </a>
          </div>
        </div>
      </div>

      {/* Right Side - Image (hidden on mobile and tablet) */}
      <div className="hidden lg:flex lg:flex-1 relative bg-cover bg-center"
        style={{
          backgroundImage: 'url("https://www.ole.com.ar/images/2023/12/22/lSQI8IpKE_720x0__1.jpg")'
        }}>
        {/* Overlay to make image look more professional */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10" />
      </div>
    </div>
  );
};

export default LoginPage;