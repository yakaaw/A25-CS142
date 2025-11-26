import React from 'react';
import BAPBForm from '../../components/BAPBForm';
import { useNavigate } from 'react-router-dom';

const BAPBCreate: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="create-page">
      <h3 className="create-title">Buat BAPB</h3>
      <div className="create-form-container">
        <BAPBForm onSaved={(id) => navigate(`/bapb/${id}`)} />
      </div>
    </div>
  );
};

export default BAPBCreate;
