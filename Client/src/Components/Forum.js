import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../Style/Forum.css';

const Forum = () => {
    const [topics, setTopics] = useState([]);
    const [newTopic, setNewTopic] = useState({ title: '', description: '' });
    const [editingTopic, setEditingTopic] = useState(null);
    const [comments, setComments] = useState({});
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentContent, setEditingCommentContent] = useState('');
    const [selectedTopicId, setSelectedTopicId] = useState('');
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    // Retrieve the user info from the token stored in localStorage
    const getUserFromToken = () => {
        const token = localStorage.getItem('token');
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return { username: payload.username, id: payload.id };
        }
        return null;
    };

    // Fetch topics and set the current user when the component loads
    useEffect(() => {
        const user = getUserFromToken();
        if (user) {
            setCurrentUser(user);
        }
        fetchTopics();
    }, []);

    // Fetch the list of topics from the backend
    const fetchTopics = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/topics');
            setTopics(response.data);
        } catch (error) {
            setError("Could not load topics. Please try again later.");
        }
    };

    // Create or update a topic
    const createOrUpdateTopic = async () => {
        if (!newTopic.title.trim()) {
            setError("Please provide a title for the topic.");
            return;
        }

        if (!newTopic.description.trim()) {
            setError("Please provide a description for the topic.");
            return;
        }

        const topicData = { ...newTopic, createdBy: currentUser?.username, createdAt: new Date() };

        try {
            if (editingTopic) {
                const response = await axios.put(`http://localhost:4000/api/topics/${editingTopic._id}`, topicData);
                setTopics(topics.map(topic => (topic._id === editingTopic._id ? response.data : topic)));
                setEditingTopic(null);
            } else {
                const response = await axios.post('http://localhost:4000/api/topics', topicData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                });
                setTopics([...topics, response.data]);
                setSelectedTopicId(response.data._id);
            }
            setNewTopic({ title: '', description: '' });
            setError(null);
        } catch (error) {
            setError("Failed to save topic. Please try again.");
        }
    };

    // Delete a topic
    const deleteTopic = async (topicId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this topic?");
        if (!confirmDelete) return;

        try {
            await axios.delete(`http://localhost:4000/api/topics/${topicId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setTopics(topics.filter(topic => topic._id !== topicId));
            if (selectedTopicId === topicId) {
                setSelectedTopicId('');
                setNewTopic({ title: '', description: '' });
            }
            setError(null);
        } catch (error) {
            setError("Failed to delete topic. Please try again.");
        }
    };

    // Fetch comments for a selected topic
    const fetchComments = async (topicId) => {
        try {
            const response = await axios.get(`http://localhost:4000/api/topics/${topicId}/comments`);
            setComments(prev => ({ ...prev, [topicId]: response.data }));
        } catch (error) {
            setError("Could not load comments. Please try again.");
        }
    };

    // Create a new comment for a selected topic
    const createComment = async (topicId) => {
        if (!newComment.trim()) return;

        const commentData = {
            username: currentUser?.username,
            content: newComment,
            createdAt: new Date()
        };

        try {
            const response = await axios.post(`http://localhost:4000/api/topics/${topicId}/comments`, commentData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            setComments(prev => ({
                ...prev,
                [topicId]: [...(prev[topicId] || []), response.data]
            }));
            setNewComment('');
            setError(null);
        } catch (error) {
            setError("Failed to create comment. Please try again.");
            console.error(error);
        }
    };

    // Update an existing comment
    const updateComment = async (topicId) => {
        if (!editingCommentContent.trim()) return;

        try {
            const response = await axios.put(`http://localhost:4000/api/topics/${topicId}/comments/${editingCommentId}`, {
                content: editingCommentContent,
                createdAt: new Date()
            });
            setComments(prev => ({
                ...prev,
                [topicId]: prev[topicId].map(comment => (comment._id === editingCommentId ? response.data : comment))
            }));
            setEditingCommentId(null);
            setEditingCommentContent('');
            setError(null);
        } catch (error) {
            setError("Failed to update comment. Please try again.");
        }
    };

    // Delete a comment
    const deleteComment = async (topicId, commentId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this comment?");
        if (!confirmDelete) return;

        try {
            await axios.delete(`http://localhost:4000/api/topics/${topicId}/comments/${commentId}`);
            setComments(prev => ({
                ...prev,
                [topicId]: prev[topicId].filter(comment => comment._id !== commentId),
            }));
            setError(null);
        } catch (error) {
            setError("Failed to delete comment. Please try again.");
        }
    };

    // Handle topic selection
    const handleTopicChange = (e) => {
        const topicId = e.target.value;
        setSelectedTopicId(topicId);
        if (topicId) {
            fetchComments(topicId);
            setEditingTopic(null);
        } else {
            setComments({});
            setNewTopic({ title: '', description: '' });
        }
    };

    // Start editing a topic
    const handleEditClick = (topic) => {
        setEditingTopic(topic);
        setNewTopic({ title: topic.title, description: topic.description });
    };

    // Format the timestamp to a readable string
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString(); // Formats the timestamp as a readable date and time
    };

    return (
        <div className="forum-container">
            <h2 className="forum-title">Join the Discussion!</h2>
            {error && <div className="error-message">{error}</div>}

            {currentUser && (
                <>
                    <h3 className="create-topic-title">Create a New Topic</h3>
                    <div className="create-topic-form">
                        <input
                            type="text"
                            placeholder="Title"
                            value={newTopic.title}
                            onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                            className="topic-input"
                        />
                        <textarea
                            placeholder="Description"
                            value={newTopic.description}
                            onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                            className="topic-textarea"
                        />
                        <button onClick={createOrUpdateTopic} className="topic-button">
                            {editingTopic ? "Save Changes" : "Create Topic"}
                        </button>
                    </div>

                    <h3 className="choose-topic-title">Choose a Topic</h3>
                    <select
                        value={selectedTopicId}
                        onChange={handleTopicChange}
                        className="topic-select"
                    >
                        <option value="">Select a topic</option>
                        {topics.map(topic => (
                            <option key={topic._id} value={topic._id}>{topic.title}</option>
                        ))}
                    </select>

                    {selectedTopicId && (
                        <div className="topic-details">
                            <h3>Topic Details</h3>
                            {topics.find(topic => topic._id === selectedTopicId) && (
                                <>
                                    {editingTopic ? (
                                        <>
                                             <h4 className='edit-label'>Edit Topic</h4>
        <div className="edit-topic-form">
            <label htmlFor="editTitle" className="edit-label">Title</label>
            <input
                id="editTitle"
                value={newTopic.title}
                onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                className="topic-input"
            />
            <label htmlFor="editDescription" className="edit-label">Description</label>
            <textarea
                id="editDescription"
                value={newTopic.description}
                onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                className="topic-textarea"
                                                />
                                            </div>
                                            <div className="edit-actions">
                                                <button onClick={createOrUpdateTopic} className="topic-button">Save Changes</button>
                                                <button onClick={() => setEditingTopic(null)} className="topic-button cancel">Cancel</button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <p><strong>Title:</strong> {topics.find(topic => topic._id === selectedTopicId).title}</p>
                                            <p><strong>Description:</strong> {topics.find(topic => topic._id === selectedTopicId).description}</p>
                                            <p><strong>Created by:</strong> {topics.find(topic => topic._id === selectedTopicId).createdBy}</p>
                                            <p><strong>Created at:</strong> {formatTimestamp(topics.find(topic => topic._id === selectedTopicId).createdAt)}</p>
                                            {/* Conditional rendering for Edit/Delete buttons */}
                                            {currentUser?.username === topics.find(topic => topic._id === selectedTopicId).createdBy && (
                                                <>
                                                    <button onClick={() => deleteTopic(selectedTopicId)} className="topic-button delete">Delete Topic</button>
                                                    <button onClick={() => handleEditClick(topics.find(topic => topic._id === selectedTopicId))} className="topic-button edit">Edit Topic</button>
                                                </>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {selectedTopicId && (
                        <>
                            <h3 className="comments-title">Comments</h3>
                            <div className="comment-form">
                                <textarea
                                    placeholder="Add a comment..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="comment-textarea"
                                />
                                <button onClick={() => createComment(selectedTopicId)} className="comment-button">Post Comment</button>
                            </div>
                            <div className="comments-list">
                                {comments[selectedTopicId]?.map(comment => (
                                    <div key={comment._id} className="comment">
                                        <div className="comment-author">{comment.username}</div>
                                        {editingCommentId === comment._id ? (
                                            <div className="edit-comment-form">
                                                <textarea
                                                    value={editingCommentContent}
                                                    onChange={(e) => setEditingCommentContent(e.target.value)}
                                                    className="comment-textarea"
                                                />
                                                <button onClick={() => updateComment(selectedTopicId)} className="comment-button">Update</button>
                                                <button onClick={() => setEditingCommentId(null)} className="comment-button cancel">Cancel</button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="comment-content">{comment.content}</div>
                                                <div className="comment-timestamp">{formatTimestamp(comment.createdAt)}</div> {/* Timestamp */}
                                            </>
                                        )}
                                        <div className="comment-actions">
                                            {/* Conditional rendering for Edit/Delete buttons */}
                                            {currentUser?.username === comment.username && (
                                                <>
                                                    <button onClick={() => {
                                                        setEditingCommentId(comment._id);
                                                        setEditingCommentContent(comment.content);
                                                    }} className="comment-button edit">Edit</button>
                                                    <button onClick={() => deleteComment(selectedTopicId, comment._id)} className="comment-button delete">Delete</button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default Forum;
