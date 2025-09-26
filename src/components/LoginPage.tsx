import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Left Side - Login Options */}
      <div style={{
        flex: 1,
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        maxWidth: '500px',
        margin: '0 auto'
      }}>
        {/* Header with back arrow */}
        <div 
          onClick={() => navigate('/')}
          style={{
            position: 'absolute',
            top: '2rem',
            left: '2rem',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            color: '#4a5568'
          }}
        >
          <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>←</span>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#2d3748',
          marginBottom: '3rem',
          textAlign: 'center'
        }}>
          Regístrate/inicia sesión
        </h1>

        {/* Login Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Client Option */}
          <div 
            onClick={() => navigate('/register/user')}
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: '#2d3748',
                  margin: '0 0 0.5rem 0'
                }}>
                  Soloclick para clientes
                </h3>
                <p style={{
                  color: '#718096',
                  margin: 0,
                  fontSize: '0.95rem'
                }}>
                  Reserva en centros de belleza y spas cerca de ti
                </p>
              </div>
              <span style={{ 
                fontSize: '1.5rem', 
                color: '#667eea' 
              }}>
                →
              </span>
            </div>
          </div>

          {/* Professional Option */}
          <div 
            onClick={() => navigate('/register/professional')}
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: '#2d3748',
                  margin: '0 0 0.5rem 0'
                }}>
                  Soloclick para profesionales
                </h3>
                <p style={{
                  color: '#718096',
                  margin: 0,
                  fontSize: '0.95rem'
                }}>
                  Gestiona tu negocio y hazlo crecer
                </p>
              </div>
              <span style={{ 
                fontSize: '1.5rem', 
                color: '#667eea' 
              }}>
                →
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          position: 'absolute',
          bottom: '2rem',
          left: '2rem',
          right: '50%',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.9rem',
            color: '#667eea'
          }}>
            <span>🌐 español (ES)</span>
            <span>❓ Ayuda y servicio al cliente</span>
          </div>
          <div style={{
            fontSize: '0.8rem',
            color: '#a0aec0'
          }}>
            <a href="#" style={{ color: '#667eea', textDecoration: 'none' }}>
              https://partner.fresha.com/es/signup?app=seller&src=55&utm_source=fresha
            </a>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div style={{
        flex: 1,
        backgroundImage: 'url("https://www.ole.com.ar/images/2023/12/22/lSQI8IpKE_720x0__1.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative'
      }}>
        {/* Overlay to make image look more professional */}
        <div style={{
          position: 'absolute',
          inset: '0',
          background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))'
        }} />
      </div>
    </div>
  );
};

export default LoginPage;