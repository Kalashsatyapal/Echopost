import { useState, useCallback } from "react";
import Modal from "react-modal";
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/cropImage";

export default function ImageCropperModal({ image, isOpen, onClose, onCropDone }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleCropSave = async () => {
    try {
      const blob = await getCroppedImg(image, croppedAreaPixels);
      onCropDone(blob);
      onClose();
    } catch (err) {
      console.error("Crop failed:", err);
    }
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaHideApp={false}
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60"
    >
      <div className="bg-white p-4 rounded-lg shadow-lg w-[90%] max-w-lg">
        <h2 className="text-lg font-semibold mb-3 text-center">Adjust your image</h2>

        <div className="relative w-full h-72 bg-gray-200 rounded overflow-hidden">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={null} // ✅ freeform cropping like mobile
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            cropShape="rect"
            showGrid={false}
          />
        </div>

        <div className="flex flex-col gap-3 mt-4">
          <input
            type="range"
            min={1}
            max={4}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />

          <div className="flex justify-between">
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
      </div>
    </Modal>
  );
}
