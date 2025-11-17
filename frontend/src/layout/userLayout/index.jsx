import { AppData } from "../../context/AppContext";
import './index.css'

const UserLayout = ({ children }) => {
  const { user, isAuth } = AppData();

  return (
    <div id="user-layout">
      <div className="header">

        <h2 className="heading">Nexus</h2>

        {!isAuth && (
          <nav>
            <a href="/">Home</a>
            <a href="/login">Login</a>
            <a href="/register">Sign Up</a>
            <a href="/contact-us">Contact Us</a>
          </nav>
        )}

        {isAuth && (
          <nav>
            <a href="/">Home</a>
            <a href="/profile">Profile</a>
            <label htmlFor="force-logout">Logout</label>
            <a href="/contact-us">Contact Us</a>
          </nav>
        )}
      </div>

      <main>{children}</main>
      <footer>&copy; All Rights Preserved</footer>
    </div>
  );
};

export default UserLayout;
