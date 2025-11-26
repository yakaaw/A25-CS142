import React from 'react';
import BAPPForm from '../../components/BAPPForm';
import { useNavigate } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';

const BAPPCreate: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="create-page">
      <div className="create-header">
        <div className="create-icon">
          <ClipboardList size={24} />
        </div>
        <div>
          <h1 className="create-title">Buat BAPP Baru</h1>
          <p className="create-subtitle">Isi formulir di bawah untuk membuat Berita Acara Pelaksanaan Pekerjaan</p>
        </div>
      </div>
      <div className="create-form-container">
        <BAPPForm onSaved={(id) => navigate(`/bapp/${id}`)} />
      </div>
    </div>
  );
};

export default BAPPCreate;
