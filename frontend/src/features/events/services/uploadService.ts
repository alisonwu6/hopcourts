import { supabase } from '@/lib/supabase'

export const uploadService = {
  async uploadSessionPhoto(file: File): Promise<string> {
    // 1. Generate unique path
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
    const filePath = `sessions/${fileName}`

    if (!supabase) throw new Error('Supabase client not initialized')

    // 2. Upload
    const { error: uploadError } = await supabase.storage
      .from('sessions-photos')
      .upload(filePath, file)

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    // 3. Get Public URL
    const { data } = supabase.storage.from('sessions-photos').getPublicUrl(filePath)

    return data.publicUrl
  },
}
