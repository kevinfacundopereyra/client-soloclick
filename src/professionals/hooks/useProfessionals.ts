import { useEffect, useState } from "react";
import { fetchProfessionals } from "../services/professionalsService";

export interface Professional {
  id: number;
  name: string;
  profession: string;
}

export function useProfessionals() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | Error>(null);

  useEffect(() => {
    fetchProfessionals()
      .then((data) => {
        setProfessionals(data);
        console.log(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { professionals, loading, error };
}
