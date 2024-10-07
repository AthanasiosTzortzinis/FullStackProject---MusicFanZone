import React, { useEffect, useState } from 'react';
import axios from 'axios';

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

    const username = 'user';

    const fetchTopics = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/topics');
            setTopics(response.data);
        } catch (error) {
            console.error("Error fetching topics:", error);
            setError("Could not load topics. Please try again later.");
        }
    };

    const createOrUpdateTopic = async () => {
        if (!newTopic.title.trim()) {
            setError("Please provide a title for the topic.");
            return;
        }

        if (!newTopic.description.trim()) {
            setError("Please provide a description for the topic.");
            return;
        }

        try {
            if (editingTopic) {
                const response = await axios.put(`http://localhost:4000/api/topics/${editingTopic._id}`, newTopic);
                setTopics(topics.map(topic => (topic._id === editingTopic._id ? response.data : topic)));
                setEditingTopic(null);
                setNewTopic({ title: '', description: '' });
            } else {
                const response = await axios.post('http://localhost:4000/api/topics', newTopic);
                setTopics([...topics, response.data]);
                setSelectedTopicId(response.data._id);
                setNewTopic({ title: '', description: '' });
            }

            setError(null);
        } catch (error) {
            console.error("Error saving topic:", error);
            setError("Failed to save topic. Please try again.");
        }
    };

    const deleteTopic = async (topicId) => {
        try {
            await axios.delete(`http://localhost:4000/api/topics/${topicId}`);
            setTopics(topics.filter(topic => topic._id !== topicId));
            setError(null);
            
            if (selectedTopicId === topicId) {
                setSelectedTopicId('');
                setNewTopic({ title: '', description: '' }); 
            }
        } catch (error) {
            console.error("Error deleting topic:", error);
            setError("Failed to delete topic. Please try again.");
        }
    };

    const fetchComments = async (topicId) => {
        try {
            const response = await axios.get(`http://localhost:4000/api/topics/${topicId}/comments`);
            setComments(prev => ({ ...prev, [topicId]: response.data }));
        } catch (error) {
            console.error("Error fetching comments:", error);
            setError("Could not load comments. Please try again.");
        }
    };

    const createComment = async (topicId) => {
        if (!newComment.trim()) return;
        const commentData = { username: username, content: newComment };
        try {
            const response = await axios.post(`http://localhost:4000/api/topics/${topicId}/comments`, commentData);
            setComments(prev => ({ ...prev, [topicId]: [...(prev[topicId] || []), response.data] }));
            setNewComment('');
            setError(null);
        } catch (error) {
            console.error('Error creating comment:', error.response ? error.response.data : error.message);
            setError(error.response?.data?.error || "Failed to create comment. Please try again.");
        }
    };

    const updateComment = async (topicId) => {
        if (!editingCommentContent.trim()) return;
        try {
            const response = await axios.put(`http://localhost:4000/api/topics/${topicId}/comments/${editingCommentId}`, {
                content: editingCommentContent
            });
            setComments(prev => ({
                ...prev,
                [topicId]: prev[topicId].map(comment => (comment._id === editingCommentId ? response.data : comment))
            }));
            setEditingCommentId(null);
            setEditingCommentContent('');
            setError(null);
        } catch (error) {
            console.error('Error updating comment:', error);
            setError("Failed to update comment. Please try again.");
        }
    };

    const deleteComment = async (topicId, commentId) => {
        try {
            await axios.delete(`http://localhost:4000/api/topics/${topicId}/comments/${commentId}`);
            setComments(prev => ({
                ...prev,
                [topicId]: prev[topicId].filter(comment => comment._id !== commentId)
            }));
            setError(null);
        } catch (error) {
            console.error("Error deleting comment:", error);
            setError("Failed to delete comment. Please try again.");
        }
    };

    useEffect(() => {
        fetchTopics();
    }, []);

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

    const handleEditClick = (topic) => {
        setEditingTopic(topic);
        setNewTopic({ title: topic.title, description: topic.description });
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <h2 style={{ textAlign: 'center' }}>Join the Discussion!</h2>
            {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}

            <h3>Create a New Topic</h3>
            <div style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="Title"
                    value={newTopic.title}
                    onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                    style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                />
                <textarea
                    placeholder="Description"
                    value={newTopic.description}
                    onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                    style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                />
                <button onClick={createOrUpdateTopic} style={{ padding: '10px 20px' }}>
                    {editingTopic ? 'Update Topic' : 'Create Topic'}
                </button>
            </div>

            <h3>Choose a Topic</h3>
            <select
                value={selectedTopicId}
                onChange={handleTopicChange}
                style={{ width: '100%', padding: '10px', marginBottom: '20px' }}
            >
                <option value="">Select a topic</option>
                {topics.map(topic => (
                    <option key={topic._id} value={topic._id}>{topic.title}</option>
                ))}
            </select>

            {selectedTopicId && (
                <div>
                    <h3>Topic Details</h3>
                    {topics.find(topic => topic._id === selectedTopicId) && (
                        <>
                            {editingTopic ? (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <h4 style={{ margin: '0 10px 0 0' }}>Title:</h4>
                                        <input
                                            type="text"
                                            value={newTopic.title}
                                            onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                                            style={{ width: '100%', marginRight: '10px', padding: '10px' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <h4 style={{ margin: '0 10px 0 0' }}>Description:</h4>
                                        <textarea
                                            value={newTopic.description}
                                            onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                                            style={{ width: '100%', marginRight: '10px', padding: '10px' }}
                                        />
                                    </div>
                                    <button onClick={createOrUpdateTopic} style={{ marginTop: '10px' }}>
                                        Update
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <h4 style={{ margin: '0 10px 0 0' }}>Title:</h4>
                                        <span>{topics.find(topic => topic._id === selectedTopicId).title}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <h4 style={{ margin: '0 10px 0 0' }}>Description:</h4>
                                        <span>{topics.find(topic => topic._id === selectedTopicId).description}</span>
                                    </div>
                                    <button onClick={() => handleEditClick(topics.find(topic => topic._id === selectedTopicId))} style={{ marginTop: '10px' }}>
                                        Edit
                                    </button>
                                    <button onClick={() => deleteTopic(selectedTopicId)} style={{ marginLeft: '10px' }}>
                                        Delete
                                    </button>
                                </>
                            )}
                        </>
                    )}

                    <h5 style={{ marginTop: '15px' }}>Comments</h5>
                    {comments[selectedTopicId]?.length ? (
                        comments[selectedTopicId].map(comment => (
                            <div key={comment._id} style={{ marginBottom: '10px' }}>
                                <strong>{comment.username}:</strong>
                                {editingCommentId === comment._id ? (
                                    <div>
                                        <input
                                            type="text"
                                            value={editingCommentContent}
                                            onChange={(e) => setEditingCommentContent(e.target.value)}
                                            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                                        />
                                        <button onClick={() => updateComment(selectedTopicId)} style={{ marginRight: '10px' }}>Update</button>
                                    </div>
                                ) : (
                                    <div>
                                        <span>{comment.content}</span>
                                        <button onClick={() => {
                                            setEditingCommentId(comment._id);
                                            setEditingCommentContent(comment.content);
                                        }} style={{ marginLeft: '10px' }}>Edit</button>
                                        <button onClick={() => deleteComment(selectedTopicId, comment._id)} style={{ marginLeft: '10px' }}>Delete</button>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <p>No comments yet.</p>
                    )}

                    <h6 style={{ marginTop: '15px' }}>Add a Comment</h6>
                    <textarea
                        placeholder="Your Comment"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                    />
                    <button onClick={() => createComment(selectedTopicId)} style={{ padding: '10px 20px' }}>Add Comment</button>
                </div>
            )}
        </div>
    );
};

export default Forum;
