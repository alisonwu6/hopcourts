import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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
    canvas.toBlob(
      (file) => {
        if (!file) {
          reject(new Error('Failed to crop image'))
          return
        }
        resolve(file)
      },
      'image/webp',
      0.92
    )
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
      // 自動開啟檔案選擇；未選擇直接關閉
      setTimeout(() => fileInputRef.current?.click(), 50)
    } else {
      resetState()
    }
  }, [open])

  const handleFile = (file: File | null) => {
    if (!file) {
      resetState()
      onClose()
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
      const [{ data: supabaseUser, error: userError }, { data: sessionData }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.auth.getSession(),
      ])
      console.log('[avatar] supabase auth.getUser()', { supabaseUser, userError })
      console.log('[avatar] supabase auth.getSession()', { sessionData })
      if (userError || !supabaseUser?.user) {
        throw new Error('未取得 Supabase 使用者，請重新登入後再試')
      }
      const storageUserId = supabaseUser.user.id || userId
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation)
      const file = new File([croppedBlob], 'avatar.webp', { type: 'image/webp' })
      const path = `${storageUserId}/avatar.webp`
      console.log('[avatar] upload path', path, 'size', file.size, 'type', file.type)
      const { error } = await supabase.storage.from('avatars').upload(path, file, {
        upsert: true,
        contentType: 'image/webp',
        cacheControl: '3600',
      })
      if (error) {
        console.error('[avatar] upload error', error)
        throw error
      }
      const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(path)
      if (publicData?.publicUrl) {
        // 加上版本參數避免快取
        onAvatarUpdated(`${publicData.publicUrl}?v=${Date.now()}`)
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

  if (!open) return null

  const sheet =
    open && imageSrc ? (
      <BottomSheet
        open={open}
        onClose={onClose}
        showHandle={false}
        disableContainer
        backdropClassName="z-[400]"
        sheetClassName="z-[401]"
      >
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
          {imageSrc && (
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
          )}
        </SheetLayout>
      </BottomSheet>
    ) : null

  const target = typeof document !== 'undefined' ? document.body : null

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] || null)}
      />
      {target ? createPortal(sheet, target) : sheet}
    </>
  )
}
