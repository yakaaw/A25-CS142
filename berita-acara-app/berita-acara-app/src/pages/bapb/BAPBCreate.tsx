import React from 'react';
import BAPBForm from '../../components/BAPBForm';
import { useNavigate } from 'react-router-dom';

const BAPBCreate: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-4">Buat BAPB</h3>
      <div className="bg-white rounded shadow p-4">
        <BAPBForm onSaved={(id) => navigate(`/bapb/${id}`)} />
      </div>
    </div>
  );
};

export default BAPBCreate;
