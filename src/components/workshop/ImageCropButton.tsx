'use client'

import { useState, useCallback } from 'react'
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getSelectedImageData } from '@/components/tiptap-ui/image-download-button/use-image-download'
import { uploadWorkshopInlineImage } from '@/utils/workshopImageUpload'
import { CropIcon } from 'lucide-react'
import type { Editor } from '@tiptap/react'

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  )
}

function getCroppedBlob(
  image: HTMLImageElement,
  crop: Crop,
  type: string = 'image/jpeg'
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return Promise.reject(new Error('Canvas not supported'))

  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height
  const toNatural = (v: number, dim: 'x' | 'y' | 'w' | 'h') => {
    if (crop.unit === '%') {
      const pct = v / 100
      return dim === 'x' || dim === 'w'
        ? pct * image.width * scaleX
        : pct * image.height * scaleY
    }
    return dim === 'x' || dim === 'w' ? v * scaleX : v * scaleY
  }
  const x = toNatural(crop.x, 'x')
  const y = toNatural(crop.y, 'y')
  const w = toNatural(crop.width, 'w')
  const h = toNatural(crop.height, 'h')

  canvas.width = Math.floor(w)
  canvas.height = Math.floor(h)

  ctx.drawImage(
    image,
    Math.floor(x),
    Math.floor(y),
    Math.floor(w),
    Math.floor(h),
    0,
    0,
    canvas.width,
    canvas.height
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Failed to create blob'))
    }, type)
  })
}

interface ImageCropButtonProps {
  editor: Editor | null
}

export function ImageCropButton({ editor }: ImageCropButtonProps) {
  const [open, setOpen] = useState(false)
  const [crop, setCrop] = useState<Crop>()
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null)
  const [loading, setLoading] = useState(false)

  const imageData = editor ? getSelectedImageData(editor) : null

  const handleOpen = useCallback(() => {
    if (!imageData?.src) return
    setImageSrc(imageData.src)
    setCrop(undefined)
    setOpen(true)
  }, [imageData?.src])

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    setImageEl(img)
    setCrop(centerAspectCrop(img.naturalWidth, img.naturalHeight, 16 / 9))
  }, [])

  const handleConfirm = useCallback(async () => {
    if (!editor || !imageEl || !crop || !imageData) return
    setLoading(true)
    try {
      const blob = await getCroppedBlob(imageEl, crop)
      const file = new File([blob], `cropped-${Date.now()}.jpg`, { type: 'image/jpeg' })
      const url = await uploadWorkshopInlineImage(file)
      editor.chain().focus().updateAttributes('image', { src: url }).run()
      setOpen(false)
    } catch (err) {
      console.error('Crop upload:', err)
    } finally {
      setLoading(false)
    }
  }, [editor, imageEl, crop, imageData])

  const handleClose = useCallback(() => {
    setOpen(false)
    setImageSrc(null)
    setImageEl(null)
  }, [])

  if (!editor || !imageData?.src) return null

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 gap-1.5 text-xs font-normal"
        onClick={handleOpen}
        aria-label="Rogner l'image"
      >
        <CropIcon className="h-4 w-4" />
        Rogner
      </Button>
      <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rogner l&apos;image</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            {imageSrc && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                aspect={undefined}
                className="max-h-[60vh]"
              >
                <img
                  src={imageSrc}
                  alt=""
                  crossOrigin="anonymous"
                  onLoad={handleImageLoad}
                  className="max-w-full"
                />
              </ReactCrop>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="button" onClick={handleConfirm} disabled={!crop || loading}>
              {loading ? 'Envoi…' : 'Appliquer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
