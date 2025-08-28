import "./styles.css";
import { Menu, React } from "@webpack/common";
const { useState, useEffect } = React;
import definePlugin from "@utils/types";
import { Devs } from "@utils/constants";

const API_URL = "https://ryncord-stories.rayanzay.workers.dev";

function getFileType(file) {
    if (!file) return "";
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("image/")) return "image";
    return "other";
}

function StoriesSidebar() {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showUpload, setShowUpload] = useState(false);
    const [uploadType, setUploadType] = useState("text");
    const [uploadText, setUploadText] = useState("");
    const [uploadFile, setUploadFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [commentText, setCommentText] = useState({});
    const [comments, setComments] = useState({});
    const [likeLoading, setLikeLoading] = useState({});
    const [user, setUser] = useState({ name: "Anon", avatar: "https://placehold.co/40x40", id: "anon" });

    // Fetch stories
    useEffect(() => {
        setLoading(true);
        fetch(`${API_URL}/stories`)
            .then(res => res.json())
            .then(setStories)
            .catch(() => setError("Failed to load stories."))
            .finally(() => setLoading(false));
    }, []);

    // Fetch comments for a story
    const fetchComments = async (storyId) => {
        const res = await fetch(`${API_URL}/stories/${storyId}/comments`);
        const data = await res.json();
        setComments(prev => ({ ...prev, [storyId]: data }));
    };

    // Handle upload
    const handleUpload = async (e) => {
        e.preventDefault();
        setUploading(true);
        let type = uploadType;
        let content = uploadText;
        if (uploadType !== "text" && uploadFile) {
            // Upload file to backend
            const formData = new FormData();
            formData.append("file", uploadFile);
            const res = await fetch(`${API_URL}/stories/upload`, { method: "POST", body: formData });
            if (!res.ok) {
                setError("File upload failed (max 50MB, must be image/video).");
                setUploading(false);
                return;
            }
            const { url } = await res.json();
            content = url;
            type = getFileType(uploadFile);
        }
        // Post story
        const storyRes = await fetch(`${API_URL}/stories`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_name: user.name,
                user_avatar: user.avatar,
                type,
                content
            })
        });
        if (!storyRes.ok) {
            setError("Failed to post story.");
            setUploading(false);
            return;
        }
        setShowUpload(false);
        setUploadText("");
        setUploadFile(null);
        setUploadType("text");
        // Refresh stories
        fetch(`${API_URL}/stories`).then(res => res.json()).then(setStories);
        setUploading(false);
    };

    // Handle like
    const handleLike = async (storyId) => {
        setLikeLoading(prev => ({ ...prev, [storyId]: true }));
        await fetch(`${API_URL}/stories/${storyId}/like`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: user.id })
        });
        // Refresh stories
        fetch(`${API_URL}/stories`).then(res => res.json()).then(setStories);
        setLikeLoading(prev => ({ ...prev, [storyId]: false }));
    };

    // Handle comment
    const handleComment = async (storyId) => {
        const text = commentText[storyId];
        if (!text) return;
        await fetch(`${API_URL}/stories/${storyId}/comment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_name: user.name, text })
        });
        setCommentText(prev => ({ ...prev, [storyId]: "" }));
        fetchComments(storyId);
    };

    // UI
    return (
        <div className="stories-sidebar">
            <div className="stories-header">
                <span>Stories</span>
                <button onClick={() => setShowUpload(true)}>+ Add Story</button>
            </div>
            {loading ? <div>Loading...</div> : error ? <div style={{ color: "red" }}>{error}</div> : (
                <div className="stories-list">
                    {stories.map(story => (
                        <div className="story-card" key={story.id}>
                            <img className="story-avatar" src={story.user_avatar} alt={story.user_name} />
                            <div className="story-content">
                                <div className="story-user">{story.user_name}</div>
                                {story.type === "text" ? (
                                    <div className="story-text">{story.content}</div>
                                ) : story.type === "video" ? (
                                    <video className="story-video" src={story.content} controls width={200} />
                                ) : story.type === "image" ? (
                                    <img className="story-video" src={story.content} alt="story" style={{ maxWidth: 220, borderRadius: 6, marginBottom: 6 }} />
                                ) : null}
                                <div className="story-actions">
                                    <button onClick={() => handleLike(story.id)} disabled={likeLoading[story.id]}>❤️ {story.likes || 0}</button>
                                    <button onClick={() => fetchComments(story.id)}>💬 {comments[story.id]?.length ?? story.comments?.length ?? 0}</button>
                                </div>
                                {/* Comments Section */}
                                {comments[story.id] && (
                                    <div style={{ marginTop: 8 }}>
                                        {comments[story.id].map((c, i) => (
                                            <div key={i} style={{ fontSize: "0.95em", color: "var(--text-muted)", marginBottom: 2 }}>
                                                <b>{c.user_name}:</b> {c.text}
                                            </div>
                                        ))}
                                        <form onSubmit={e => { e.preventDefault(); handleComment(story.id); }} style={{ marginTop: 4, display: "flex", gap: 4 }}>
                                            <input
                                                type="text"
                                                value={commentText[story.id] || ""}
                                                onChange={e => setCommentText(prev => ({ ...prev, [story.id]: e.target.value }))}
                                                placeholder="Add a comment..."
                                                style={{ flex: 1 }}
                                            />
                                            <button type="submit">Send</button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {showUpload && (
                <div className="story-upload-modal">
                    <div className="modal-content">
                        <h3>Upload Story</h3>
                        <form onSubmit={handleUpload}>
                            <div style={{ marginBottom: 8 }}>
                                <label>
                                    <input
                                        type="radio"
                                        checked={uploadType === "text"}
                                        onChange={() => setUploadType("text")}
                                    /> Text
                                </label>
                                <label style={{ marginLeft: 10 }}>
                                    <input
                                        type="radio"
                                        checked={uploadType === "image"}
                                        onChange={() => setUploadType("image")}
                                    /> Image
                                </label>
                                <label style={{ marginLeft: 10 }}>
                                    <input
                                        type="radio"
                                        checked={uploadType === "video"}
                                        onChange={() => setUploadType("video")}
                                    /> Video
                                </label>
                            </div>
                            {uploadType === "text" ? (
                                <textarea
                                    value={uploadText}
                                    onChange={e => setUploadText(e.target.value)}
                                    placeholder="What's on your mind?"
                                    style={{ width: "100%", minHeight: 60, marginBottom: 8 }}
                                    required
                                />
                            ) : (
                                <input
                                    type="file"
                                    accept={uploadType === "image" ? "image/*" : "video/*"}
                                    onChange={e => setUploadFile(e.target.files[0])}
                                    required
                                />
                            )}
                            <div style={{ marginTop: 8 }}>
                                <button type="submit" disabled={uploading}>{uploading ? "Uploading..." : "Post"}</button>
                                <button type="button" onClick={() => setShowUpload(false)} style={{ marginLeft: 8 }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default definePlugin({
    name: "Stories",
    authors: [Devs.rayanzay],
    description: "Adds a Stories tab to the sidebar, allowing users to upload and view stories.",
    patches: [
        {
            find: 'case"pendingFriends":',
            replacement: {
                match: /return(\(0,\i\.jsxs?\)\(\i\.\i,{}\))}/,
                replace: "return [$1, $self.renderStoriesSidebar()]}"
            }
        }
    ],
    renderStoriesSidebar: StoriesSidebar,
});
