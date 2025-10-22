import { useState, useCallback, useEffect } from "react";
import Modal from "react-modal";
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/cropImage";

export default function ImageCropperModal({ image, isOpen, onClose, onCropDone }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(null); // freeform cropping
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [cropShape, setCropShape] = useState("rect");

  const onCropComplete = useCallback((_, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleCropSave = async () => {
    try {
      if (!croppedAreaPixels) return;
      const blob = await getCroppedImg(image, croppedAreaPixels);
      const preview = URL.createObjectURL(blob);
      setPreviewUrl(preview);
      onCropDone(blob);
      onClose();
    } catch (err) {
      console.error("Crop failed:", err);
    }
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setAspect(null);
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaHideApp={false}
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50"
    >
      <div className="bg-white p-4 rounded-lg shadow-lg w-[90%] max-w-lg flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-center">Adjust Your Image</h2>

        <div className="relative w-full h-72 bg-gray-200 rounded overflow-hidden">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspect} // freeform area selection
            cropShape={cropShape}
            showGrid={true}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            restrictPosition={false}
            zoomWithScroll
            objectFit="contain"
          />
        </div>

        <div className="flex flex-col gap-3 mt-2">
          <label className="text-sm text-gray-600 text-center">
            Zoom: {zoom.toFixed(1)}x
          </label>
          <input
            type="range"
            min={1}
            max={4}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={handleReset}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCropSave}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Crop & Save
            </button>
          </div>
        </div>

        {previewUrl && (
          <div className="mt-4 text-center">
            <h3 className="text-sm text-gray-600 mb-1">Preview:</h3>
            <img
              src={previewUrl}
              alt="Cropped Preview"
              className="w-full h-48 object-contain rounded border"
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
