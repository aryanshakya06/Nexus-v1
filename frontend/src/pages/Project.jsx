import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserLayout from '../layout/userLayout';
import { AppData } from '../context/AppContext';

const Project = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { logoutUser } = AppData();

  useEffect(() => {
    fetchProjects();
    fetchUserData();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/v1/project', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Prevent 304 caching issues
      });

      // Handle 304 or other non-200 responses
      if (response.status === 304) {
        setError('Data cached. Please refresh or clear cache.');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && Array.isArray(data.projects)) {
        setProjects(data.projects);
      } else {
        setError('Invalid data format received');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Error fetching projects: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/me', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      // Set default user if fetch fails
      setUser({ name: 'Guest' });
    }
  };

  const handleCreateProject = () => {
    navigate('/create-project');
  };

  const handleProjectClick = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  const handleDeleteProject = async (projectId, e) => {
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/v1/project/${projectId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setProjects(projects.filter(project => project._id !== projectId));
        alert('Project deleted successfully');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete project');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Error deleting project: ' + err.message);
    }
  };

  return (
    <UserLayout>
      {/* Top Navigation Bar */}
      <div style={styles.topBar}>
        <div style={styles.leftSection}>
          <button style={styles.createButton} onClick={handleCreateProject}>
            <span style={styles.plusIcon}>+</span> Create Project
          </button>
        </div>
        
        <div style={styles.centerSection}>
          <h1 style={styles.title}>Project Directory</h1>
        </div>
        
        <div style={styles.rightSection}>
          <div style={styles.userInfo}>
            <span style={styles.userLabel}>User:</span>
            <span style={styles.userName}>{user?.name || 'Guest'}</span>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div style={styles.container}>
        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.loader}></div>
            <p style={styles.loadingText}>Loading projects...</p>
          </div>
        ) : error ? (
          <div style={styles.errorContainer}>
            <p style={styles.errorText}>{error}</p>
            <button style={styles.retryButton} onClick={fetchProjects}>
              Retry
            </button>
          </div>
        ) : projects.length === 0 ? (
          <div style={styles.emptyState}>
            <h2 style={styles.emptyTitle}>No Projects Yet</h2>
            <p style={styles.emptyText}>Create your first project to get started!</p>
            <button style={styles.createButton} onClick={handleCreateProject}>
              <span style={styles.plusIcon}>+</span> Create Project
            </button>
          </div>
        ) : (
          <div style={styles.projectsGrid}>
            {projects.map((project) => (
              <div
                key={project._id}
                style={styles.projectCard}
                onClick={() => handleProjectClick(project._id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
              >
                <div style={styles.cardHeader}>
                  <h3 style={styles.projectTitle}>{project.title}</h3>
                  {user?._id === project.createdBy && (
                    <button
                      style={styles.deleteButton}
                      onClick={(e) => handleDeleteProject(project._id, e)}
                      title="Delete project"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '1';
                        e.currentTarget.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '0.6';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      🗑️
                    </button>
                  )}
                </div>
                
                <p style={styles.projectDescription}>
                  {project.description && project.description.length > 150
                    ? `${project.description.substring(0, 150)}...`
                    : project.description || 'No description available'}
                </p>

                <div style={styles.projectMeta}>
                  {project.department && (
                    <span style={styles.metaBadge}>
                      📚 {project.department}
                    </span>
                  )}
                  {project.year && (
                    <span style={styles.metaBadge}>
                      📅 {project.year}
                    </span>
                  )}
                </div>

                {project.domain && (
                  <div style={styles.domainBadge}>
                    {project.domain}
                  </div>
                )}

                {project.technologies && project.technologies.length > 0 && (
                  <div style={styles.techContainer}>
                    {project.technologies.slice(0, 3).map((tech, index) => (
                      <span key={index} style={styles.techBadge}>
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 3 && (
                      <span style={styles.techBadge}>
                        +{project.technologies.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {project.tags && project.tags.length > 0 && (
                  <div style={styles.tagsContainer}>
                    {project.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} style={styles.tag}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <button hidden onClick={() => logoutUser(navigate)} id="force-logout">Logout</button>
    </UserLayout>
  );
};

const styles = {
  topBar: {
    width: "90%",
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    backgroundColor: '#ffffff',
    borderBottom: '2px solid #e0e0e0',
    marginBottom: "1rem"
  },
  leftSection: {
    flex: 1,
  },
  centerSection: {
    flex: 1,
    textAlign: 'center',
  },
  rightSection: {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#f5f5f5',
    borderRadius: '20px',
  },
  userLabel: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500',
  },
  userName: {
    fontSize: '16px',
    color: '#333',
    fontWeight: 'bold',
  },
  createButton: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background-color 0.3s',
  },
  plusIcon: {
    fontSize: '20px',
    fontWeight: 'bold',
  },
  container: {
    width: "90%",
    padding: '40px',
    backgroundColor: '#f9f9f9',
    minHeight: 'calc(100vh - 100px)',
  },
  projectsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
    marginTop: '20px',
  },
  projectCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    position: 'relative',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  projectTitle: {
    margin: '0 0 12px 0',
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '4px',
    opacity: 0.6,
    transition: 'opacity 0.2s, transform 0.2s',
  },
  projectDescription: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '16px',
  },
  projectMeta: {
    display: 'flex',
    gap: '12px',
    marginBottom: '12px',
    flexWrap: 'wrap',
  },
  metaBadge: {
    fontSize: '12px',
    color: '#555',
    backgroundColor: '#f0f0f0',
    padding: '4px 10px',
    borderRadius: '12px',
  },
  domainBadge: {
    display: 'inline-block',
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 'bold',
    marginBottom: '12px',
  },
  techContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '12px',
  },
  techBadge: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
  },
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  tag: {
    color: '#1976d2',
    fontSize: '12px',
    fontWeight: '500',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
  },
  loader: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #4CAF50',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '16px',
    color: '#666',
    fontSize: '16px',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: '16px',
    marginBottom: '16px',
  },
  retryButton: {
    padding: '10px 20px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: '24px',
    color: '#333',
    marginBottom: '12px',
  },
  emptyText: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '24px',
  },
};

export default Project;
