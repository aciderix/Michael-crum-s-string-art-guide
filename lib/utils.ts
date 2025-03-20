import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fonction utilitaire pour obtenir le chemin de base de l'application
export function getBasePath() {
  // En production (GitHub Pages), utilisez le chemin de base configuré
  if (process.env.NODE_ENV === "production") {
    return "/string-art-guide"
  }
  // En développement, utilisez la racine
  return ""
}

