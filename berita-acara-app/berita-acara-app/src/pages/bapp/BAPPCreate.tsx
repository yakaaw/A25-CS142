import React from 'react';
import BAPPForm from '../../components/BAPPForm';
import { useNavigate } from 'react-router-dom';

const BAPPCreate: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-4">Buat BAPP</h3>
      <div className="bg-white rounded shadow p-4">
        <BAPPForm onSaved={(id) => navigate(`/bapp/${id}`)} />
      </div>
    </div>
  );
};

export default BAPPCreate;
