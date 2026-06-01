import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import servicesService, { type Service, type CreateServiceData, type UpdateServiceData } from '../services/servicesService';

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center text-gray-600 hover:text-gray-900 text-sm sm:text-base mb-2 transition-colors"
            >
              ← Volver al perfil
            </button>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
              Gestión de Servicios
            </h1>
          </div>

          <button
            onClick={() => {
              setShowForm(true);
              setEditingService(null);
              setFormData({
                name: "",
                description: "",
                price: "",
                duration: "60",
                category: "",
                isActive: true,
              });
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-2.5 rounded-lg font-semibold transition-colors text-sm sm:text-base whitespace-nowrap"
          >
            + Agregar Servicio
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 sm:px-6 py-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Services Grid */}
        {loading ? (
          <div className="text-center py-8 text-gray-600">
            Cargando servicios...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className={`bg-white rounded-xl p-5 sm:p-6 shadow-md border border-gray-200 transition-opacity ${
                  service.isActive ? "opacity-100" : "opacity-60"
                }`}
              >
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                      {service.name}
                    </h3>
                    <p className="text-gray-700 text-sm mb-3">
                      {service.description}
                    </p>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <span className="font-semibold text-emerald-600">
                        ${service.price.toLocaleString()}
                      </span>
                      <span className="text-gray-600">
                        {service.duration} min
                      </span>
                      <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-medium">
                        {service.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => toggleServiceStatus(service.id!)}
                      className={`px-3 py-1.5 rounded text-sm font-semibold text-white whitespace-nowrap transition-colors ${
                        service.isActive
                          ? "bg-emerald-600 hover:bg-emerald-700"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {service.isActive ? "Activo" : "Inactivo"}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 border-t border-gray-200 pt-4">
                  <button
                    onClick={() => handleEdit(service)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(service.id!)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-medium transition-colors text-sm"
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
          <div className="bg-white rounded-xl p-8 sm:p-12 text-center shadow-md">
            <h3 className="text-gray-700 mb-3 text-lg sm:text-xl">
              No tienes servicios configurados
            </h3>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Agrega servicios para que los clientes puedan reservar contigo
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Crear tu primer servicio
            </button>
          </div>
        )}
      </div>

      {/* Service Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 sm:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">
              {editingService ? "Editar Servicio" : "Nuevo Servicio"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-5"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre del servicio
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  placeholder="ej: Corte de cabello"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white"
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  required
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-vertical"
                  placeholder="Describe tu servicio..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Precio ($)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    required
                    min="0"
                    step="100"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    placeholder="5000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duración (min)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      handleInputChange("duration", e.target.value)
                    }
                    required
                    min="15"
                    step="15"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    placeholder="60"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    handleInputChange("isActive", e.target.checked)
                  }
                  className="w-5 h-5 rounded"
                />
                <label htmlFor="isActive" className="text-gray-700 text-sm">
                  Servicio activo (disponible para reservas)
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingService(null);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
                >
                  {loading
                    ? "Guardando..."
                    : editingService
                    ? "Actualizar"
                    : "Crear Servicio"}
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