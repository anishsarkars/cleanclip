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
      onStatus({ step: "Starting Magic Engine...", progress: 5 });
      
      const video = document.createElement("video");
      const url = URL.createObjectURL(file);
      video.src = url;
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
      if (!ctx) throw new Error("Canvas context error");

      // Load modern tasks-vision
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      
      const segmenter = await ImageSegmenter.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        outputCategoryMask: true,
        outputConfidenceMasks: false,
      });

      onStatus({ step: "AI Loaded. Starting Removal...", progress: 15 });

      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9" });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        resolve(URL.createObjectURL(blob));
      };

      recorder.start();
      await video.play();

      const startTime = performance.now();

      const processFrame = async () => {
        if (video.ended || video.paused) {
          recorder.stop();
          segmenter.close();
          URL.revokeObjectURL(url);
          return;
        }

        const timestamp = performance.now() - startTime;
        
        segmenter.segmentForVideo(video, timestamp, (result) => {
          const mask = result.categoryMask;
          if (!mask) return;

          const maskBuffer = mask.getAsUint8Array();
          const imageData = ctx.createImageData(canvas.width, canvas.height);
          const { data } = imageData;

          // Faster mask processing
          for (let i = 0; i < maskBuffer.length; i++) {
            // Category 1 is usually the person
            data[i * 4 + 3] = maskBuffer[i] > 0 ? 255 : 0;
          }

          ctx.putImageData(imageData, 0, 0);
          ctx.globalCompositeOperation = "source-in";
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          ctx.globalCompositeOperation = "source-over";
        });

        const progress = 15 + (video.currentTime / video.duration) * 85;
        onStatus({ step: `Magic Processing: ${Math.round((video.currentTime / video.duration) * 100)}%`, progress });

        requestAnimationFrame(processFrame);
      };

      processFrame();

    } catch (err) {
      console.error("AI Error:", err);
      reject(err);
    }
  });
};
