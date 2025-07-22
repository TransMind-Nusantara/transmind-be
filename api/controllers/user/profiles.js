const supabase = require("../../config/supabaseClient");

const getOneProfile = async (req, res) => {
  const { id } = req.user;
  console.log(id)

  const { data: profileUser, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return res.status(500).json({ message: error.message });

  res.status(200).json(profileUser);
};

const uploadAvatar = async (req, res) => {
  const { id } = req.user;
  const file = req.file;

  if (!file) return res.status(400).json({ message: "No file uploaded!" });

  const fileExtention = file.originalname.split(".").pop();
  const filePath = `${id}/avatar.${fileExtention}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true, // for replacing the same path
    });

  if (uploadError)
    return res
      .status(500)
      .json({ message: "Upload gagal!", detail: uploadError.message });

  const {
    data: { publicUrl },
  } = await supabase.storage.from("avatars").getPublicUrl(filePath);

  const { error: updateError } = await supabase
    .from("users")
    .update({ avatar_url: publicUrl })
    .eq("id", id);

  if (updateError) {
    await supabase.storage.from("avatars").remove([filePath]);
    res.status(500).json({ message: updateError.message });
  }

  console.log("user id " + id);
  console.log("public URL " + publicUrl);
  

  res.status(200).json({ message: "Upload berhasil", url: publicUrl });
};

module.exports = {
  getOneProfile,
  uploadAvatar,
};
