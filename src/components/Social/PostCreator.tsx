import React, { useState, useRef } from 'react';
import { Image, Video, X, Loader2, Camera } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { usePostStore } from '../../store/postStore';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface PostCreatorProps {
  onPostCreated?: () => void;
}

const PostCreator: React.FC<PostCreatorProps> = ({ onPostCreated }) => {
  const { user } = useAuthStore();
  const { addPost } = usePostStore();
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<{ type: 'image' | 'video'; file: File; preview: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const files = Array.from(e.target.files || []);
    const maxFiles = type === 'image' ? 4 : 1;
    const currentTypeCount = media.filter(m => m.type === type).length;
    const maxSize = type === 'image' ? 5 * 1024 * 1024 : 100 * 1024 * 1024; // 5MB for images, 100MB for videos

    if (files.length + currentTypeCount > maxFiles) {
      toast.error(`Maximum ${maxFiles} ${type}${maxFiles > 1 ? 's' : ''} par publication`);
      return;
    }

    files.forEach(file => {
      if (file.size > maxSize) {
        toast.error(`Chaque ${type} doit faire moins de ${maxSize / (1024 * 1024)}MB`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setMedia(prev => [...prev, { 
          type, 
          file,
          preview: reader.result as string 
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Impossible d\'accéder à la caméra');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
          const reader = new FileReader();
          reader.onloadend = () => {
            setMedia(prev => [...prev, {
              type: 'image',
              file,
              preview: reader.result as string
            }]);
          };
          reader.readAsDataURL(blob);
        }
      }, 'image/jpeg');
    }
    stopCamera();
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const removeMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && media.length === 0) return;

    setIsSubmitting(true);
    try {
      // Simuler l'upload des médias
      const uploadedMedia = media.map(m => ({
        type: m.type,
        url: m.preview // Dans une vraie app, on uploaderait le fichier sur un serveur
      }));

      const newPost = {
        id: Date.now(),
        userId: user!.id,
        author: {
          id: user!.id,
          name: user!.name,
          photo: user!.photo
        },
        content: content.trim(),
        images: uploadedMedia.filter(m => m.type === 'image').map(m => m.url),
        video: uploadedMedia.find(m => m.type === 'video')?.url,
        likes: [],
        comments: [],
        timestamp: new Date(),
        shares: 0
      };

      await addPost(newPost);
      setContent('');
      setMedia([]);
      onPostCreated?.();
      toast.success('Publication créée !');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Erreur lors de la création de la publication');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex gap-3">
          <img
            src={user.photo}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Quoi de neuf ?"
              className="w-full min-h-[80px] resize-none border-none focus:ring-0 p-0"
              maxLength={500}
            />
            
            {/* Media Preview */}
            {media.length > 0 && (
              <div className={`grid gap-2 mb-4 ${
                media.length === 1 ? 'grid-cols-1' :
                media.length === 2 ? 'grid-cols-2' :
                'grid-cols-2'
              }`}>
                {media.map((item, index) => (
                  <div key={index} className="relative group">
                    {item.type === 'image' ? (
                      <img
                        src={item.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <video
                        src={item.preview}
                        className="w-full h-32 object-cover rounded-lg"
                        controls
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="absolute top-2 right-2 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Camera Preview */}
            <AnimatePresence>
              {showCamera && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative mb-4"
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="p-3 bg-white rounded-full shadow-lg"
                    >
                      <Camera className="w-6 h-6 text-purple-600" />
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="p-3 bg-white rounded-full shadow-lg"
                    >
                      <X className="w-6 h-6 text-red-600" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between mt-4 pt-3 border-t">
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleMediaUpload(e, 'image')}
                />
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => handleMediaUpload(e, 'video')}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
                  disabled={media.filter(m => m.type === 'image').length >= 4}
                >
                  <Image className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
                  disabled={media.some(m => m.type === 'video')}
                >
                  <Video className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={startCamera}
                  className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
                  disabled={showCamera}
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  {content.length}/500
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting || (!content.trim() && media.length === 0)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Publication...
                    </>
                  ) : (
                    'Publier'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PostCreator;