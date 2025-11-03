import React from 'react';
import { useNavigate } from 'react-router-dom';

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
  // Datos ficticios para las estadísticas
  const monthlyStats = {
    totalAppointments: 45,
    completedAppointments: 42,
    cancelledAppointments: 3,
    totalRevenue: 450000,
    averageRating: 4.8,
    newClients: 15,
    returnClients: 27
  };

  const weeklyData = [
    { day: 'Lunes', appointments: 8 },
    { day: 'Martes', appointments: 12 },
    { day: 'Miércoles', appointments: 10 },
    { day: 'Jueves', appointments: 15 },
    { day: 'Viernes', appointments: 14 },
    { day: 'Sábado', appointments: 8 },
    { day: 'Domingo', appointments: 0 }
  ];

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