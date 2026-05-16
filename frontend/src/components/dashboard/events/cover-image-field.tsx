'use client';

import { useEffect, useRef, useState } from 'react';
import { ImageIcon, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Separator } from '@/components/ui/separator';

interface CoverImageFieldProps {
  value: string;
  onChange: (url: string) => void;
}

export const CoverImageField = ({ value, onChange }: CoverImageFieldProps) => {
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setImgError(false);
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const openPicker = () => fileInputRef.current?.click();

  const hasImage = Boolean(value) && !imgError;

  return (
    <Card className="glass border-white/40 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Cover Image
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 p-6 pt-0">
        {/* Preview */}
        <div className="group relative aspect-video w-full overflow-hidden rounded-lg bg-muted/40">
          {hasImage ? (
            <>
              <img
                src={value}
                alt="Event cover preview"
                onError={() => setImgError(true)}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={openPicker}
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <span className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
                  <Upload className="size-4" />
                  Change image
                </span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={openPicker}
              className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground transition-colors hover:bg-muted/60"
            >
              <ImageIcon className="size-7 opacity-40" />
              <span className="text-xs">
                {imgError ? 'Could not load image' : 'Click to upload'}
              </span>
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full gap-1.5"
          onClick={openPicker}
        >
          <Upload className="size-4" />
          Upload image
        </Button>

        <div className="flex items-center gap-2">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>

        <FormField label="Image URL">
          <Input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://…"
          />
        </FormField>
      </CardContent>
    </Card>
  );
};
