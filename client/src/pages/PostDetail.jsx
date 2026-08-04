import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import UserAvatar from '../components/UserAvatar';
import LikeButton from '../components/LikeButton';
import { Bookmark, MoreHorizontal, ArrowLeft, Wand2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getPost, reportPost, toggleSavePost } from '../features/post/postSlice';
import Loader from '../components/Loader';
import { follow } from '../features/profile/profileSlice';
import { toast } from 'react-toastify';

const PostDetail = () => {

  const [modal, setModal] = useState(false)
  const [text, setText] = useState("")
  const [isSaved, setIsSaved] = useState(false)

  const { post, postLoading, postError, postErrorMessage } = useSelector(state => state.post)
  const { profile, profileLoading, profileError, profileErrorMessage } = useSelector(state => state.profile)

  const { pid } = useParams();
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const postUser = post?.user || {}
  const alreadyFollowed = profile?.following?.some(f => f?._id === postUser?._id)

  const followUser = (id) => {
    if (!id) return
    dispatch(follow(id))
  }

  const handleModal = () => setModal(prev => !prev)

  const handleReportPost = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    dispatch(reportPost({ text, pid }))
    setModal(false)
    setText("")
  }

  const handleSave = () => {
    dispatch(toggleSavePost(pid))
    setIsSaved(prev => !prev)
    toast.success(!isSaved ? "Saved to collections" : "Removed from collections", { theme: "dark" })
  }

  const handleCopy = () => {
    if (post?.prompt) {
      navigator.clipboard.writeText(post.prompt)
      toast.success("Prompt copied!", { theme: "dark" })
    }
  }

  useEffect(() => {
    // FIX: Always fetch post when pid changes
    dispatch(getPost(pid))

    const checkSavedStatus = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const user = JSON.parse(userStr);
        const res = await fetch('/api/saved-posts', {
          headers: { authorization: `Bearer ${user.token}` }
        })
        if (!res.ok) return
        const data = await res.json()
        if (data && Array.isArray(data)) {
          setIsSaved(data.some(d => d.post?._id === pid || d.post === pid))
        }
      } catch (e) {}
    }
    checkSavedStatus()
  }, [pid]) // Only re-run when pid changes

  useEffect(() => {
    if (postError && postErrorMessage) {
      toast.error(postErrorMessage)
      navigate("/auth")
    }
  }, [postError, postErrorMessage])

  useEffect(() => {
    if (profileError && profileErrorMessage) {
      toast.error(profileErrorMessage)
    }
  }, [profileError, profileErrorMessage])

  if (postLoading || profileLoading) {
    return <Loader />
  }

  if (!post) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="text-lg mb-4">Post not found</p>
          <Link to="/auth" className="text-violet-400 hover:underline">Go back</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col md:flex-row max-w-[1600px] mx-auto overflow-hidden">
      {/* Scrollable Image Area */}
      <div className="flex-1 overflow-y-auto bg-black/50 p-4 md:p-8 flex flex-col items-center justify-start min-h-0 relative hide-scrollbar">
        <Link
          to={-1}
          className="absolute top-4 left-4 md:top-8 md:left-8 w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-white/10 transition-colors z-10 group"
        >
          <ArrowLeft className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
        </Link>
        <div className="max-w-4xl w-full flex-grow flex items-center justify-center py-10">
          <img
            src={post.imageLink}
            alt={post.prompt || post.caption || "Post image"}
            className="w-full h-auto object-contain max-h-[85vh] rounded-xl shadow-2xl shadow-black ring-1 ring-white/10"
          />
        </div>
      </div>

      {/* Detail Sidebar */}
      <div className="w-full md:w-[400px] lg:w-[450px] shrink-0 border-l border-white/10 glass-card bg-[#0a0a0f]/90 flex flex-col h-[50vh] md:h-full overflow-y-auto">
        <div className="p-6 md:p-8 flex flex-col gap-8 h-full">

          {/* Header Actions */}
          <div className="relative flex items-center justify-between">

            {modal && (
              <div className="p-8 h-52 md:w-80 w-full bg-gray-900 rounded-lg absolute top-12 right-5 z-50">
                <form onSubmit={handleReportPost}>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className='border p-4 border-white rounded-xl w-full bg-transparent text-white resize-none'
                    placeholder='Enter Your Issue Here..'
                  />
                  <button
                    type='submit'
                    className="mt-4 w-full cursor-pointer py-2 rounded-xl flex items-center justify-center gap-2 font-bold transition-all duration-300 bg-white/5 border border-violet-500/30 text-violet-300 hover:bg-violet-600/20"
                  >
                    Report This Post
                  </button>
                </form>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <Bookmark className={`w-4 h-4 transition-colors ${isSaved ? "text-violet-500 fill-violet-500" : "text-gray-300"}`} />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleModal}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors"
              >
                <MoreHorizontal className="w-5 h-5 text-gray-500" />
              </button>
              <LikeButton post={post} />
            </div>
          </div>

          <div className="h-px w-full bg-white/5"></div>

          {/* User Info — fully null safe */}
          {postUser?._id ? (
            <div className="flex items-center justify-between">
              <Link to={`/auth/profile/${postUser?.name}`} className="flex items-center gap-3 group">
                <UserAvatar src={postUser?.avatar} alt={postUser?.name} />
                <div>
                  <p className="font-bold text-white group-hover:text-violet-400 transition-colors">
                    {postUser?.name || "Unknown"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {postUser?.followers?.length ?? 0} followers
                  </p>
                </div>
              </Link>
              <button
                disabled={alreadyFollowed}
                onClick={() => followUser(postUser?._id)}
                className="px-5 py-2 rounded-full bg-white/10 text-white font-medium hover:bg-white/20 transition-colors text-sm disabled:bg-green-900 disabled:cursor-not-allowed"
              >
                {alreadyFollowed ? "Followed" : "Follow"}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
              <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
            </div>
          )}

          {/* Prompt */}
          <div className="flex-1 mt-4">
            <h2 className="text-xl font-syne font-bold mb-4">Prompt details</h2>
            <div className="bg-black/40 border border-white/5 rounded-xl p-5 relative group">
              <p className="text-gray-300 leading-relaxed font-mono text-sm selection:bg-violet-500/30">
                {post?.prompt || post?.caption || "No prompt available"}
              </p>
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-2 rounded bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20 text-xs font-semibold text-violet-300"
              >
                Copy
              </button>
            </div>

            <button className="mt-6 w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all duration-300 bg-white/5 border border-violet-500/30 text-violet-300 hover:bg-violet-600/20">
              <Wand2 className="w-5 h-5" />
              Remix Prompt
            </button>
          </div>

          {/* Metadata */}
          <div className="mt-auto pt-6 text-xs text-gray-500 flex justify-between items-center">
            <span>Model: Nano Banana Pro</span>
            <span>Seed: {Math.floor(Math.random() * 999999999)}</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PostDetail;