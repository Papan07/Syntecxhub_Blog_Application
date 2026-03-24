import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import DOMPurify from 'dompurify';
import { AuthContext } from '../context/AuthContext';
import { FiEdit2, FiTrash2, FiHeart, FiMessageSquare } from 'react-icons/fi';

const PostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setLoading(true);
        const [postRes, commentsRes] = await Promise.all([
          axios.get(`/api/posts/${id}`),
          axios.get(`/api/comments/${id}`)
        ]);
        setPost(postRes.data);
        setComments(commentsRes.data);
      } catch (err) {
        setError('Error fetching post details');
      } finally {
        setLoading(false);
      }
    };
    fetchPostData();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`/api/posts/${id}`);
        navigate('/');
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting post');
      }
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      setLiking(true);
      const res = await axios.put(`/api/posts/${id}/like`);
      setPost({ ...post, likes: res.data.likes });
    } catch (err) {
      alert('Error liking post');
    } finally {
      setLiking(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await axios.post(`/api/comments/${id}`, { text: commentText });
      setComments([res.data, ...comments]);
      setCommentText('');
    } catch (err) {
      alert(err.response?.data?.message || 'Error posting comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Delete this comment?')) {
      try {
        await axios.delete(`/api/comments/${commentId}`);
        setComments(comments.filter(c => c._id !== commentId));
      } catch (err) {
        alert('Error deleting comment');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-center font-medium">
        {error || 'Post not found'}
      </div>
    );
  }

  const isAuthor = user && post.author && user._id === post.author._id;
  const isLiked = user && post.likes.includes(user._id);

  return (
    <div className="max-w-4xl mx-auto pb-16">
      <article className="bg-white dark:bg-darkCard rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden mb-8">
        {post.image && (
          <div className="w-full h-64 md:h-96 overflow-hidden">
            <img 
              src={post.image} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-8 border-b border-gray-100 dark:border-gray-800 gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-lg font-bold shadow-sm">
                {post.author?.name ? post.author.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {post.author?.name || 'Unknown Author'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>

            {isAuthor && (
              <div className="flex items-center space-x-3">
                <Link 
                  to={`/edit-post/${post._id}`}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium border border-gray-200 dark:border-gray-700"
                >
                  <FiEdit2 />
                  <span>Edit</span>
                </Link>
                <button 
                  onClick={handleDelete}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors font-medium border border-red-100 dark:border-red-900/30"
                >
                  <FiTrash2 />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-10 leading-tight">
            {post.title}
          </h1>

          <div 
            className="prose prose-lg dark:prose-invert max-w-none prose-img:rounded-xl prose-a:text-primary max-w-full overflow-hidden break-words pb-8"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
          />
          
          <div className="pt-8 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <button 
              onClick={handleLike}
              disabled={liking}
              className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-colors border ${
                isLiked 
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-500 border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/40' 
                  : 'bg-white dark:bg-darkCard text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <FiHeart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span>{post.likes.length} Likes</span>
            </button>
            
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 px-6 py-3 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <FiMessageSquare className="w-5 h-5" />
              <span className="font-medium">{comments.length} Comments</span>
            </div>
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <section className="bg-white dark:bg-darkCard rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 md:p-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center">
          Discussion ({comments.length})
        </h2>

        {user ? (
          <form onSubmit={handleCommentSubmit} className="mb-10 relative">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="What are your thoughts on this story?"
              className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary dark:text-white transition-all resize-none min-h-[120px]"
              required
            />
            <button 
              type="submit"
              className="absolute bottom-4 right-4 px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              disabled={!commentText.trim()}
            >
              Post Comment
            </button>
          </form>
        ) : (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 mb-10 text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Join the conversation</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Log in to leave a comment and interact with the author.</p>
            <Link 
              to="/login"
              className="inline-flex px-8 py-2.5 bg-primary text-white font-medium rounded-full hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Log in to Comment
            </Link>
          </div>
        )}

        <div className="space-y-6">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment._id} className="group p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white text-sm font-bold shadow-sm">
                      {comment.author?.name ? comment.author.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                        {comment.author?.name || 'Unknown'}
                      </h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  
                  {user && comment.author && user._id === comment.author._id && (
                    <button 
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 focus:opacity-100"
                      aria-label="Delete comment"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-gray-700 dark:text-gray-300 ml-13 leading-relaxed">
                  {comment.text}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-6 italic">No comments yet. Be the first to start the discussion!</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default PostDetails;
