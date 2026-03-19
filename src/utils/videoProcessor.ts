import { ImageSegmenter, FilesetResolver } from "@mediapipe/tasks-vision";

export interface ProcessingStatus {
  progress: number;
  step: string;
}

export const processVideoBackground = async (
  file: File,
  onStatus: (status: ProcessingStatus) => void
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      onStatus({ step: "Initializing Magic AI...", progress: 5 });
      
      const video = document.createElement("video");
      video.src = URL.createObjectURL(file);
      video.preload = "auto";
      video.muted = true;
      video.playsInline = true;

      await new Promise((res) => {
        video.onloadedmetadata = res;
      });

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("Canvas not supported");

      // Load modern tasks-vision
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      
      const imageSegmenter = await ImageSegmenter.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        outputCategoryMask: true,
        outputConfidenceMasks: false,
      });

      onStatus({ step: "AI Engine Ready.", progress: 10 });

      const stream = canvas.captureStream(30);
      const mimeType = "video/webm;codecs=vp9";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        throw new Error("Transparent WebM (VP9) not supported in this browser.");
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        resolve(URL.createObjectURL(blob));
      };

      recorder.start();
      await video.play();

      const startTime = performance.now();

      const processFrame = () => {
        if (video.ended || video.paused) {
          recorder?.stop();
          imageSegmenter.close();
          return;
        }

        const timestamp = performance.now() - startTime;
        
        // High-precision segmentation
        imageSegmenter.segmentForVideo(video, timestamp, (result) => {
          const mask = result.categoryMask;
          if (!mask) return;

          const maskBuffer = mask.getAsUint8Array();
          const imageData = ctx.createImageData(canvas.width, canvas.height);
          const { data } = imageData;

          // Process mask to transparency
          // Mediapipe Selfie Segmenter: category 1 is the person
          for (let i = 0; i < maskBuffer.length; i++) {
            const isPerson = maskBuffer[i] > 0; 
            const pixelIndex = i * 4;
            // Person = Opacity 255, Background = Opacity 0
            data[pixelIndex + 3] = isPerson ? 255 : 0;
          }

          ctx.putImageData(imageData, 0, 0);

          // Use destination-in to cut the video based on the mask
          ctx.globalCompositeOperation = "source-in";
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          ctx.globalCompositeOperation = "source-over"; // Reset
        });

        const progress = Math.min(98, 10 + (video.currentTime / video.duration) * 88);
        onStatus({ step: `Processing: ${Math.round((video.currentTime / video.duration) * 100)}%`, progress });

        video.requestVideoFrameCallback(processFrame);
      };

      video.requestVideoFrameCallback(processFrame);

    } catch (err) {
      console.error("AI Error:", err);
      reject(err);
    }
  });
};
