import type { Professional } from '../components/ProfessionalCard';
import favoritesService from '../../services/favoritesService';

/**
 * Ordena una lista de profesionales poniendo los favoritos primero
 * @param professionals - Lista original de profesionales
 * @returns Lista ordenada con favoritos al inicio
 */
export const sortProfessionalsByFavorites = (professionals: Professional[]): Professional[] => {
  const favorites = favoritesService.getFavorites();
  
  return [...professionals].sort((a, b) => {
    const aId = a._id || a.id || '';
    const bId = b._id || b.id || '';
    
    const aIsFavorite = favorites.includes(aId);
    const bIsFavorite = favorites.includes(bId);
    
    // Si a es favorito y b no, a va primero
    if (aIsFavorite && !bIsFavorite) return -1;
    // Si b es favorito y a no, b va primero
    if (!aIsFavorite && bIsFavorite) return 1;
    // Si ambos son favoritos o ninguno es favorito, mantener orden original
    return 0;
  });
};

/**
 * Hook personalizado para obtener profesionales ordenados por favoritos
 */
export const useProfessionalsSortedByFavorites = (professionals: Professional[]) => {
  return sortProfessionalsByFavorites(professionals);
};