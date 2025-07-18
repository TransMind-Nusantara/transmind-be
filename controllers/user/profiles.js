const supabase = require('../../config/supabaseClient');

const getOneProfile = async (req, res) => {
    const { id } = req.params

    const { data: profileUser, error } = await supabase
        .from('users')
        .select("*")
        .eq("id", id)
        .single()

    if (error) return res.status(500).json({ message: error.message })

    res.status(200).json(profileUser)
}

const uploadAvatar = async (req, res) => {
    const { id } = req.params
    const file = req.file

    if (!file) return res.status(400).json({ message: "No file uploaded!" })

    const filePath = `avatars/${id}-${Date.now()}-${file.originalname}`

    const { data, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file.buffer, {
            contentType: file.mimetype
        })

    if (uploadError) return res.status(500).json({ message: uploadError.message })

    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from("avatars")
        .createSignedUrl(filePath, 60 * 60) // 1 hour

    if (signedUrlError) return res.status(500).json({ message: signedUrlError.message })

    const { error: updateError } = await supabase
        .from("users")
        .update({ avatar_url: filePath })
        .eq("id", id)

    if (updateError) return res.status(500).json({ message: updateError.message })

        console.log("singed url:", signedUrlData)

    // res.status(200).json({ message: "Upload Success!", url: signedUrlData.signedUrl })

}

module.exports = {
    getOneProfile,
    uploadAvatar
}
