import { useState, useEffect } from 'react';
import axios from 'axios';
import PostCard from '../components/PostCard';
import { FiSearch } from 'react-icons/fi';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/posts?pageNumber=${page}&keyword=${keyword}`);
      setPosts(res.data.posts);
      setPages(res.data.pages);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page, keyword]);

  const handleSearch = (e) => {
    e.preventDefault();
    setKeyword(searchInput);
    setPage(1); // Reset to first page
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header section with Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/5 dark:to-secondary/5 p-8 rounded-2xl border border-primary/10 dark:border-primary/5">
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Stories</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-lg">
            Discover the latest articles, tutorials, and insights from our community of writers and developers.
          </p>
        </div>

        <form onSubmit={handleSearch} className="w-full md:w-96 relative">
          <input
            type="text"
            placeholder="Search articles..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-darkCard border border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-all"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <button type="submit" className="hidden" aria-label="Search">Submit</button>
        </form>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-darkCard rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col h-96">
              <div className="h-48 bg-gray-200 dark:bg-gray-800"></div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded mb-4 w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mb-2 w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mb-4 w-5/6"></div>
                <div className="mt-auto flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-center">
          {error}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No posts found</h2>
          <p className="text-gray-500">Try adjusting your search criteria or write a new post!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center pt-10">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Previous
                </button>
                
                {[...Array(pages).keys()].map((x) => (
                  <button
                    key={x + 1}
                    onClick={() => setPage(x + 1)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      x + 1 === page
                        ? 'bg-primary text-white font-medium shadow-sm'
                        : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {x + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pages}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
