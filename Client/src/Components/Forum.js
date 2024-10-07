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
            } else {
                const response = await axios.post('http://localhost:4000/api/topics', newTopic);
                setTopics([...topics, response.data]);
            }
            
            setSelectedTopicId(editingTopic ? editingTopic._id : newTopic._id);
            setNewTopic({ title: '', description: '' });
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
            const selectedTopic = topics.find(topic => topic._id === topicId);
            setNewTopic({ title: selectedTopic.title, description: selectedTopic.description }); 
            fetchComments(topicId);
        } else {
            setComments({});
            setNewTopic({ title: '', description: '' }); 
        }
    };

    const handleEditClick = (topic) => {
        setEditingTopic(topic);
        setNewTopic({ title: topic.title, description: topic.description });
    };

    const handleCommentEditClick = (comment) => {
        setEditingCommentId(comment._id);
        setEditingCommentContent(comment.content);
    };

    const handleUpdateSubmit = () => {
        createOrUpdateTopic();
    };

    const handleUpdateTopic = () => {
        createOrUpdateTopic();
        setEditingTopic(null); 
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <h2 style={{ textAlign: 'center' }}>Join the Discussion!</h2>
            {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}

            {/* Topic Creation/Editing Section */}
            <h3>{editingTopic ? 'Edit Topic' : 'Create a New Topic'}</h3>
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
                <button onClick={handleUpdateSubmit} style={{ padding: '10px 20px' }}>
                    {editingTopic ? 'Update Topic' : 'Create Topic'}
                </button>
            </div>

            {/* Topic Selection Section */}
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

            {/* Topic Details and Comments Section */}
            {selectedTopicId && (
                <div>
                    <h3>Topic Details</h3>
                    {topics.find(topic => topic._id === selectedTopicId) && (
                        <>
                            <h4>Title: {newTopic.title}</h4>
                            <p>Description: {newTopic.description}</p>
                            {editingTopic ? (
                                <>
                                    <button onClick={() => handleUpdateTopic()} style={{ marginRight: '10px' }}>Save Changes</button>
                                    <button onClick={() => setEditingTopic(null)} style={{ marginRight: '10px' }}>Cancel</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => handleEditClick(topics.find(topic => topic._id === selectedTopicId))}>Edit Topic</button>
                                    <button onClick={() => deleteTopic(selectedTopicId)} style={{ marginLeft: '10px' }}>Delete Topic</button>
                                </>
                            )}
                        </>
                    )}

                    {/* Comments Section */}
                    <h5 style={{ marginTop: '15px' }}>Comments</h5>
                    {comments[selectedTopicId] && comments[selectedTopicId].length > 0 ? (
                        comments[selectedTopicId].map(comment => (
                            <div key={comment._id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
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
                                        <button onClick={() => setEditingCommentId(null)} style={{ marginRight: '10px' }}>Cancel</button>
                                    </div>
                                ) : (
                                    <div>
                                        <span>{comment.content}</span>
                                        <button onClick={() => handleCommentEditClick(comment)} style={{ marginLeft: '10px' }}>Edit</button>
                                        <button onClick={() => deleteComment(selectedTopicId, comment._id)} style={{ marginLeft: '10px' }}>Delete</button>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <p>No comments yet.</p>
                    )}

                    {/* Add Comment Section */}
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
