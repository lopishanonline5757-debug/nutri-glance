import { Upload, Camera, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  isAnalyzing: boolean;
}

export const ImageUpload = ({ onImageSelect, isAnalyzing }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    onImageSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearImage = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  if (preview) {
    return (
      <div className="relative w-full max-w-2xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden shadow-lg">
          <img 
            src={preview} 
            alt="Selected meal" 
            className="w-full h-auto max-h-[500px] object-contain bg-card"
          />
          {!isAnalyzing && (
            <button
              onClick={clearImage}
              className="absolute top-4 right-4 p-2 bg-background/90 backdrop-blur-sm rounded-full hover:bg-background transition-colors"
              aria-label="Remove image"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300
          ${isDragging 
            ? 'border-primary bg-primary/5 scale-105' 
            : 'border-border hover:border-primary/50 hover:bg-muted/30'
          }
        `}
      >
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="p-6 rounded-full bg-primary/10">
            <Upload className="h-12 w-12 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Upload Your Meal Photo</h3>
            <p className="text-muted-foreground max-w-sm">
              Drag and drop an image here, or click to browse
            </p>
          </div>

          <div className="flex gap-3 flex-wrap justify-center">
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
              disabled={isAnalyzing}
            >
              <Upload className="h-4 w-4" />
              Choose File
            </Button>
            
            <Button
              variant="secondary"
              onClick={() => cameraInputRef.current?.click()}
              className="gap-2"
              disabled={isAnalyzing}
            >
              <Camera className="h-4 w-4" />
              Take Photo
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
            disabled={isAnalyzing}
          />
          
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleChange}
            className="hidden"
            disabled={isAnalyzing}
          />
        </div>
      </div>
    </div>
  );
};
