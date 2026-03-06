import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

const isAuthenticated = () => !!localStorage.getItem('accessToken');

export default function App() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}