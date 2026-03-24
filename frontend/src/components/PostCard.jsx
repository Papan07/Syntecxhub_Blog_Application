import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import DOMPurify from 'dompurify';

const PostCard = ({ post }) => {
  // Extract text from HTML content for a brief excerpt
  const rawText = DOMPurify.sanitize(post.content, { ALLOWED_TAGS: [] });
  const excerpt = rawText.length > 150 ? rawText.substring(0, 150) + '...' : rawText;

  return (
    <div className="bg-white dark:bg-darkCard rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
      {post.image && (
        <Link to={`/post/${post._id}`} className="block overflow-hidden h-48">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </Link>
      )}
      
      <div className="p-6 flex flex-col flex-grow">
        <Link to={`/post/${post._id}`}>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 hover:text-primary dark:hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h2>
        </Link>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
          {excerpt}
        </p>

        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {post.author?.name ? post.author.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-200">
                {post.author?.name || 'Unknown Author'}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-500 gap-1 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {post.likes?.length || 0}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
