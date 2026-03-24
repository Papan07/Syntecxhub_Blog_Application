import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

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
      setLoading(true);
      setError('');
      
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const res = await axios.post('/api/posts', {
        title,
        content,
        image: imageUrl,
      });

      navigate(`/post/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error creating post');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-darkCard p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Create a New Story</h1>
      
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
            placeholder="What's your story about?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cover Image</label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-800 hover:bg-gray-100 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-700 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {imageFile ? (
                  <div className="text-center text-primary flex flex-col items-center">
                    <FiImage className="w-10 h-10 mb-3 text-primary" />
                    <p className="text-sm font-medium">{imageFile.name}</p>
                    <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Click to change cover image</p>
                  </div>
                ) : (
                  <>
                    <FiUpload className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">JPG, PNG or WEBP (MAX. 5MB)</p>
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
              placeholder="Tell your story..."
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
            disabled={loading}
            className="px-6 py-2.5 min-w-[140px] rounded-lg bg-primary text-white font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              'Publish Post'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
