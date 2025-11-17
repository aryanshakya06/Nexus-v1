import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { server } from '../main';
import axios from 'axios';
import { toast } from 'react-toastify';
import UserLayout from '../layout/userLayout';
import './ProjectId.css';
import { AppData } from '../context/AppContext';

const ProjectId = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const { logoutUser } = AppData();

  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line
  }, [id]);

  const fetchProject = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${server}/api/v1/project/${id}`);
      setProject(data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Project not found');
      setTimeout(() => navigate("/project"), 2000);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="project-loading">
          <div className="project-loader"></div>
          <p>Loading project details...</p>
        </div>
      </UserLayout>
    );
  }

  if (!project) {
    return (
      <UserLayout>
        <div className="project-error">
          <div className="error-icon">⚠️</div>
          <h2>Project Not Found</h2>
          <p>This project may be deleted or unavailable.</p>
          <button className="back-btn" onClick={() => navigate("/project")}>
            Return to Projects
          </button>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="project-detail-container">
        <div className="project-detail-card">
          {/* Header Section */}
          <div className="project-header">
            <button className="back-btn-small" onClick={() => navigate("/project")}>
              ← Back
            </button>
            <h1 className="project-detail-title">{project.title}</h1>
            {project.createdBy && (
  <div className="creator-info" style={{marginTop:8, fontSize:'15px', color:'#2e7d32', fontWeight:'600'}}>
    <span>👤 Created by:</span>
    <span style={{marginLeft:6}}>
      {project.createdBy.name || project.createdBy.email || project.createdBy._id}
    </span>
  </div>
)}

            
            <div className="project-badges">
              {project.department && (
                <span className="badge badge-department">
                  <span className="badge-icon">📚</span>
                  {project.department}
                </span>
              )}
              {project.year && (
                <span className="badge badge-year">
                  <span className="badge-icon">📅</span>
                  {project.year}
                </span>
              )}
              {project.domain && (
                <span className="badge badge-domain">
                  {project.domain}
                </span>
              )}
            </div>
          </div>

          {/* Description Section */}
          <div className="project-section">
            <h3 className="section-title">
              <span className="section-icon">📝</span>
              Description
            </h3>
            <div className="section-content">
              <p className="project-detail-description">{project.description}</p>
            </div>
          </div>

          {/* Technologies Section */}
          {project.technologies && project.technologies.length > 0 && (
            <div className="project-section">
              <h3 className="section-title">
                <span className="section-icon">💻</span>
                Technologies Used
              </h3>
              <div className="section-content">
                <div className="tech-grid">
                  {project.technologies.map((tech, idx) => (
                    <span key={idx} className="tech-pill">{tech}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tags Section */}
          {project.tags && project.tags.length > 0 && (
            <div className="project-section">
              <h3 className="section-title">
                <span className="section-icon">🏷️</span>
                Tags
              </h3>
              <div className="section-content">
                <div className="tags-grid">
                  {project.tags.map((tag, idx) => (
                    <span key={idx} className="tag-pill">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="project-footer">
            <button className="action-btn secondary" onClick={() => navigate("/project")}>
              ← Back to Directory
            </button>
            <button className="action-btn primary">
              Rate Project
            </button>
          </div>
        </div>
      </div>
      <button hidden onClick={() => logoutUser(navigate)} id="force-logout">Logout</button>
    </UserLayout>
  );
};

export default ProjectId;
