import React, { useState, useEffect } from 'react';
import type { ParkingLotItem } from '../../types';

interface ParkingLotProps {
  onConvertToTimebox?: (item: ParkingLotItem) => void;
}

const STORAGE_KEY = 'timeblazer_parking_lot';

const ParkingLot: React.FC<ParkingLotProps> = ({ onConvertToTimebox }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<ParkingLotItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    const newItem: ParkingLotItem = {
      id: `pl-${Date.now()}`,
      text: trimmed,
      createdAt: new Date().toISOString(),
    };
    setItems((prev) => [newItem, ...prev]);
    setInputText('');
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleConvert = (item: ParkingLotItem) => {
    if (onConvertToTimebox) {
      onConvertToTimebox(item);
      removeItem(item.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') addItem();
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
      {/* Panel */}
      <div
        className={`transition-all duration-300 origin-bottom-right ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              🅿 Parking Lot
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Capture ideas to act on later
            </p>
          </div>

          {/* Input */}
          <div className="p-3 flex gap-2 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add item..."
              className="input-field text-sm py-1.5"
            />
            <button
              onClick={addItem}
              disabled={!inputText.trim()}
              className="btn-primary text-sm py-1.5 px-3 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              Add
            </button>
          </div>

          {/* Items */}
          <div className="max-h-64 overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
                No items yet
              </p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-750 group">
                    <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 break-words">
                      {item.text}
                    </span>
                    <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onConvertToTimebox && (
                        <button
                          onClick={() => handleConvert(item)}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium px-1.5 py-0.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                          title="Convert to timebox"
                        >
                          → Box
                        </button>
                      )}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors text-xs px-1 py-0.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        ×
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 py-2.5 px-4 rounded-full shadow-lg font-medium text-sm transition-all duration-200 ${
          isOpen
            ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        🅿{' '}
        <span>Parking Lot</span>
        {items.length > 0 && (
          <span className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {items.length}
          </span>
        )}
      </button>
    </div>
  );
};

export default ParkingLot;
