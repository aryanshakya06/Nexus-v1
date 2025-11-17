import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { server } from '../main';
import axios from 'axios';
import { toast } from 'react-toastify';
import UserLayout from '../layout/userLayout';
import api from '../../apiInterceptor';
import { AppData } from '../context/AppContext';

const CreateProject = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  const { logoutUser } = AppData();

  const navigate = useNavigate();

  const submitHandler = async (e) => {
    setBtnLoading(true);
    e.preventDefault();
    try {
      const { data } = await api.post(`${server}/api/v1/project`, {
        title,
        description,
        department,
        year
      });
      
      toast.success(data.message);
      
      if (data.success) {
        navigate("/project");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Project creation failed");
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <UserLayout>
      <div className="form-container">
        <form  onSubmit={submitHandler}>
          <h2>Create New Project</h2>
          
          <div>
            <input 
              placeholder="Project Title" 
              type="text" 
              id="title" 
              name="title" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required
            />
          </div>
          
          <div>
            <input 
              placeholder="Project Description" 
              type="text"
              id="description" 
              name="description" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              style={{height: "150px"}}
              required
            />
          </div>
          
          <div>
            <input 
              placeholder="Department (Optional)" 
              type="text" 
              id="department" 
              name="department" 
              value={department} 
              onChange={e => setDepartment(e.target.value)}
            />
          </div>
          
          <div>
            <input 
              placeholder="Year (Optional)" 
              type="text" 
              id="year" 
              name="year" 
              value={year} 
              onChange={e => setYear(e.target.value)}
            />
          </div>
          
          <button disabled={btnLoading}>
            {btnLoading ? "Creating..." : "Create Project"}
          </button>
        </form>
      </div>
      <button hidden onClick={() => logoutUser(navigate)} id="force-logout">Logout</button>
    </UserLayout>
  );
};

export default CreateProject;
