import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Forum = () => {
    const [topics, setTopics] = useState([]);
    const [newTopic, setNewTopic] = useState({ title: '', description: '' });
    const [editingTopic, setEditingTopic] = useState(null);
    const [comments, setComments] = useState({});
    const [newComment, setNewComment] = useState('');
    const [selectedTopicId, setSelectedTopicId] = useState('');
    const [error, setError] = useState(null); // State to store error messages

    const username = "YourUsername"; // Replace with actual user data if applicable

    // Fetch all topics
    const fetchTopics = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/topics');
            setTopics(response.data);
        } catch (error) {
            console.error("Error fetching topics:", error);
            setError("Could not load topics. Please try again later.");
        }
    };

    // Create a new topic
    const createTopic = async () => {
        try {
            const response = await axios.post('http://localhost:4000/api/topics', newTopic);
            setTopics([...topics, response.data]);
            setNewTopic({ title: '', description: '' });
            setError(null); // Reset error on success
        } catch (error) {
            console.error("Error creating topic:", error);
            setError("Failed to create topic. Please try again.");
        }
    };

    // Update an existing topic
    const updateTopic = async () => {
        if (editingTopic) {
            try {
                const response = await axios.put(`http://localhost:4000/api/topics/${editingTopic._id}`, newTopic);
                setTopics(topics.map(topic => (topic._id === editingTopic._id ? response.data : topic)));
                setEditingTopic(null);
                setNewTopic({ title: '', description: '' });
                setError(null); // Reset error on success
            } catch (error) {
                console.error("Error updating topic:", error);
                setError("Failed to update topic. Please try again.");
            }
        }
    };

    // Delete a topic
    const deleteTopic = async (topicId) => {
        try {
            await axios.delete(`http://localhost:4000/api/topics/${topicId}`);
            setTopics(topics.filter(topic => topic._id !== topicId));
            setError(null); // Reset error on success
        } catch (error) {
            console.error("Error deleting topic:", error);
            setError("Failed to delete topic. Please try again.");
        }
    };

    // Fetch comments for a specific topic
    const fetchComments = async (topicId) => {
        try {
            const response = await axios.get(`http://localhost:4000/api/topics/${topicId}/comments`);
            setComments(prev => ({ ...prev, [topicId]: response.data }));
        } catch (error) {
            console.error("Error fetching comments:", error);
            setError("Could not load comments. Please try again.");
        }
    };

    // Create a new comment for a specific topic
    const createComment = async (topicId) => {
    try {
        await axios.post(`http://localhost:4000/api/topics/${topicId}/comments`, {
            username: username,
            content: newComment
        });
        setNewComment('');  // Clear the comment box
        fetchComments(topicId);  // Refresh comments from the server
        setError(null); // Reset error on success
    } catch (error) {
        console.error("Error creating comment:", error);
        setError("Failed to add comment. Please try again.");
    }
};

    // Delete a comment
    const deleteComment = async (topicId, commentId) => {
        try {
            await axios.delete(`http://localhost:4000/api/topics/${topicId}/comments/${commentId}`);
            setComments(prev => ({
                ...prev,
                [topicId]: prev[topicId].filter(comment => comment._id !== commentId)
            }));
            setError(null); // Reset error on success
        } catch (error) {
            console.error("Error deleting comment:", error);
            setError("Failed to delete comment. Please try again.");
        }
    };

    useEffect(() => {
        fetchTopics();
    }, []);

    // Handle topic selection
    const handleTopicChange = (e) => {
        const topicId = e.target.value;
        setSelectedTopicId(topicId);

        // Fetch comments only if a topic is selected
        if (topicId) {
            fetchComments(topicId);
        } else {
            setComments({}); // Reset comments if no topic is selected
        }
    };

    // Start editing a topic
    const handleEditClick = (topic) => {
        setEditingTopic(topic);
        setNewTopic({ title: topic.title, description: topic.description });
    };

    const handleUpdateSubmit = () => {
        updateTopic();
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <h2 style={{ textAlign: 'center' }}>Join the Discussion!</h2>

            {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>} {/* Display error message */}

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
                <button onClick={createTopic} style={{ padding: '10px 20px' }}>Create Topic</button>
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
                <>
                    <h3>Topic Details</h3>
                    <div>
                        {topics.find(topic => topic._id === selectedTopicId) && (
                            <>
                                <h4>{topics.find(topic => topic._id === selectedTopicId).title}</h4>
                                <p>{topics.find(topic => topic._id === selectedTopicId).description}</p>

                                <button onClick={() => deleteTopic(selectedTopicId)} style={{ marginRight: '10px' }}>Delete Topic</button>
                                <button onClick={() => handleEditClick(topics.find(topic => topic._id === selectedTopicId))}>Edit Topic</button>

                                <h5>Comments</h5>
                                {comments[selectedTopicId] && comments[selectedTopicId].length > 0 ? (
                                    comments[selectedTopicId].map(comment => (
                                        <div key={comment._id} style={{ padding: '5px 0' }}>
                                            <p><strong>{comment.username}</strong>: {comment.content}</p>
                                            <button onClick={() => deleteComment(selectedTopicId, comment._id)} style={{ marginRight: '10px' }}>Delete Comment</button>
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
                            </>
                        )}
                    </div>
                </>
            )}

            {/* Editing Topic Section */}
            {editingTopic && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Edit Topic</h3>
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
                    <button onClick={handleUpdateSubmit} style={{ padding: '10px 20px' }}>Update Topic</button>
                    <button onClick={() => setEditingTopic(null)} style={{ padding: '10px 20px', marginLeft: '10px' }}>Cancel</button>
                </div>
            )}
        </div>
    );
};

export default Forum;
