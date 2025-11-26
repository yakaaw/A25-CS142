import React from 'react';
import BAPPForm from '../../components/BAPPForm';
import { useNavigate } from 'react-router-dom';

const BAPPCreate: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="create-page">
      <h3 className="create-title">Buat BAPP</h3>
      <div className="create-form-container">
        <BAPPForm onSaved={(id) => navigate(`/bapp/${id}`)} />
      </div>
    </div>
  );
};

export default BAPPCreate;
