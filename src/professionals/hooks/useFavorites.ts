import { useState, useEffect, useCallback } from 'react';
import favoritesService from '../../services/favoritesService';

interface UseFavoritesReturn {
  favorites: string[];
  isFavorite: (professionalId: string) => boolean;
  toggleFavorite: (professionalId: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export const useFavorites = (): UseFavoritesReturn => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar favoritos al inicializar
  useEffect(() => {
    const loadFavorites = () => {
      try {
        const currentFavorites = favoritesService.getFavorites();
        setFavorites(currentFavorites);
      } catch (err) {
        setError('Error al cargar favoritos');
        console.error('Error cargando favoritos:', err);
      }
    };

    loadFavorites();
  }, []);

  // Función para verificar si un profesional es favorito
  const isFavorite = useCallback((professionalId: string): boolean => {
    return favorites.includes(professionalId);
  }, [favorites]);

  // Función para alternar favorito
  const toggleFavorite = useCallback(async (professionalId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await favoritesService.toggleFavorite(professionalId);
      
      if (result.success && result.favorites) {
        setFavorites(result.favorites);
        return true;
      } else {
        setError(result.message || 'Error al modificar favoritos');
        return false;
      }
    } catch (err) {
      setError('Error al modificar favoritos');
      console.error('Error en toggleFavorite:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    isLoading,
    error
  };
};

export default useFavorites;