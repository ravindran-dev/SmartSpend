import React, { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { motion } from "framer-motion";

export default function UploadCard() {
  const [ocrPreview, setOcrPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInput = useRef();

  const handleFile = async (file) => {
    setLoading(true);
    // TODO: Call backend /upload API and set OCR preview
    setTimeout(() => {
      setOcrPreview("Sample extracted text from receipt...");
      setLoading(false);
    }, 1200);
  };

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <motion.div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center h-32 cursor-pointer hover:border-blue-400 transition"
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInput.current.click()}
      >
        <UploadCloud size={32} className="text-gray-400 mb-2" />
        <span className="text-gray-500">Click or drag file to upload</span>
        <input type="file" ref={fileInput} className="hidden" onChange={e => handleFile(e.target.files[0])} />
      </div>
      <div>
        <h2 className="font-semibold mb-2">OCR Preview</h2>
        <div className="bg-gray-50 rounded p-3 h-20 overflow-auto text-sm text-gray-700">
          {loading ? "Extracting..." : ocrPreview || "No preview yet."}
        </div>
      </div>
    </motion.div>
  );
}
