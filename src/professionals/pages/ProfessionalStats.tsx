import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_CONFIG } from '../../config/api';

const api = axios.create({ baseURL: API_CONFIG.BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <div style={{
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <span style={{ 
        fontSize: '1rem', 
        color: '#4a5568',
        fontWeight: '500'
      }}>{title}</span>
      <span style={{
        background: `${color}20`,
        color: color,
        padding: '0.5rem',
        borderRadius: '8px',
        fontSize: '1.25rem'
      }}>{icon}</span>
    </div>
    <div style={{
      fontSize: '1.75rem',
      fontWeight: 'bold',
      color: '#2d3748'
    }}>
      {value}
    </div>
  </div>
);

interface ChartBarProps {
  label: string;
  value: number;
  maxValue: number;
  color: string;
}

const ChartBar: React.FC<ChartBarProps> = ({ label, value, maxValue, color }) => (
  <div style={{ marginBottom: '1rem' }}>
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between',
      marginBottom: '0.5rem'
    }}>
      <span style={{ color: '#4a5568' }}>{label}</span>
      <span style={{ color: '#2d3748', fontWeight: '500' }}>{value}</span>
    </div>
    <div style={{ 
      height: '8px',
      background: '#edf2f7',
      borderRadius: '4px',
      overflow: 'hidden'
    }}>
      <div
        style={{
          width: `${(value / maxValue) * 100}%`,
          height: '100%',
          background: color,
          transition: 'width 1s ease-in-out'
        }}
      />
    </div>
  </div>
);

const ProfessionalStats: React.FC = () => {
  const navigate = useNavigate();
  const [monthlyStats, setMonthlyStats] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    totalRevenue: 0,
    averageRating: 0,
    newClients: 0,
    returnClients: 0
  });

  const [weeklyData, setWeeklyData] = useState([
    { day: 'Lunes', appointments: 0 },
    { day: 'Martes', appointments: 0 },
    { day: 'Miércoles', appointments: 0 },
    { day: 'Jueves', appointments: 0 },
    { day: 'Viernes', appointments: 0 },
    { day: 'Sábado', appointments: 0 },
    { day: 'Domingo', appointments: 0 }
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const user = JSON.parse(userStr);
        const professionalId = user.id || user._id;

        if (!professionalId) return;

        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Fetch appointments del profesional
        const appointmentsRes = await api.get(`/appointments/professional/${professionalId}`);
        const allAppointments = appointmentsRes.data || [];
        
        // Filtrar citas del mes actual
        const appointments = allAppointments.filter((a: any) => new Date(a.date) >= firstDayOfMonth);

        // Fetch perfil del profesional para obtener el rating
        let avgRating = 0;
        try {
          const profRes = await api.get(`/professionals/${professionalId}`);
          const rawRating = profRes.data?.rating || profRes.data?.professional?.rating || 0;
          avgRating = Number(Number(rawRating).toFixed(1));
        } catch (e) {
          console.warn("No se pudo cargar el perfil del profesional", e);
        }

        // Calcular estadísticas mensuales
        const completed = appointments.filter((a: any) => a.status === 'completed').length;
        const cancelled = appointments.filter((a: any) => a.status === 'cancelled').length;
        // Calcular ingresos a partir del totalPrice de las citas completadas
        const totalRevenue = appointments
          .filter((a: any) => a.status === 'completed')
          .reduce((sum: number, a: any) => sum + (a.totalPrice || 0), 0);

        // Calcular clientes nuevos vs recurrentes
        const clientCounts: { [key: string]: number } = {};
        appointments.forEach((apt: any) => {
          const clientId = apt.client?._id || apt.client?.id || apt.clientId || apt.user?._id || apt.user;
          if (clientId) {
            const idStr = typeof clientId === 'object' ? clientId._id || clientId.id : clientId;
            clientCounts[idStr] = (clientCounts[idStr] || 0) + 1;
          }
        });
        const newClients = Object.values(clientCounts).filter(count => count === 1).length;
        const returnClients = Math.max(0, appointments.length - newClients);

        setMonthlyStats({
          totalAppointments: appointments.length,
          completedAppointments: completed,
          cancelledAppointments: cancelled,
          totalRevenue: totalRevenue,
          averageRating: avgRating,
          newClients,
          returnClients
        });

        // Calcular citas por día de la semana
        const appointmentsByDay = { Lunes: 0, Martes: 0, Miércoles: 0, Jueves: 0, Viernes: 0, Sábado: 0, Domingo: 0 };
        const daysMap: { [key: number]: string } = {
          0: 'Domingo',
          1: 'Lunes',
          2: 'Martes',
          3: 'Miércoles',
          4: 'Jueves',
          5: 'Viernes',
          6: 'Sábado'
        };

        appointments.forEach((apt: any) => {
          const date = new Date(apt.date);
          // Ajustar zona horaria si la fecha viene en formato YYYY-MM-DD (para evitar que un día pase a ser el día anterior por el UTC)
          if (apt.date && apt.date.length === 10) {
            date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
          }
          const dayName = daysMap[date.getDay()];
          if (dayName in appointmentsByDay) {
            appointmentsByDay[dayName as keyof typeof appointmentsByDay]++;
          }
        });

        const newWeeklyData = [
          { day: 'Lunes', appointments: appointmentsByDay.Lunes },
          { day: 'Martes', appointments: appointmentsByDay.Martes },
          { day: 'Miércoles', appointments: appointmentsByDay.Miércoles },
          { day: 'Jueves', appointments: appointmentsByDay.Jueves },
          { day: 'Viernes', appointments: appointmentsByDay.Viernes },
          { day: 'Sábado', appointments: appointmentsByDay.Sábado },
          { day: 'Domingo', appointments: appointmentsByDay.Domingo }
        ];
        setWeeklyData(newWeeklyData);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const maxAppointments = Math.max(...weeklyData.map(d => d.appointments));

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      minHeight: '100vh',
      background: '#f7fafc'
    }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          background: "rgba(0, 0, 0, 0.1)",
          border: "1px solid rgba(0, 0, 0, 0.2)",
          color: "#2d3748",
          padding: "0.5rem 1rem",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "0.9rem",
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem"
        }}
      >
        ← Volver
      </button>

      <h1 style={{
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#2d3748',
        marginBottom: '2rem'
      }}>
        Estadísticas del Mes
      </h1>

      {/* Grid de estadísticas principales */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <StatCard
          title="Citas Totales"
          value={monthlyStats.totalAppointments}
          icon="📅"
          color="#4299e1"
        />
        <StatCard
          title="Ingresos"
          value={`$${monthlyStats.totalRevenue.toLocaleString()}`}
          icon="💰"
          color="#48bb78"
        />
        <StatCard
          title="Calificación Promedio"
          value={`${monthlyStats.averageRating} ⭐`}
          icon="⭐"
          color="#ecc94b"
        />
        <StatCard
          title="Nuevos Clientes"
          value={monthlyStats.newClients}
          icon="👥"
          color="#ed64a6"
        />
      </div>

      {/* Sección de análisis detallado */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Gráfico de citas por día */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#2d3748',
            marginBottom: '1.5rem'
          }}>
            Citas por Día de la Semana
          </h2>
          {weeklyData.map((day) => (
            <ChartBar
              key={day.day}
              label={day.day}
              value={day.appointments}
              maxValue={maxAppointments}
              color="#4299e1"
            />
          ))}
        </div>

        {/* Métricas adicionales */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#2d3748',
            marginBottom: '1.5rem'
          }}>
            Métricas Detalladas
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ color: '#4a5568', marginBottom: '0.5rem' }}>Tasa de Completación</div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem'
              }}>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: '#edf2f7',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div
                    style={{
                      width: `${(monthlyStats.completedAppointments / monthlyStats.totalAppointments) * 100}%`,
                      height: '100%',
                      background: '#48bb78'
                    }}
                  />
                </div>
                <span style={{ 
                  color: '#48bb78',
                  fontWeight: '500'
                }}>
                  {Math.round((monthlyStats.completedAppointments / monthlyStats.totalAppointments) * 100)}%
                </span>
              </div>
            </div>

            <div>
              <div style={{ color: '#4a5568', marginBottom: '0.5rem' }}>Clientes Recurrentes vs. Nuevos</div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem'
              }}>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: '#edf2f7',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  display: 'flex'
                }}>
                  <div
                    style={{
                      width: `${(monthlyStats.returnClients / (monthlyStats.returnClients + monthlyStats.newClients)) * 100}%`,
                      height: '100%',
                      background: '#4299e1'
                    }}
                  />
                  <div
                    style={{
                      width: `${(monthlyStats.newClients / (monthlyStats.returnClients + monthlyStats.newClients)) * 100}%`,
                      height: '100%',
                      background: '#ed64a6'
                    }}
                  />
                </div>
                <span style={{ 
                  color: '#4299e1',
                  fontWeight: '500'
                }}>
                  {Math.round((monthlyStats.returnClients / (monthlyStats.returnClients + monthlyStats.newClients)) * 100)}%
                </span>
              </div>
              <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                marginTop: '0.5rem',
                fontSize: '0.875rem'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '4px', background: '#4299e1' }}></div>
                  Recurrentes
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '4px', background: '#ed64a6' }}></div>
                  Nuevos
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de rendimiento */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#2d3748',
          marginBottom: '1.5rem'
        }}>
          Resumen de Rendimiento
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem'
        }}>
          <div>
            <div style={{ color: '#4a5568', marginBottom: '0.25rem' }}>Citas Completadas</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#48bb78' }}>
              {monthlyStats.completedAppointments}
            </div>
          </div>
          <div>
            <div style={{ color: '#4a5568', marginBottom: '0.25rem' }}>Citas Canceladas</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f56565' }}>
              {monthlyStats.cancelledAppointments}
            </div>
          </div>
          <div>
            <div style={{ color: '#4a5568', marginBottom: '0.25rem' }}>Promedio Diario</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4299e1' }}>
              {(monthlyStats.totalAppointments / 30).toFixed(1)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalStats;