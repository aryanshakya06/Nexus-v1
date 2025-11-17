import React, { useEffect, useState } from 'react';
import { server } from '../main';
import axios from 'axios';
import { toast } from 'react-toastify';
import UserLayout from '../layout/userLayout';
import './Analytics.css';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${server}/api/v1/analytics`);
      
      if (data.success) {
        setAnalytics(data.data);
      } else {
        toast.error('Failed to fetch analytics');
      }
    } catch (err) {
      console.error('Analytics error:', err);
      toast.error(err.response?.data?.message || 'Error fetching analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="analytics-loading">
          <div className="analytics-loader"></div>
          <p>Loading analytics...</p>
        </div>
      </UserLayout>
    );
  }

  if (!analytics) {
    return (
      <UserLayout>
        <div className="analytics-error">
          <h2>No Data Available</h2>
          <p>Unable to load analytics at this time.</p>
        </div>
      </UserLayout>
    );
  }

  const getBarHeight = (count, max) => {
    return (count / max) * 100;
  };

  const maxTechCount = analytics.topTechnologies.length > 0 
    ? Math.max(...analytics.topTechnologies.map(t => t.count)) 
    : 1;

  const maxDomainCount = analytics.topDomains.length > 0 
    ? Math.max(...analytics.topDomains.map(d => d.count)) 
    : 1;

  const maxTagCount = analytics.topTags.length > 0 
    ? Math.max(...analytics.topTags.map(t => t.count)) 
    : 1;

  return (
    <UserLayout>
      <div className="analytics-container">
        {/* Header */}
        <div className="analytics-header">
          <h1 className="analytics-title">📊 Project Analytics Dashboard</h1>
          <div className="analytics-stat-card">
            <span className="stat-label">Total Projects</span>
            <span className="stat-value">{analytics.totalProjects}</span>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="charts-grid">
          
          {/* Top Technologies Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>💻 Most Featured Technologies</h3>
              <span className="chart-subtitle">Top 10 technologies used across projects</span>
            </div>
            <div className="chart-body">
              {analytics.topTechnologies.length > 0 ? (
                <div className="bar-chart">
                  {analytics.topTechnologies.map((tech, idx) => (
                    <div key={idx} className="bar-item">
                      <div className="bar-label">{tech.name}</div>
                      <div className="bar-wrapper">
                        <div 
                          className="bar tech-bar"
                          style={{ width: `${getBarHeight(tech.count, maxTechCount)}%` }}
                        >
                          <span className="bar-value">{tech.count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data">No technology data available</div>
              )}
            </div>
          </div>

          {/* Top Domains Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>🎯 Most Popular Domains</h3>
              <span className="chart-subtitle">Project distribution by domain</span>
            </div>
            <div className="chart-body">
              {analytics.topDomains.length > 0 ? (
                <div className="bar-chart">
                  {analytics.topDomains.map((domain, idx) => (
                    <div key={idx} className="bar-item">
                      <div className="bar-label">{domain.name}</div>
                      <div className="bar-wrapper">
                        <div 
                          className="bar domain-bar"
                          style={{ width: `${getBarHeight(domain.count, maxDomainCount)}%` }}
                        >
                          <span className="bar-value">{domain.count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data">No domain data available</div>
              )}
            </div>
          </div>

          {/* Top Tags Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>🏷️ Trending Tags</h3>
              <span className="chart-subtitle">Most frequently used project tags</span>
            </div>
            <div className="chart-body">
              {analytics.topTags.length > 0 ? (
                <div className="bar-chart">
                  {analytics.topTags.map((tag, idx) => (
                    <div key={idx} className="bar-item">
                      <div className="bar-label">#{tag.name}</div>
                      <div className="bar-wrapper">
                        <div 
                          className="bar tag-bar"
                          style={{ width: `${getBarHeight(tag.count, maxTagCount)}%` }}
                        >
                          <span className="bar-value">{tag.count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data">No tag data available</div>
              )}
            </div>
          </div>

          {/* Department Stats */}
          {analytics.departmentStats.length > 0 && (
            <div className="chart-card">
              <div className="chart-header">
                <h3>📚 Department Distribution</h3>
                <span className="chart-subtitle">Projects by department</span>
              </div>
              <div className="chart-body">
                <div className="stats-grid">
                  {analytics.departmentStats.map((dept, idx) => (
                    <div key={idx} className="stat-item">
                      <span className="stat-name">{dept.name}</span>
                      <span className="stat-count">{dept.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Year Stats */}
          {analytics.yearStats.length > 0 && (
            <div className="chart-card">
              <div className="chart-header">
                <h3>📅 Year-wise Distribution</h3>
                <span className="chart-subtitle">Projects by year</span>
              </div>
              <div className="chart-body">
                <div className="stats-grid">
                  {analytics.yearStats.map((year, idx) => (
                    <div key={idx} className="stat-item">
                      <span className="stat-name">{year.name}</span>
                      <span className="stat-count">{year.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </UserLayout>
  );
};

export default Analytics;
