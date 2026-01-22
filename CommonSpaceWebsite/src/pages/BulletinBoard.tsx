import { useState, useRef, useEffect } from 'react';
import {
  bulletinPostItsApi,
  bulletinDrawingsApi,
  bulletinTextApi,
  type BulletinPostIt,
  type BulletinDrawing,
  type BulletinText
} from '../services/api';

interface PostIt extends BulletinPostIt {}

interface DrawingPath {
  points: { x: number; y: number }[];
  color: string;
  size: number;
}

interface Drawing {
  id: number;
  paths: DrawingPath[];
}

interface TextItem {
  id: number;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
}

const BulletinBoard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [postIts, setPostIts] = useState<PostIt[]>([]);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [textItems, setTextItems] = useState<TextItem[]>([]);
  const [selectedTool, setSelectedTool] = useState<'postit' | 'draw' | 'text' | null>(null);
  const [selectedColor, setSelectedColor] = useState('#FFD700');
  const [brushSize, setBrushSize] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState<{ type: 'postit' | 'text', id: number, offsetX: number, offsetY: number } | null>(null);
  const [wasDragging, setWasDragging] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    drawCanvas();
  }, [drawings]);

  const loadData = async () => {
    try {
      const [postitsData, drawingsData, textData] = await Promise.all([
        bulletinPostItsApi.getAll(),
        bulletinDrawingsApi.getAll(),
        bulletinTextApi.getAll(),
      ]);
      setPostIts(postitsData);
      setDrawings(drawingsData.map(d => ({
        id: d.id,
        paths: JSON.parse(d.paths)
      })));
      setTextItems(textData.map(t => ({
        id: t.id,
        x: t.x,
        y: t.y,
        text: t.text,
        fontSize: t.font_size,
        color: t.color
      })));
    } catch (error) {
      console.error('Error loading bulletin board data:', error);
    } finally {
      setLoading(false);
    }
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all saved drawings
    drawings.forEach(drawing => {
      drawing.paths.forEach(path => {
        if (path.points.length < 2) return;
        
        ctx.strokeStyle = path.color;
        ctx.lineWidth = path.size || 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(path.points[0].x, path.points[0].y);
        for (let i = 1; i < path.points.length; i++) {
          ctx.lineTo(path.points[i].x, path.points[i].y);
        }
        ctx.stroke();
      });
    });

    // Draw current path being drawn
    if (currentPath.length > 1) {
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      for (let i = 1; i < currentPath.length; i++) {
        ctx.lineTo(currentPath[i].x, currentPath[i].y);
      }
      ctx.stroke();
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    // Drawing is handled by mouse down/move/up
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool !== 'draw') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setIsDrawing(true);
    setCurrentPath([{ x, y }]);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || selectedTool !== 'draw') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setCurrentPath(prev => [...prev, { x, y }]);
    drawCanvas();
  };

  const handleCanvasMouseUp = () => {
    if (!isDrawing || currentPath.length < 2) {
      setIsDrawing(false);
      setCurrentPath([]);
      return;
    }
    
    // Save the drawing
    const newPath: DrawingPath = {
      points: currentPath,
      color: selectedColor,
      size: brushSize
    };
    
    // Add to current drawing or create new
    const newDrawing = {
      id: Date.now(),
      paths: [newPath]
    };
    
    const updatedDrawings = [...drawings, newDrawing];
    setDrawings(updatedDrawings);
    
    // Save to database
    bulletinDrawingsApi.create({
      paths: JSON.stringify([newPath]),
      color: selectedColor
    }).catch(error => {
      console.error('Error saving drawing:', error);
    });
    
    setIsDrawing(false);
    setCurrentPath([]);
  };

  const handleBoardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (wasDragging) {
      setWasDragging(false);
      return;
    }
    if (!selectedTool) return;

    const x = e.clientX;
    const y = e.clientY;

    if (selectedTool === 'postit') {
      const newPostIt = {
        x,
        y,
        text: 'Ny anteckning',
        color: selectedColor,
      };
      bulletinPostItsApi.create(newPostIt).then(created => {
        setPostIts([...postIts, created]);
      }).catch(error => {
        console.error('Error creating post-it:', error);
      });
    } else if (selectedTool === 'text') {
      setTextPosition({ x, y });
      setShowTextInput(true);
    }
  };

  const addText = () => {
    if (currentText.trim()) {
      const newTextItem = {
        x: textPosition.x,
        y: textPosition.y,
        text: currentText,
        font_size: 20,
        color: '#000000',
      };
      bulletinTextApi.create(newTextItem).then(created => {
        setTextItems([...textItems, {
          id: created.id,
          x: created.x,
          y: created.y,
          text: created.text,
          fontSize: created.font_size,
          color: created.color
        }]);
      }).catch(error => {
        console.error('Error creating text:', error);
      });
      setCurrentText('');
      setShowTextInput(false);
    }
  };

  const updatePostIt = (id: number, text: string) => {
    const postit = postIts.find(p => p.id === id);
    if (postit) {
      const updated = { ...postit, text };
      bulletinPostItsApi.update(id, updated).catch(error => {
        console.error('Error updating post-it:', error);
      });
      setPostIts(postIts.map(p => p.id === id ? updated : p));
    }
  };

  const deletePostIt = (id: number) => {
    bulletinPostItsApi.delete(id).catch(error => {
      console.error('Error deleting post-it:', error);
    });
    setPostIts(postIts.filter(p => p.id !== id));
  };

  const deleteDrawing = (id: number) => {
    bulletinDrawingsApi.delete(id).catch(error => {
      console.error('Error deleting drawing:', error);
    });
    setDrawings(drawings.filter(d => d.id !== id));
  };

  const deleteText = (id: number) => {
    bulletinTextApi.delete(id).catch(error => {
      console.error('Error deleting text:', error);
    });
    setTextItems(textItems.filter(t => t.id !== id));
  };

  const handleMouseDown = (e: React.MouseEvent, type: 'postit' | 'text', id: number, itemX: number, itemY: number) => {
    e.stopPropagation();
    const offsetX = e.clientX - itemX;
    const offsetY = e.clientY - itemY;
    setDragging({ type, id, offsetX, offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    
    setWasDragging(true);

    const newX = e.clientX - dragging.offsetX;
    const newY = e.clientY - dragging.offsetY;

    if (dragging.type === 'postit') {
      setPostIts(postIts.map(p => 
        p.id === dragging.id ? { ...p, x: newX, y: newY } : p
      ));
    } else if (dragging.type === 'text') {
      setTextItems(textItems.map(t => 
        t.id === dragging.id ? { ...t, x: newX, y: newY } : t
      ));
    }
  };

  const handleMouseUp = () => {
    if (dragging) {
      // Save position to database
      if (dragging.type === 'postit') {
        const postit = postIts.find(p => p.id === dragging.id);
        if (postit) {
          bulletinPostItsApi.update(dragging.id, postit).catch(error => {
            console.error('Error updating post-it position:', error);
          });
        }
      } else if (dragging.type === 'text') {
        const textItem = textItems.find(t => t.id === dragging.id);
        if (textItem) {
          bulletinTextApi.update(dragging.id, {
            id: textItem.id,
            x: textItem.x,
            y: textItem.y,
            text: textItem.text,
            font_size: textItem.fontSize,
            color: textItem.color
          }).catch(error => {
            console.error('Error updating text position:', error);
          });
        }
      }
    }
    setDragging(null);
  };

  const colors = [
    '#000000', // Black
    '#FFFFFF', // White
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FFA500', // Orange
    '#800080', // Purple
    '#FFC0CB', // Pink
    '#A52A2A', // Brown
    '#808080', // Gray
    '#FFD700', // Gold
    '#4ECDC4', // Turquoise
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 p-6 flex items-center justify-center">
        <h1 className="text-4xl font-bold text-white">Laddar...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 p-6">
      <div className="max-w-[1800px] mx-auto">
        <h1 className="text-4xl font-bold text-white mb-6">📌 Anslagstavla</h1>
        
        {/* Toolbar */}
        <div className="bg-slate-700 rounded-lg p-4 mb-6 shadow-lg">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedTool('postit')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedTool === 'postit'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-slate-600 text-white hover:bg-slate-500'
                }`}
              >
                📝 Post-it
              </button>
              <button
                onClick={() => setSelectedTool('draw')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedTool === 'draw'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-slate-600 text-white hover:bg-slate-500'
                }`}
              >
                🎨 Rita
              </button>
              <button
                onClick={() => setSelectedTool('text')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedTool === 'text'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-slate-600 text-white hover:bg-slate-500'
                }`}
              >
                ✏️ Text
              </button>
            </div>

            <div className="flex gap-2 items-center">
              <span className="text-white font-medium">Färg:</span>
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition ${
                    selectedColor === color ? 'border-white scale-110' : 'border-slate-400'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <div className="flex gap-2 items-center">
              <span className="text-white font-medium">Penselstorlek:</span>
              <button
                onClick={() => setBrushSize(Math.max(1, brushSize - 1))}
                className="w-8 h-8 bg-slate-600 text-white rounded hover:bg-slate-500 font-bold"
              >
                −
              </button>
              <span className="text-white font-medium w-8 text-center">{brushSize}</span>
              <button
                onClick={() => setBrushSize(Math.min(20, brushSize + 1))}
                className="w-8 h-8 bg-slate-600 text-white rounded hover:bg-slate-500 font-bold"
              >
                +
              </button>
            </div>

            <button
              onClick={() => setSelectedTool(null)}
              className="ml-auto px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              ❌ Avmarkera
            </button>
          </div>
        </div>

        {/* Main Board */}
        <div 
          className="relative bg-slate-100 rounded-lg shadow-2xl overflow-hidden"
          style={{ height: '800px' }}
          onClick={handleBoardClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* Canvas for drawing */}
          <canvas
            ref={canvasRef}
            width={2400}
            height={800}
            className="absolute top-0 left-0 w-full h-full"
            style={{ 
              pointerEvents: selectedTool === 'draw' ? 'auto' : 'none',
              cursor: selectedTool === 'draw' ? 'crosshair' : 'default'
            }}
            onClick={handleCanvasClick}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
          />

          {/* Post-it notes */}
          {postIts.map(postIt => (
            <div
              key={postIt.id}
              className="absolute shadow-lg cursor-move"
              style={{
                left: `${postIt.x}px`,
                top: `${postIt.y}px`,
                backgroundColor: postIt.color,
                transform: 'translate(-50%, -50%)',
              }}
              onMouseDown={(e) => handleMouseDown(e, 'postit', postIt.id, postIt.x, postIt.y)}
            >
              <div className="w-48 h-48 p-4 relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePostIt(postIt.id);
                  }}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                >
                  ×
                </button>
                <textarea
                  value={postIt.text}
                  onChange={(e) => updatePostIt(postIt.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full h-full bg-transparent resize-none border-none focus:outline-none font-handwriting text-black"
                  style={{ fontFamily: 'Comic Sans MS, cursive' }}
                />
              </div>
            </div>
          ))}

          {/* Text items */}
          {textItems.map(textItem => (
            <div
              key={textItem.id}
              className="absolute cursor-move"
              style={{
                left: `${textItem.x}px`,
                top: `${textItem.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
              onMouseDown={(e) => handleMouseDown(e, 'text', textItem.id, textItem.x, textItem.y)}
            >
              <div className="relative group">
                <p
                  style={{
                    fontSize: `${textItem.fontSize}px`,
                    color: textItem.color,
                    fontWeight: 'bold',
                  }}
                  className="cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  {textItem.text}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteText(textItem.id);
                  }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition"
                >
                  ×
                </button>
              </div>
            </div>
          ))}

          {/* Drawings control panel */}
          <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-lg p-3 max-h-32 overflow-y-auto">
            <p className="font-bold text-sm mb-2">Ritningar ({drawings.length})</p>
            {drawings.map((drawing, index) => (
              <div key={drawing.id} className="flex items-center gap-2 mb-1">
                <span className="text-xs">🎨 Ritning {index + 1}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteDrawing(drawing.id);
                  }}
                  className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Ta bort
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Text Input Modal */}
        {showTextInput && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl">
              <h3 className="text-xl font-bold mb-4 text-black">Skriv text</h3>
              <input
                type="text"
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addText()}
                className="w-full px-4 py-2 border border-gray-300 rounded mb-4 text-black"
                placeholder="Skriv din text..."
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={addText}
                  className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Lägg till
                </button>
                <button
                  onClick={() => {
                    setShowTextInput(false);
                    setCurrentText('');
                  }}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Avbryt
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulletinBoard;
