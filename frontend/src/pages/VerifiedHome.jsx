import React from 'react'
import { AppData } from '../context/AppContext'
import { Link, useNavigate } from 'react-router-dom';
import UserLayout from '../layout/userLayout';

const VerifiedHome = () => {
  const { user, isAuth } = AppData();
  const { logoutUser } = AppData();
  const navigate = useNavigate();

  return (
    <UserLayout>
      <div className="home">
      <hr />
      {isAuth && <h2>Welcome, {localStorage.getItem("name")}</h2>}
      <hr />
      <div>
        <section>
          <h2 style={{textAlign: "center"}}>Explore Projects!</h2>
          <div style={{display: "flex", flexDirection: "row", gap: "5rem", alignItems: "center", justifyContent: "center"} }>
            <span>You are free to explore the innovation.&nbsp;&nbsp;&nbsp;<a href="/project">View Projects</a></span>
          </div>
        </section>
        <hr />
        <section>
          <h2>About us!</h2>
          <div style={{display: "flex", flexDirection: "row", gap: "5rem", alignItems: "center", justifyContent: "center"} }>
            <p>Nexus is a modern, student-first platform built to simplify collaboration, innovation, and personal growth.
                    Our mission is to create a seamless digital space where students can showcase their skills, discover opportunities, and connect with like-minded creators.
                  
                    At Nexus, we believe that every idea—big or small—deserves a place to grow.
                    Whether you want to build projects, join communities, explore learning resources, or collaborate with talented individuals, Nexus brings everything together under one unified platform.
                    </p>
                    <img src="https://media.istockphoto.com/id/1406097162/vector/people-work-on-project.jpg?s=612x612&w=0&k=20&c=naTQcz0E3Vy-9ezCUCh6d7Uy_C0wxpO5JqSmOw2gUNE=" alt="" />
          </div>
        </section>
        <hr />
      </div>
    </div>
    <button hidden onClick={() => logoutUser(navigate)} id="force-logout">Logout</button>
    </UserLayout>
  )
}

export default VerifiedHome;