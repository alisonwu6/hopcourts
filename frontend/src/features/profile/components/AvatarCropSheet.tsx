import { useCallback, useEffect, useRef, useState } from 'react'
import Cropper from 'react-easy-crop'
import { BottomSheet } from '@/components/BottomSheet'
import { SheetLayout } from '@/components/SheetLayout'
import { supabase } from '@/lib/supabase'

const SAMPLE_AVATAR =
  'https://lh3.googleusercontent.com/a/ACg8ocIpaF9eUIgYqF2yYRiKxzfoEjDdH20a4pyh6QfJuxxz=s200'

async function createImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', (error) => reject(error))
    img.setAttribute('crossOrigin', 'anonymous')
    img.src = url
  })
}

async function getCroppedImg(imageSrc: string, croppedAreaPixels: any, rotation = 0) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')

  const { width, height, x, y } = croppedAreaPixels
  canvas.width = width
  canvas.height = height

  ctx.translate(width / 2, height / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.translate(-width / 2, -height / 2)
  ctx.drawImage(image, x, y, width, height, 0, 0, width, height)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((file) => {
      if (!file) {
        reject(new Error('Failed to crop image'))
        return
      }
      resolve(file)
    }, 'image/jpeg')
  })
}

type Props = {
  open: boolean
  onClose: () => void
  userId?: string
  defaultAvatar?: string
  onAvatarUpdated: (url: string) => void
}

export function AvatarCropSheet({
  open,
  onClose,
  userId,
  defaultAvatar = SAMPLE_AVATAR,
  onAvatarUpdated,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [imageSrc, setImageSrc] = useState<string>('')
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [uploading, setUploading] = useState(false)

  const resetState = () => {
    setImageSrc('')
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
    setCroppedAreaPixels(null)
  }

  useEffect(() => {
    if (open) {
      // 自動開啟檔案選擇
      setTimeout(() => fileInputRef.current?.click(), 100)
    } else {
      resetState()
    }
  }, [open])

  const handleFile = (file: File | null) => {
    if (!file) {
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setImageSrc(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const onCropComplete = useCallback((_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      onClose()
      return
    }
    if (!supabase || !userId) {
      alert('尚未設定 Supabase 或未登入，請改貼上圖片網址。')
      onClose()
      return
    }
    setUploading(true)
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation)
      const path = `avatars/${userId}-${Date.now()}.jpg`
      const { error } = await supabase.storage.from('avatars').upload(path, croppedBlob, {
        upsert: true,
        contentType: 'image/jpeg',
      })
      if (error) throw error
      const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(path)
      if (publicData?.publicUrl) {
        onAvatarUpdated(publicData.publicUrl)
      }
      onClose()
    } catch (err) {
      console.error('avatar crop/upload failed', err)
      alert('上傳失敗，請再試一次或改貼上圖片網址。')
    } finally {
      setUploading(false)
      resetState()
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} showHandle={false} disableContainer>
      <SheetLayout
        onClose={onClose}
        title="調整大頭貼"
        subtitle="拖曳與縮放，讓頭像置中，保存後上傳。"
        height="tall"
        className="w-full rounded-t-[32px] bg-white shadow-[0_-30px_80px_rgba(15,41,77,0.3)]"
        contentClassName="flex-1 overflow-y-auto px-5 py-4 space-y-4"
        primaryButton={{
          label: uploading ? '上傳中...' : '套用',
          onClick: handleSave,
          disabled: uploading,
        }}
        showHandle={false}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] || null)}
        />

        {imageSrc ? (
          <div className="space-y-4">
            <div className="relative h-[360px] w-full overflow-hidden rounded-2xl bg-slate-900/5">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                rotation={rotation}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
                cropShape="round"
                showGrid={false}
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                重新選擇
              </button>
              <div className="flex-1 space-y-2">
                <label className="text-sm font-semibold text-slate-700">縮放</label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-center">
            <p className="text-sm text-slate-600">請選擇要裁切的圖片</p>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                選擇檔案
              </button>
            </div>
            <div className="flex justify-center">
              <img
                src={defaultAvatar}
                alt="預設頭貼"
                className="h-24 w-24 rounded-full object-cover shadow-inner"
              />
            </div>
          </div>
        )}
      </SheetLayout>
    </BottomSheet>
  )
}
