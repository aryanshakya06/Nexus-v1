import { extractMetadataWithGemini } from "../config/extractMetaData.js";
import Project from "../models/Project.js";

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ active: true });
    res.status(200).json({success: true, projects: projects});
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id).populate('createdBy', 'name email');
    if (!project || !project.active) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.status(200).json(project);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project || !project.active) {
      return res.status(404).json({ error: "Project not found" });
    }
    if (project.createdBy.toString() !== req.user._id) {
      return res.status(403).json({ error: "Not authorized to delete this project" });
    }
    project.active = false;
    await project.save();
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const { title, description, department, year } = req.body;
    console.log(req.user);
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User info missing"
      });
    }

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description required"
      });
    }

    // Extract metadata
    const aiMetaData = (await extractMetadataWithGemini(title, description)) || {};
    console.log("AI Metadata:", aiMetaData);

    const newProject = new Project({
      title,
      description,
      department,
      year,
      technologies: aiMetaData.technologies || [],
      domain: aiMetaData.domain || "",
      tags: aiMetaData.tags || [],
      createdBy: req.user._id,   
    });

    await newProject.save();

    return res.status(200).json({
      success: true,
      data: newProject,
      message: "Project Created Successfully",
    });

  } catch (error) {
    console.error("Project Creation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Project Creation Failed"
    });
  }
};

export const getProjectAnalytics = async (req, res) => {
  try {
    const projects = await Project.find({ active: true });

    // Technology Analysis
    const techCount = {};
    projects.forEach(project => {
      if (project.technologies && Array.isArray(project.technologies)) {
        project.technologies.forEach(tech => {
          techCount[tech] = (techCount[tech] || 0) + 1;
        });
      }
    });

    // Domain Analysis
    const domainCount = {};
    projects.forEach(project => {
      if (project.domain) {
        domainCount[project.domain] = (domainCount[project.domain] || 0) + 1;
      }
    });

    // Tags Analysis
    const tagCount = {};
    projects.forEach(project => {
      if (project.tags && Array.isArray(project.tags)) {
        project.tags.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      }
    });

    // Department Analysis
    const departmentCount = {};
    projects.forEach(project => {
      if (project.department) {
        departmentCount[project.department] = (departmentCount[project.department] || 0) + 1;
      }
    });

    // Year Analysis
    const yearCount = {};
    projects.forEach(project => {
      if (project.year) {
        yearCount[project.year] = (yearCount[project.year] || 0) + 1;
      }
    });

    // Sort and get top items
    const topTechnologies = Object.entries(techCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    const topDomains = Object.entries(domainCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    const topTags = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    const departmentStats = Object.entries(departmentCount)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    const yearStats = Object.entries(yearCount)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    res.status(200).json({
      success: true,
      data: {
        totalProjects: projects.length,
        topTechnologies,
        topDomains,
        topTags,
        departmentStats,
        yearStats,
      }
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics"
    });
  }
};