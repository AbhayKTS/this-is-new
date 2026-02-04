import { supabase } from "../lib/supabaseClient.js";

const CERT_BUCKET = "certificates";

export const uploadCertificate = async ({ user_id, title, issuer, issued_at, file_name, file_base64, mime_type }) => {
  const buffer = Buffer.from(file_base64, "base64");
  const storagePath = `${user_id}/${Date.now()}-${file_name}`;

  const { error: uploadError } = await supabase.storage
    .from(CERT_BUCKET)
    .upload(storagePath, buffer, {
      contentType: mime_type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data: publicData } = supabase.storage.from(CERT_BUCKET).getPublicUrl(storagePath);

  const { data, error } = await supabase
    .from("certificates")
    .insert({
      user_id,
      title,
      issuer,
      issued_at,
      file_path: storagePath,
      status: "pending",
      mime_type,
      public_url: publicData?.publicUrl || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateCertificateStatus = async (id, payload) => {
  const { data, error } = await supabase
    .from("certificates")
    .update({ ...payload, reviewed_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const listCertificates = async (userId) => {
  const query = supabase.from("certificates").select("*").order("created_at", { ascending: false });
  if (userId) {
    query.eq("user_id", userId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
};
