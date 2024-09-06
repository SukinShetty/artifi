'use client'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default function Artifitexttoimagegenrator() {
  const [text, setText] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const generateImage = async () => {
    if (text.trim() === '') return
    
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: text }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      setImageUrl(data.imageUrl);
    } catch (error) {
      console.error('Error generating image:', error)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Artifi Text to Image Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Enter text for image"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <Button onClick={generateImage}>Generate</Button>
          <Button onClick={() => fileInputRef.current?.click()} variant="outline">Upload Image</Button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleImageUpload}
            accept="image/*"
          />
        </div>
        {uploadedImage && (
          <div className="mt-4">
            <img
              src={uploadedImage}
              alt="Uploaded Image"
              className="w-full h-auto rounded-md shadow-md"
            />
          </div>
        )}
        {imageUrl && (
          <div className="mt-4">
            <img
              src={imageUrl}
              alt="Generated Image"
              className="w-full h-auto rounded-md shadow-md"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}