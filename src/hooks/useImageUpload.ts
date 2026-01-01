import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("products").getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      alert("Error uploading image");
      console.error(error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading };
};