/**
 * Utilitaire de compression et préparation d'image pour photo de profil / avatar.
 * Réduit la taille des photos de smartphone (souvent 4 à 10 Mo) à ~25-45 Ko,
 * évitant tout dépassement de quota ou rejet de payload par Supabase / PostgREST.
 */

export interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export async function compressImageFile(
  file: File,
  options: CompressImageOptions = {},
): Promise<string> {
  const { maxWidth = 400, maxHeight = 400, quality = 0.85 } = options;

  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Le fichier sélectionné n'est pas une image valide."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Erreur de lecture du fichier image."));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Erreur lors du chargement de l'image."));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calcul du ratio pour conserver les proportions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Impossible d'initialiser le contexte de dessin canvas."));
          return;
        }

        // Amélioration de la qualité de rendu
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Export en JPEG optimisé
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
