import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Download, Clock, Trash2 } from "lucide-react";

interface ProcessedFile {
  id: string;
  filename: string;
  file_url: string;
  created_at: string;
}

interface FilesSectionProps {
  files: ProcessedFile[];
}

const FilesSection: React.FC<FilesSectionProps> = ({ files }) => {
  if (files.length === 0) return null;

  return (
    <section className="py-12 px-4 max-w-6xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-gray-500" />
        <h2 className="text-2xl font-bold text-gray-900 font-outfit">Recenty Cleaned</h2>
        <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full ml-auto">
          Files deleted after 24h
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {files.map((file) => (
          <div key={file.id} className="bg-white border rounded-2xl p-4 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="aspect-video bg-gray-50 rounded-lg flex items-center justify-center border-dashed border-2 overflow-hidden">
               <video src={file.file_url} className="w-full h-full object-cover" muted />
            </div>
            
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-gray-800 truncate">{file.filename}</p>
              <p className="text-sm text-gray-500">
                Processed {formatDistanceToNow(new Date(file.created_at))} ago
              </p>
            </div>

            <div className="flex gap-2 mt-auto">
              <a 
                href={file.file_url} 
                download={file.filename}
                className="flex-1 bg-black text-white h-10 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FilesSection;
