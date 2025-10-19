// src/leaflet-plugins.d.ts

import "leaflet";
import { Control } from "leaflet";

declare module "leaflet" {
  namespace Control {
    interface GeocoderOptions {
      [key: string]: any; // Acepta cualquier opción
    }

    class Geocoder extends Control {
      constructor(options?: GeocoderOptions);
      on(type: string, fn: (event: any) => void, context?: any): this;
    }

    function geocoder(options?: GeocoderOptions): Geocoder;
  }
}
