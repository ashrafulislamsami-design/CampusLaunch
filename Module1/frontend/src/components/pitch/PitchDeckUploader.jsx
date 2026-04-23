import { useState } from 'react';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadPitchDeck } from '../../services/pitchService';

const PitchDeckUploader = ({ onUploaded }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleUpload = async (selectedFile) => {
    if (!selectedFile) return;
    if (selectedFile.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }
    try {
      setUploading(true);
      setFile(selectedFile);
      const { data } = await uploadPitchDeck(selectedFile);
      setUploaded(true);
      toast.success('Pitch deck uploaded!');
      onUploaded?.(data.url, data.originalName);
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition cursor-pointer ${
        uploaded ? 'border-teal-400 bg-teal-50' : 'border-stone-300 hover:border-amber-400'
      }`}
      onClick={() => !uploaded && document.getElementById('deck-upload').click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); handleUpload(e.dataTransfer.files[0]); }}
    >
      {uploaded ? (
        <>
          <CheckCircle size={32} className="mx-auto text-teal-600 mb-2" />
          <p className="font-bold text-teal-800 text-sm">{file?.name}</p>
          <p className="text-xs text-teal-600 mt-1">Uploaded successfully</p>
        </>
      ) : uploading ? (
        <>
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-stone-500">Uploading...</p>
        </>
      ) : (
        <>
          <Upload size={32} className="mx-auto text-stone-400 mb-2" />
          <p className="text-sm text-stone-500">Drag & drop your pitch deck PDF</p>
          <p className="text-xs text-stone-400 mt-1">or click to browse</p>
        </>
      )}
      <input
        id="deck-upload"
        type="file"
        accept=".pdf"
        onChange={(e) => handleUpload(e.target.files[0])}
        className="hidden"
      />
    </div>
  );
};

export default PitchDeckUploader;
