import React, { useState } from 'react';
import { Package, ClipboardList, ArrowLeft } from 'lucide-react';
import BAPBForm from '../components/BAPBForm';
import BAPPForm from '../components/BAPPForm';
import { useNavigate } from 'react-router-dom';

type FormType = 'none' | 'bapb' | 'bapp';

const TambahLaporan: React.FC = () => {
  const [selectedForm, setSelectedForm] = useState<FormType>('none');
  const navigate = useNavigate();

  const handleFormSaved = (id: string, type: FormType) => {
    if (type === 'bapb') {
      navigate(`/bapb/${id}`);
    } else {
      navigate(`/bapp/${id}`);
    }
  };

  const handleBack = () => {
    setSelectedForm('none');
  };

  // Show selection screen
  if (selectedForm === 'none') {
    return (
      <div className="tambah-laporan-page">
        <div className="tambah-laporan-header">
          <h1 className="tambah-laporan-title">Tambah Laporan Baru</h1>
          <p className="tambah-laporan-subtitle">Pilih jenis laporan yang ingin Anda buat</p>
        </div>

        <div className="tambah-laporan-options">
          <button
            className="tambah-option-card"
            onClick={() => setSelectedForm('bapb')}
          >
            <div className="tambah-option-icon bapb">
              <Package size={32} />
            </div>
            <div className="tambah-option-content">
              <h3>Buat BAPB Baru</h3>
              <p>Berita Acara Penerimaan Barang</p>
            </div>
          </button>

          <button
            className="tambah-option-card"
            onClick={() => setSelectedForm('bapp')}
          >
            <div className="tambah-option-icon bapp">
              <ClipboardList size={32} />
            </div>
            <div className="tambah-option-content">
              <h3>Buat BAPP Baru</h3>
              <p>Berita Acara Pelaksanaan Pekerjaan</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Show BAPB Form
  if (selectedForm === 'bapb') {
    return (
      <div className="create-page">
        <div className="create-header">
          <button className="back-button" onClick={handleBack}>
            <ArrowLeft size={20} />
          </button>
          <div className="create-icon">
            <Package size={24} />
          </div>
          <div>
            <h1 className="create-title">Buat BAPB Baru</h1>
            <p className="create-subtitle">Isi formulir di bawah untuk membuat Berita Acara Penerimaan Barang</p>
          </div>
        </div>
        <div className="create-form-container">
          <BAPBForm onSaved={(id) => handleFormSaved(id, 'bapb')} />
        </div>
      </div>
    );
  }

  // Show BAPP Form
  return (
    <div className="create-page">
      <div className="create-header">
        <button className="back-button" onClick={handleBack}>
          <ArrowLeft size={20} />
        </button>
        <div className="create-icon">
          <ClipboardList size={24} />
        </div>
        <div>
          <h1 className="create-title">Buat BAPP Baru</h1>
          <p className="create-subtitle">Isi formulir di bawah untuk membuat Berita Acara Pelaksanaan Pekerjaan</p>
        </div>
      </div>
      <div className="create-form-container">
        <BAPPForm onSaved={(id) => handleFormSaved(id, 'bapp')} />
      </div>
    </div>
  );
};

export default TambahLaporan;

