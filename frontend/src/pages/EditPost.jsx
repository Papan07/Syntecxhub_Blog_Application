import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import axios from 'axios';
import { FiImage, FiUpload } from 'react-icons/fi';

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
    ['link', 'image'],
    ['clean']
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'link', 'image'
];

const EditPost = () => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`/api/posts/${id}`);
        setTitle(res.data.title);
        setContent(res.data.content);
        setCurrentImage(res.data.image);
        setLoading(false);
      } catch (err) {
        setError('Error fetching post for editing');
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return '';
    
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const res = await axios.post('/api/posts/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.imageUrl;
    } catch (err) {
      throw new Error('Image upload failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content || content === '<p><br></p>') {
      setError('Title and content are required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      let imageUrl = currentImage;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      await axios.put(`/api/posts/${id}`, {
        title,
        content,
        image: imageUrl,
      });

      navigate(`/post/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error updating post');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-darkCard p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Edit Post</h1>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white transition-colors text-lg font-medium"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cover Image</label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-800 hover:bg-gray-100 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-700 transition-colors overflow-hidden relative">
              {currentImage && !imageFile && (
                <div className="absolute inset-0 opacity-40">
                  <img src={currentImage} alt="Current cover" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex flex-col items-center justify-center pt-5 pb-6 relative z-10">
                {imageFile ? (
                  <div className="text-center text-primary flex flex-col items-center">
                    <FiImage className="w-10 h-10 mb-3 text-primary" />
                    <p className="text-sm font-medium">{imageFile.name}</p>
                    <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Selected. Click to change.</p>
                  </div>
                ) : (
                  <>
                    <FiUpload className={`w-10 h-10 mb-3 ${currentImage ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400'}`} />
                    <p className={`mb-2 text-sm ${currentImage ? 'text-gray-800 dark:text-gray-200 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                      {currentImage ? 'Change Image' : <><span className="font-semibold">Click to upload</span> or drag and drop</>}
                    </p>
                  </>
                )}
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content</label>
          <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700">
            <ReactQuill 
              theme="snow" 
              value={content} 
              onChange={setContent} 
              modules={modules}
              formats={formats}
              className="h-96 text-gray-900 dark:text-white custom-quill"
            />
          </div>
        </div>

        <div className="pt-8 flex justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 min-w-[120px] rounded-lg mr-4 font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 min-w-[140px] rounded-lg bg-primary text-white font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              'Update Post'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPost;
