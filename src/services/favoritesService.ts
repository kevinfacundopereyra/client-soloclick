interface FavoriteResponse {
  success: boolean;
  message?: string;
  favorites?: string[];
}

class FavoritesService {
  // Por ahora usaremos localStorage, luego se puede cambiar por API calls
  private readonly FAVORITES_KEY = 'soloclick_favorites';

  /**
   * Obtiene la lista de IDs de profesionales favoritos del usuario
   */
  getFavorites(): string[] {
    try {
      const favorites = localStorage.getItem(this.FAVORITES_KEY);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error al obtener favoritos:', error);
      return [];
    }
  }

  /**
   * Verifica si un profesional está en favoritos
   */
  isFavorite(professionalId: string): boolean {
    const favorites = this.getFavorites();
    return favorites.includes(professionalId);
  }

  /**
   * Agrega un profesional a favoritos
   */
  async addToFavorites(professionalId: string): Promise<FavoriteResponse> {
    try {
      const favorites = this.getFavorites();
      
      if (favorites.includes(professionalId)) {
        return {
          success: false,
          message: 'El profesional ya está en favoritos'
        };
      }

      const updatedFavorites = [...favorites, professionalId];
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(updatedFavorites));

      return {
        success: true,
        message: 'Profesional agregado a favoritos',
        favorites: updatedFavorites
      };
    } catch (error) {
      console.error('Error al agregar a favoritos:', error);
      return {
        success: false,
        message: 'Error al agregar a favoritos'
      };
    }
  }

  /**
   * Quita un profesional de favoritos
   */
  async removeFromFavorites(professionalId: string): Promise<FavoriteResponse> {
    try {
      const favorites = this.getFavorites();
      const updatedFavorites = favorites.filter(id => id !== professionalId);
      
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(updatedFavorites));

      return {
        success: true,
        message: 'Profesional removido de favoritos',
        favorites: updatedFavorites
      };
    } catch (error) {
      console.error('Error al remover de favoritos:', error);
      return {
        success: false,
        message: 'Error al remover de favoritos'
      };
    }
  }

  /**
   * Alterna el estado de favorito de un profesional
   */
  async toggleFavorite(professionalId: string): Promise<FavoriteResponse> {
    if (this.isFavorite(professionalId)) {
      return await this.removeFromFavorites(professionalId);
    } else {
      return await this.addToFavorites(professionalId);
    }
  }

  /**
   * Limpia todos los favoritos (útil para logout)
   */
  clearFavorites(): void {
    localStorage.removeItem(this.FAVORITES_KEY);
  }
}

export const favoritesService = new FavoritesService();
export default favoritesService;