import { useEffect, useState } from "react";
import { fetchProfessionals } from "../services/professionalsService";
import type { Professional } from "../components/ProfessionalCard";

export function useProfessionals() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | Error>(null);

  useEffect(() => {
    fetchProfessionals()
      .then((data) => {
        setProfessionals(data);
        console.log("clg de setProfessionals", data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { professionals, loading, error };
}
