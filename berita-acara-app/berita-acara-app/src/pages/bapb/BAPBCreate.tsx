import React from 'react';
import BAPBForm from '../../components/BAPBForm';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';

const BAPBCreate: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="create-page">
      <div className="create-header">
        <div className="create-icon">
          <FileText size={24} />
        </div>
        <div>
          <h1 className="create-title">Buat BAPB Baru</h1>
          <p className="create-subtitle">Isi formulir di bawah untuk membuat Berita Acara Penerimaan Barang</p>
        </div>
      </div>
      <div className="create-form-container">
        <BAPBForm onSaved={(id) => navigate(`/bapb/${id}`)} />
      </div>
    </div>
  );
};

export default BAPBCreate;
