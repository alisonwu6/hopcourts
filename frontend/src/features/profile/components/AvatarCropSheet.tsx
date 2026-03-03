import clsx from 'clsx'
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
  // Force resize to max 512x512 for avatar optimization
  const MAX_SIZE = 512
  canvas.width = MAX_SIZE
  canvas.height = MAX_SIZE

  ctx.translate(MAX_SIZE / 2, MAX_SIZE / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.translate(-MAX_SIZE / 2, -MAX_SIZE / 2)
  
  // Draw the image into the 512x512 canvas
  // We draw the full source image onto the canvas, but transformed by crop coordinates
  // Actually, 'x, y, width, height' are the coordinates ON THE SOURCE IMAGE.
  // So we draw that specific chunk into our entire 512x512 canvas.
  ctx.drawImage(image, x, y, width, height, 0, 0, MAX_SIZE, MAX_SIZE)

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
      0.85
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
      if (fileInputRef.current) fileInputRef.current.value = ''
      
      const timer = setTimeout(() => {
        fileInputRef.current?.click()

        const onFocus = () => {
          // 給予一點緩衝時間讓 onChange 可能先觸發
          setTimeout(() => {
            if (!fileInputRef.current?.files?.length) {
              onClose()
            }
          }, 500)
          window.removeEventListener('focus', onFocus)
        }
        window.addEventListener('focus', onFocus)
      }, 50)

      return () => clearTimeout(timer)
    } else {
      resetState()
    }
  }, [open, onClose])

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
    if (!supabase) {
      alert('Supabase is not initialized')
      onClose()
      return
    }

    setUploading(true)
    try {
      const { data: { user: supabaseUser }, error: userError } = await supabase.auth.getUser()
      
      const targetUserId = supabaseUser?.id || userId
      
      if (!targetUserId) {
         console.error('[avatar] No user ID found via prop or supabase.auth', { supabaseUser, userId, userError })
         throw new Error('Unable to verify user identity, please sign in again')
      }
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation)
      const file = new File([croppedBlob], 'avatar.webp', { type: 'image/webp' })
      const path = `${targetUserId}/avatar.webp`
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
      alert('Upload failed. Please try again or use an image URL instead.')
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
          title="Adjust Avatar"
          subtitle="Drag and zoom to center your avatar, then save to upload."
          height="tall"
          className="w-full rounded-t-[32px] bg-white shadow-[0_-30px_80px_rgba(15,41,77,0.3)]"
          contentClassName="flex-1 overflow-y-auto px-5 py-4 space-y-4"
          primaryButton={undefined} // We implement custom button below for styles
          showHandle={false}
        >
          {imageSrc && (
            <div className="flex h-full flex-col">
              <div className="flex-1 space-y-4">
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
                    disabled={uploading}
                    className={clsx(
                      'rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition',
                      uploading && 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400'
                    )}
                  >
                    Choose Again
                  </button>
                  <div className="flex-1 space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Zoom</label>
                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.1}
                      value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      disabled={uploading}
                      className={clsx(
                        'w-full accent-blue-600',
                        uploading && 'opacity-50 cursor-not-allowed'
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Custom Sticky Button Area */}
              <div className="sticky bottom-0 -mx-5 -mb-4 mt-4 border-t border-slate-200 bg-white px-5 pb-5 pt-3">
                 <button
                    type="button"
                    onClick={handleSave}
                    disabled={uploading}
                    className={clsx(
                      'h-12 w-full rounded-2xl px-4 text-base font-semibold shadow-sm transition',
                      uploading
                        ? 'bg-slate-100 text-slate-400 border-transparent cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-500'
                    )}
                 >
                    {uploading ? 'Uploading...' : 'Apply'}
                 </button>
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
