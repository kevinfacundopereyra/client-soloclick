import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import profileService from '../services/profileService';
import type { ProfileData, WorkingHours } from '../services/profileService';

const CompleteProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    description: '',
    address: '',
    workingHours: {
      monday: { open: '09:00', close: '18:00' },
      tuesday: { open: '09:00', close: '18:00' },
      wednesday: { open: '09:00', close: '18:00' },
      thursday: { open: '09:00', close: '18:00' },
      friday: { open: '09:00', close: '18:00' },
      saturday: { open: '10:00', close: '15:00' },
      sunday: { open: '', close: '' }
    },
    images: []
  });

  // Verificar que el usuario sea un profesional autenticado
  useEffect(() => {
    const user = authService.isAuthenticated() 
      ? JSON.parse(localStorage.getItem('user') || '{}') 
      : null;
    
    console.log('🔍 CompleteProfilePage - Usuario actual:', user);
    console.log('🔍 CompleteProfilePage - userType:', user?.userType);
    console.log('🔍 CompleteProfilePage - isAuthenticated:', authService.isAuthenticated());
    
    if (!user || !authService.isAuthenticated() || user.userType !== 'professional') {
      console.log('❌ Redirigiendo a home - Usuario no es profesional autenticado');
      navigate('/');
      return;
    }
    
    console.log('✅ Usuario profesional verificado - permaneciendo en CompleteProfile');
  }, [navigate]);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleWorkingHoursChange = (day: keyof WorkingHours, type: 'open' | 'close', value: string) => {
    setProfileData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [type]: value
        }
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Aquí harías la llamada al backend
      // const response = await profileService.updateProfile(profileData);
      
      // Por ahora simulamos éxito
      console.log('Datos del perfil a enviar:', profileData);
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('¡Perfil completado exitosamente!');
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error: any) {
      setError(error.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const daysOfWeek: { key: keyof WorkingHours; label: string }[] = [
    { key: 'monday', label: 'Lunes' },
    { key: 'tuesday', label: 'Martes' },
    { key: 'wednesday', label: 'Miércoles' },
    { key: 'thursday', label: 'Jueves' },
    { key: 'friday', label: 'Viernes' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '2rem',
        maxWidth: '800px',
        margin: '0 auto 2rem auto'
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer',
            marginRight: '1rem'
          }}
        >
          ← Volver
        </button>
        <h1 style={{ color: 'white', margin: 0 }}>Completar Perfil Profesional</h1>
      </div>

      {/* Form Card */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h2 style={{ color: '#2d3748', marginBottom: '0.5rem' }}>
            ¡Casi listo! 🎉
          </h2>
          <p style={{ color: '#4a5568', margin: 0 }}>
            Completa tu perfil para que los clientes puedan conocerte mejor
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div style={{
            background: '#fed7d7',
            border: '1px solid #feb2b2',
            color: '#c53030',
            padding: '0.75rem',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: '#c6f6d5',
            border: '1px solid #9ae6b4',
            color: '#2f855a',
            padding: '0.75rem',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Descripción del negocio */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#2d3748',
              fontWeight: '600'
            }}>
              Descripción de tu negocio *
            </label>
            <textarea
              value={profileData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
              rows={4}
              placeholder="Cuéntanos sobre tu negocio, experiencia, especialidades..."
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Dirección */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#2d3748',
              fontWeight: '600'
            }}>
              Dirección del local *
            </label>
            <input
              type="text"
              value={profileData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              required
              placeholder="Ej: Av. Corrientes 1234, CABA"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Horarios de atención */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              color: '#2d3748',
              marginBottom: '1rem',
              fontSize: '1.2rem',
              fontWeight: '600'
            }}>
              Horarios de atención
            </h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {daysOfWeek.map(({ key, label }) => (
                <div key={key} style={{
                  display: 'grid',
                  gridTemplateColumns: '100px 1fr 1fr',
                  gap: '1rem',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <label style={{ fontWeight: '500', color: '#2d3748' }}>
                    {label}
                  </label>
                  <input
                    type="time"
                    value={profileData.workingHours[key].open}
                    onChange={(e) => handleWorkingHoursChange(key, 'open', e.target.value)}
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '0.9rem'
                    }}
                  />
                  <input
                    type="time"
                    value={profileData.workingHours[key].close}
                    onChange={(e) => handleWorkingHoursChange(key, 'close', e.target.value)}
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              ))}
            </div>
            <p style={{ 
              fontSize: '0.85rem', 
              color: '#4a5568', 
              marginTop: '0.5rem',
              fontStyle: 'italic'
            }}>
              💡 Deja vacío si no trabajas ese día
            </p>
          </div>

          {/* Botones */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            paddingTop: '1rem',
            borderTop: '1px solid #e2e8f0'
          }}>
            <button
              type="button"
              onClick={() => navigate('/')}
              style={{
                background: 'transparent',
                border: '1px solid #d1d5db',
                color: '#4a5568',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Completar después
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#a0aec0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              {loading ? 'Guardando...' : 'Completar Perfil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfilePage;