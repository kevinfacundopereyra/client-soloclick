import { useEffect, useState } from "react";
import { fetchProfessionalsBySpecialty } from "../services/professionalsService";
import type { Professional } from "../components/ProfessionalCard";

export function useProfessionalsBySpecialty(specialty: string) {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | Error>(null);

  useEffect(() => {
    if (!specialty) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchProfessionalsBySpecialty(specialty)
      .then((data) => {
        setProfessionals(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [specialty]);

  return { professionals, loading, error };
}