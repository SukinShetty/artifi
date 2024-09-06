'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from 'next/image'

export default function AdvancedTextToImageGenerator() {
  const [text, setText] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [tone, setTone] = useState('normal')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateImage = useCallback(async () => {
    if (text.trim() === '') {
      setError('Please enter some text to generate an image.')
      return
    }
    
    setIsLoading(true)
    setError(null)

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

      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
        console.log('Image URL set:', data.imageUrl);
      } else {
        throw new Error('No image URL found in the response');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [text])

  const downloadImage = () => {
    if (!imageUrl) return
    
    fetch(imageUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = 'generated-image.png'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      })
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

  const enhanceImage = () => {
    // Simulate AI enhancement by adding a filter
    if (uploadedImage) {
      const enhancedImage = applyFilter(uploadedImage, tone)
      setImageUrl(enhancedImage)
    }
  }

  // Simulate applying a filter based on the selected tone
  const applyFilter = (image: string, tone: string) => {
    // In a real application, you would send the image to an AI service for enhancement
    // For this example, we'll just add a CSS filter to simulate the effect
    return image
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
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select tone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="bright">Bright</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={generateImage}
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate'}
          </Button>
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
            <Button onClick={enhanceImage} className="mt-2">Enhance Image</Button>
          </div>
        )}
        {imageUrl && (
          <div className="mt-4">
            <Image
              src={imageUrl}
              alt="Generated Image"
              width={500}
              height={300}
              className={`w-full h-auto rounded-md shadow-md filter-${tone}`}
            />
            <Button onClick={downloadImage} className="mt-2">Download Image</Button>
          </div>
        )}
        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  )
}