import { useState } from 'react';
import { Heart, MessageCircle, MapPin, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ObservationCard({ observation }) {
  const { likeObservation, addComment, comments, currentUser } = useApp();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const obsComments = comments[observation.id] || [];
  const liked = observation.likedBy?.includes(currentUser.username);

  const handleComment = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      addComment(observation.id, commentText.trim());
      setCommentText('');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
      <div className="flex items-center p-3 gap-2">
        <div className="w-9 h-9 rounded-full bg-guayana-100 flex items-center justify-center">
          <span className="text-guayana-700 font-bold text-sm">{observation.user[0].toUpperCase()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900">@{observation.user}</p>
          <p className="text-xs text-gray-500">{observation.date}</p>
        </div>
        {observation.verified && (
          <span className="flex items-center gap-1 text-xs text-guayana-600 bg-guayana-50 px-2 py-1 rounded-full">
            <CheckCircle size={12} /> Verificado
          </span>
        )}
      </div>

      <div className="relative">
        <img
          src={observation.image}
          alt={observation.commonName}
          className="w-full h-56 object-cover"
          onError={(e) => { e.target.src = 'https://placehold.co/640x360/16a34a/white?text=Sin+Imagen'; }}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
          <p className="text-white font-bold text-base">{observation.commonName}</p>
          <p className="text-white/80 text-xs italic">{observation.species}</p>
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
          <MapPin size={12} className="text-guayana-600" />
          <span>{observation.lat?.toFixed(3)}°N, {observation.lng?.toFixed(3)}°W</span>
        </div>
        {observation.notes && <p className="text-sm text-gray-700 mb-3">{observation.notes}</p>}

        <div className="flex items-center gap-4">
          <button
            onClick={() => likeObservation(observation.id)}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'}`}
          >
            <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
            {observation.likes}
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-guayana-600 transition-colors font-medium"
          >
            <MessageCircle size={18} />
            {observation.comments}
            {showComments ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {showComments && (
          <div className="mt-3 border-t border-gray-100 pt-3">
            <div className="space-y-2 max-h-40 overflow-y-auto mb-2">
              {obsComments.map(c => (
                <div key={c.id} className="flex gap-2">
                  <span className="font-semibold text-xs text-guayana-700">@{c.user}</span>
                  <span className="text-xs text-gray-700">{c.text}</span>
                </div>
              ))}
              {obsComments.length === 0 && <p className="text-xs text-gray-400">Sin comentarios aún.</p>}
            </div>
            <form onSubmit={handleComment} className="flex gap-2">
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Escribe un comentario..."
                className="flex-1 text-xs border border-gray-200 rounded-full px-3 py-1.5 focus:outline-none focus:border-guayana-400"
              />
              <button type="submit" className="text-xs bg-guayana-600 text-white px-3 py-1.5 rounded-full hover:bg-guayana-700 transition-colors">
                Enviar
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
