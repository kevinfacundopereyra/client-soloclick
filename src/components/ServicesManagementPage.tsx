import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import servicesService, { Service, CreateServiceData, UpdateServiceData } from '../services/servicesService';

// Interface local para el formulario

interface ServiceFormData {
  id?: string;
  name: string;
  description: string;
  price: string;
  duration: string;
  category: string;
  isActive: boolean;
}

const ServicesManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: '',
    price: '',
    duration: '60',
    category: '',
    isActive: true
  });

  const categories = [
    'Peluquería',
    'Barbería', 
    'Manicura/Pedicura',
    'Estética Facial',
    'Masajes',
    'Depilación',
    'Cejas y Pestañas',
    'Tatuajes',
    'Medicina Estética',
    'Dermatología',
    'Fisioterapia'
  ];

  // Verificar autenticación
  useEffect(() => {
    const user = authService.isAuthenticated() 
      ? JSON.parse(localStorage.getItem('user') || '{}') 
      : null;
    
    if (!user || !authService.isAuthenticated() || user.userType !== 'professional') {
      navigate('/');
      return;
    }

    loadServices();
  }, [navigate]);

  const loadServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await servicesService.getMyServices();
      if (response.success && response.services) {
        setServices(response.services);
      } else {
        // Si no hay servicios o es la primera vez, mostrar lista vacía
        setServices([]);
      }
    } catch (error) {
      console.error('Error cargando servicios:', error);
      // En caso de error de conexión, mostrar servicios de ejemplo
      const mockServices: Service[] = [
        {
          id: '1',
          name: 'Corte de cabello',
          description: 'Corte personalizado según tu estilo',
          price: 5000,
          duration: 60,
          category: 'Peluquería',
          isActive: true
        }
      ];
      setServices(mockServices);
      setError('Conectando con modo offline - los cambios no se guardarán');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ServiceFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const serviceData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        category: formData.category,
        isActive: formData.isActive
      };

      let response;
      
      if (editingService) {
        // Actualizar servicio existente
        const updateData: UpdateServiceData = {
          id: editingService.id!,
          ...serviceData
        };
        response = await servicesService.updateService(updateData);
      } else {
        // Crear nuevo servicio
        const createData: CreateServiceData = serviceData;
        response = await servicesService.createService(createData);
      }

      if (response.success) {
        // Recargar la lista de servicios
        await loadServices();
        
        // Limpiar formulario
        setFormData({
          name: '',
          description: '',
          price: '',
          duration: '60',
          category: '',
          isActive: true
        });
        
        setShowForm(false);
        setEditingService(null);
      } else {
        setError(response.message);
      }

    } catch (error) {
      console.error('Error guardando servicio:', error);
      setError('Error de conexión al guardar el servicio');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      duration: service.duration.toString(),
      category: service.category,
      isActive: service.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (serviceId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
      setLoading(true);
      try {
        const response = await servicesService.deleteService(serviceId);
        if (response.success) {
          await loadServices(); // Recargar lista
        } else {
          setError(response.message);
        }
      } catch (error) {
        console.error('Error eliminando servicio:', error);
        setError('Error de conexión al eliminar el servicio');
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleServiceStatus = async (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    setLoading(true);
    try {
      const response = await servicesService.toggleServiceStatus(serviceId, !service.isActive);
      if (response.success) {
        await loadServices(); // Recargar lista
      } else {
        setError(response.message);
      }
    } catch (error) {
      console.error('Error cambiando estado del servicio:', error);
      setError('Error de conexión al cambiar el estado del servicio');  
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f7fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <button
            onClick={() => navigate('/profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'none',
              border: 'none',
              color: '#4a5568',
              cursor: 'pointer',
              fontSize: '1rem',
              marginBottom: '0.5rem'
            }}
          >
            ← Volver al perfil
          </button>
          <h1 style={{ margin: 0, color: '#2d3748', fontSize: '1.5rem' }}>
            Gestión de Servicios
          </h1>
        </div>
        
        <button
          onClick={() => {
            setShowForm(true);
            setEditingService(null);
            setFormData({
              name: '',
              description: '',
              price: '',
              duration: '60',
              category: '',
              isActive: true
            });
          }}
          style={{
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          + Agregar Servicio
        </button>
      </div>

      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fed7d7',
            border: '1px solid #feb2b2',
            color: '#c53030',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        {/* Services Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            Cargando servicios...
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.5rem'
          }}>
            {services.map(service => (
              <div
                key={service.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: '1px solid #e2e8f0',
                  opacity: service.isActive ? 1 : 0.6
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      margin: '0 0 0.5rem 0', 
                      color: '#2d3748',
                      fontSize: '1.25rem'
                    }}>
                      {service.name}
                    </h3>
                    <p style={{ 
                      color: '#4a5568', 
                      margin: '0.5rem 0',
                      fontSize: '0.9rem'
                    }}>
                      {service.description}
                    </p>
                    <div style={{ 
                      display: 'flex', 
                      gap: '1rem', 
                      margin: '1rem 0',
                      fontSize: '0.9rem'
                    }}>
                      <span style={{ color: '#059669', fontWeight: 'bold' }}>
                        ${service.price.toLocaleString()}
                      </span>
                      <span style={{ color: '#6b7280' }}>
                        {service.duration} min
                      </span>
                      <span style={{ 
                        backgroundColor: '#e0e7ff',
                        color: '#4338ca',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.8rem'
                      }}>
                        {service.category}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button
                      onClick={() => toggleServiceStatus(service.id!)}
                      style={{
                        backgroundColor: service.isActive ? '#059669' : '#dc2626',
                        color: 'white',
                        border: 'none',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      {service.isActive ? 'Activo' : 'Inactivo'}
                    </button>
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  gap: '0.5rem', 
                  marginTop: '1rem',
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: '1rem'
                }}>
                  <button
                    onClick={() => handleEdit(service)}
                    style={{
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(service.id!)}
                    style={{
                      backgroundColor: '#dc2626',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      cursor: 'pointer'
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No services message */}
        {!loading && services.length === 0 && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '3rem',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#4a5568', marginBottom: '1rem' }}>
              No tienes servicios configurados
            </h3>
            <p style={{ color: '#718096', marginBottom: '2rem' }}>
              Agrega servicios para que los clientes puedan reservar contigo
            </p>
            <button
              onClick={() => setShowForm(true)}
              style={{
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Crear tu primer servicio
            </button>
          </div>
        )}
      </div>

      {/* Service Form Modal */}
      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#2d3748' }}>
              {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4a5568', fontWeight: 'bold' }}>
                  Nombre del servicio
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                  placeholder="ej: Corte de cabello"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4a5568', fontWeight: 'bold' }}>
                  Categoría
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4a5568', fontWeight: 'bold' }}>
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                  placeholder="Describe tu servicio..."
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4a5568', fontWeight: 'bold' }}>
                    Precio ($)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    required
                    min="0"
                    step="100"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                    placeholder="5000"
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4a5568', fontWeight: 'bold' }}>
                    Duración (min)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    required
                    min="15"
                    step="15"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                    placeholder="60"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  style={{ transform: 'scale(1.2)' }}
                />
                <label htmlFor="isActive" style={{ color: '#4a5568' }}>
                  Servicio activo (disponible para reservas)
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingService(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    backgroundColor: 'white',
                    color: '#4a5568'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    backgroundColor: loading ? '#a0aec0' : '#667eea',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                >
                  {loading ? 'Guardando...' : (editingService ? 'Actualizar' : 'Crear Servicio')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesManagementPage;