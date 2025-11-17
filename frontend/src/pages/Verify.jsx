import React, { use, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { server } from '../main.jsx';
import Loading from './Loading.jsx';
import axios from 'axios';
import UserLayout from '../layout/userLayout/index.jsx';

const Verify = () => {

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true)
  const params = useParams();

  async function verifyUser() {
    try {
      const {data} = await axios.post(`${server}/api/v1/verify/${params.token}`);
      setSuccessMessage(data.message);
    } catch (error) {
      setErrorMessage(error.response.data.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    verifyUser();
  }, [])

  return (
    <UserLayout>
    {
      loading ? (<Loading />) : (
      <div>
      { successMessage && (<p>{successMessage}</p>)}
      { errorMessage && (<p>{errorMessage}</p>)}
    </div>)
    }
    </UserLayout>
  )
}

export default Verify